/* -*- mode: javascript; tab-width: 2; indent-tabs-mode: nil; -*-
*
* Copyright (c) 2011-2014 Marcus Geelnard
*
* This file is part of SoundBox.
*
* SoundBox is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* SoundBox is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with SoundBox.  If not, see <http://www.gnu.org/licenses/>.
*
*/

//------------------------------------------------------------------------------
// External dependencies
//------------------------------------------------------------------------------

include("demo-songs.js");
include("presets.js");
include("player.js");
include("jammer.js");
include("rle.js");

include("third_party/deflate.js");
include("third_party/inflate.js");
include("third_party/Blob.js");
include("third_party/FileSaver.js");
include("third_party/WebMIDIAPI.js");

"use strict";


//------------------------------------------------------------------------------
// Local classes for easy access to binary data
//------------------------------------------------------------------------------

var CBinParser = function (d) {
  var mData = d;
  var mPos = 0;

  this.getUBYTE = function () {
    return mData.charCodeAt(mPos++) & 255;
  };

  this.getUSHORT = function () {
    var l = (mData.charCodeAt(mPos) & 255) |
            ((mData.charCodeAt(mPos + 1) & 255) << 8);
    mPos += 2;
    return l;
  };

  this.getULONG = function () {
    var l = (mData.charCodeAt(mPos) & 255) |
            ((mData.charCodeAt(mPos + 1) & 255) << 8) |
            ((mData.charCodeAt(mPos + 2) & 255) << 16) |
            ((mData.charCodeAt(mPos + 3) & 255) << 24);
    mPos += 4;
    return l;
  };

  this.getFLOAT = function () {
    var l = this.getULONG();
    if (l == 0) return 0;
    var s = l & 0x80000000;                       // Sign
    var e = (l >> 23) & 255;                      // Exponent
    var m = 1 + ((l & 0x007fffff) / 0x00800000);  // Mantissa
    var x = m * Math.pow(2, e - 127);
    return s ? -x : x;
  };

  this.getTail = function () {
    var str = mData.slice(mPos);
    mPos = mData.length;
    return str;
  };
};

var CBinWriter = function () {
  var mData = "";

  this.putUBYTE = function (x) {
    mData += String.fromCharCode(x);
  };

  this.putUSHORT = function (x) {
    mData += String.fromCharCode(
               x & 255,
               (x >> 8) & 255
             );
  };

  this.putULONG = function (x) {
    mData += String.fromCharCode(
               x & 255,
               (x >> 8) & 255,
               (x >> 16) & 255,
               (x >> 24) & 255
             );
  };

  this.putFLOAT = function (x) {
    var l = 0;
    if (x != 0)
    {
      var s = 0;
      if (x < 0) s = 0x80000000, x = -x;
      var e = 127 + 23;
      while (x < 0x00800000)
      {
        x *= 2;
        e--;
      }
      while (x >= 0x01000000)
      {
        x /= 2;
        e++;
      }
      l = s | ((e & 255) << 23) | (x & 0x007fffff);
    }
    this.putULONG(l);
  };

  this.append = function (x) {
    mData += x;
  };

  this.getData = function () {
    return mData;
  };
};


//------------------------------------------------------------------------------
// Helper class for getting high precision timing info from an audio element
// (e.g. Firefox Audio.currentTime has < 60 Hz precision, leading to choppy
// animations etc).
//------------------------------------------------------------------------------

var CAudioTimer = function () {
  var mAudioElement = null;
  var mStartT = 0;
  var mErrHist = [0, 0, 0, 0, 0, 0];
  var mErrHistPos = 0;

  this.setAudioElement = function (audioElement) {
    mAudioElement = audioElement;
  }

  this.currentTime = function () {
    if (!mAudioElement)
      return 0;

    // Calculate current time according to Date()
    var t = (new Date()).getTime() * 0.001;
    var currentTime = t - mStartT;

    // Get current time according to the audio element
    var audioCurrentTime = mAudioElement.currentTime;

    // Check if we are off by too much - in which case we will use the time
    // from the audio element
    var err = audioCurrentTime - currentTime;
    if (audioCurrentTime < 0.01 || err > 0.2 || err < -0.2) {
      currentTime = audioCurrentTime;
      mStartT = t - currentTime;
      for (var i = 0; i < mErrHist.length; i++)
        mErrHist[i] = 0;
    }

    // Error compensation (this should fix the problem when we're constantly
    // slightly off)
    var comp = 0;
    for (var i = 0; i < mErrHist.length; i++)
      comp += mErrHist[i];
    comp /= mErrHist.length;
    mErrHist[mErrHistPos] = err;
    mErrHistPos = (mErrHistPos + 1) % mErrHist.length;

    return currentTime + comp;
  };

  this.reset = function () {
    mStartT = (new Date()).getTime() * 0.001;
    for (var i = 0; i < mErrHist.length; i++)
      mErrHist[i] = 0;
  };
};


//------------------------------------------------------------------------------
// GUI class
//------------------------------------------------------------------------------

var CGUI = function()
{
  // Edit modes
  var EDIT_NONE = 0,
      EDIT_SEQUENCE = 1,
      EDIT_PATTERN = 2,
      EDIT_FXTRACK = 3;

  // Misc constants
  var MAX_SONG_ROWS = 128,
      MAX_PATTERNS = 36;

  // Edit/gui state
  var mEditMode = EDIT_PATTERN,
      mKeyboardOctave = 5,
      mPatternCol = 0,
      mPatternRow = 0,
      mPatternCol2 = 0,
      mPatternRow2 = 0,
      mSeqCol = 0,
      mSeqRow = 0,
      mSeqCol2 = 0,
      mSeqRow2 = 0,
      mFxTrackRow = 0,
      mFxTrackRow2 = 0,
      mSelectingSeqRange = false,
      mSelectingPatternRange = false,
      mSelectingFxRange = false,
      mSeqCopyBuffer = [],
      mPatCopyBuffer = [],
      mFxCopyBuffer = [],
      mInstrCopyBuffer = [];

  // Parsed URL data
  var mBaseURL;
  var mGETParams;

  // Resources
  var mSong = {};
  var mAudio = null;
  var mAudioTimer = new CAudioTimer();
  var mPlayer = new CPlayer();
  var mPlayGfxVUImg = new Image();
  var mPlayGfxLedOffImg = new Image();
  var mPlayGfxLedOnImg = new Image();
  var mJammer = new CJammer();

  // Constant look-up-tables
  var mNoteNames = [
    'C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'
  ];

  var mBlackKeyPos = [
    26, 1, 63, 3, 116, 6, 150, 8, 184, 10, 238, 13, 274, 15, 327, 18, 362, 20, 394, 22
  ];

  // Prealoaded resources
  var mPreload = [];


  //--------------------------------------------------------------------------
  // URL parsing & generation
  //--------------------------------------------------------------------------

  var getURLBase = function (url) {
    var queryStart = url.indexOf("?");
    return url.slice(0, queryStart >= 0 ? queryStart : url.length);
  };

  var parseURLGetData = function (url) {
    var queryStart = url.indexOf("?") + 1;
    var queryEnd   = url.indexOf("#") + 1 || url.length + 1;
    var query      = url.slice(queryStart, queryEnd - 1);

    var params = {};
    if (query === url || query === "")
      return params;

    var nvPairs = query.replace(/\+/g, " ").split("&");

    for (var i=0; i<nvPairs.length; i++) {
      var nv = nvPairs[i].split("=");
      var n  = decodeURIComponent(nv[0]);
      var v  = decodeURIComponent(nv[1]);
      if ( !(n in params) ) {
        params[n] = [];
      }
      params[n].push(nv.length === 2 ? v : null);
    }
    return params;
  };

  var getURLSongData = function (dataParam) {
    var songData = undefined;
    if (dataParam) {
      var str = dataParam, str2 = "";
      if (str.indexOf("data:") == 0) {
        // This is a data: URI (e.g. data:application/x-extension-sbx;base64,....)
        var idx = str.indexOf("base64,");
        if (idx > 0)
          str2 = str.substr(idx + 7);
      } else {
        // This is GET data from an http URL
        for (var i = 0; i < str.length; ++i) {
          var chr = str[i];
          if (chr === "-") chr = "+";
          if (chr === "_") chr = "/";
          str2 += chr;
        }
      }
      try {
        songData = atob(str2);
      }
      catch (err) {
        songData = undefined;
      }
    }
    return songData;
  };

  var makeURLSongData = function (data) {
    var str = btoa(data), str2 = "";
    for (var i = 0; i < str.length; ++i) {
      var chr = str[i];
      if (chr === "+") chr = "-";
      if (chr === "/") chr = "_";
      if (chr === "=") chr = "";
      str2 += chr;
    }
    return mBaseURL + "?data=" + str2;
  };


  //--------------------------------------------------------------------------
  // Song import/export functions
  //--------------------------------------------------------------------------

  var calcSamplesPerRow = function (bpm) {
    return Math.round((60 * 44100 / 4) / bpm);
  };

  var getBPM = function () {
    return Math.round((60 * 44100 / 4) / mSong.rowLen);
  };

  // Instrument property indices
  var OSC1_WAVEFORM = 0,
      OSC1_VOL = 1,
      OSC1_SEMI = 2,
      OSC1_XENV = 3,

      OSC2_WAVEFORM = 4,
      OSC2_VOL = 5,
      OSC2_SEMI = 6,
      OSC2_DETUNE = 7,
      OSC2_XENV = 8,

      NOISE_VOL = 9,

      ENV_ATTACK = 10,
      ENV_SUSTAIN = 11,
      ENV_RELEASE = 12,

      ARP_CHORD = 13,
      ARP_SPEED = 14,

      LFO_WAVEFORM = 15,
      LFO_AMT = 16,
      LFO_FREQ = 17,
      LFO_FX_FREQ = 18,

      FX_FILTER = 19,
      FX_FREQ = 20,
      FX_RESONANCE = 21,
      FX_DIST = 22,
      FX_DRIVE = 23,
      FX_PAN_AMT = 24,
      FX_PAN_FREQ = 25,
      FX_DELAY_AMT = 26,
      FX_DELAY_TIME = 27;


  var makeNewSong = function () {
    var song = {}, i, j, k, instr, col;

    // Row length
    song.rowLen = calcSamplesPerRow(120);
  
    // Last pattern to play
    song.endPattern = 2;

    // Rows per pattern
    song.patternLen = 32;

    // Select the default instrument from the presets
    var defaultInstr;
    for (i = 0; i < gInstrumentPresets.length; ++i) {
      if (gInstrumentPresets[i].i) {
        defaultInstr = gInstrumentPresets[i];
        break;
      }
    }

    // All 8 instruments
    song.songData = [];
    for (i = 0; i < 8; i++) {
      instr = {};
      instr.i = [];

      // Copy the default instrument
      for (j = 0; j <= defaultInstr.i.length; ++j) {
        instr.i[j] = defaultInstr.i[j];
      }

      // Sequence
      instr.p = [];
      for (j = 0; j < MAX_SONG_ROWS; j++)
        instr.p[j] = 0;

      // Patterns
      instr.c = [];
      for (j = 0; j < MAX_PATTERNS; j++)
      {
        col = {};
        col.n = [];
        for (k = 0; k < song.patternLen * 4; k++)
          col.n[k] = 0;
        col.f = [];
        for (k = 0; k < song.patternLen * 2; k++)
          col.f[k] = 0;
        instr.c[j] = col;
      }

      song.songData[i] = instr;
    }

    // Make a first empty pattern
    song.songData[0].p[0] = 1;

    return song;
  };

  var songToBin = function (song) {
    var bin = new CBinWriter();

    // Row length (i.e. song speed)
    bin.putULONG(song.rowLen);

    // Last pattern to play
    bin.putUBYTE(song.endPattern - 2);

    // Rows per pattern
    bin.putUBYTE(song.patternLen);

    // All 8 instruments
    var i, j, k, instr, col;
    for (i = 0; i < 8; i++) {
      instr = song.songData[i];

      // Oscillator 1
      bin.putUBYTE(instr.i[OSC1_WAVEFORM]);
      bin.putUBYTE(instr.i[OSC1_VOL]);
      bin.putUBYTE(instr.i[OSC1_SEMI]);
      bin.putUBYTE(instr.i[OSC1_XENV]);

      // Oscillator 2
      bin.putUBYTE(instr.i[OSC2_WAVEFORM]);
      bin.putUBYTE(instr.i[OSC2_VOL]);
      bin.putUBYTE(instr.i[OSC2_SEMI]);
      bin.putUBYTE(instr.i[OSC2_DETUNE]);
      bin.putUBYTE(instr.i[OSC2_XENV]);

      // Noise oscillator
      bin.putUBYTE(instr.i[NOISE_VOL]);

      // Envelope
      bin.putUBYTE(instr.i[ENV_ATTACK]);
      bin.putUBYTE(instr.i[ENV_SUSTAIN]);
      bin.putUBYTE(instr.i[ENV_RELEASE]);

      // Arpeggio
      bin.putUBYTE(instr.i[ARP_CHORD]);
      bin.putUBYTE(instr.i[ARP_SPEED]);

      // LFO
      bin.putUBYTE(instr.i[LFO_WAVEFORM]);
      bin.putUBYTE(instr.i[LFO_AMT]);
      bin.putUBYTE(instr.i[LFO_FREQ]);
      bin.putUBYTE(instr.i[LFO_FX_FREQ]);

      // Effects
      bin.putUBYTE(instr.i[FX_FILTER]);
      bin.putUBYTE(instr.i[FX_FREQ]);
      bin.putUBYTE(instr.i[FX_RESONANCE]);
      bin.putUBYTE(instr.i[FX_DIST]);
      bin.putUBYTE(instr.i[FX_DRIVE]);
      bin.putUBYTE(instr.i[FX_PAN_AMT]);
      bin.putUBYTE(instr.i[FX_PAN_FREQ]);
      bin.putUBYTE(instr.i[FX_DELAY_AMT]);
      bin.putUBYTE(instr.i[FX_DELAY_TIME]);

      // Patterns
      for (j = 0; j < MAX_SONG_ROWS; j++)
        bin.putUBYTE(instr.p[j]);

      // Columns
      for (j = 0; j < MAX_PATTERNS; j++) {
        col = instr.c[j];
        for (k = 0; k < song.patternLen * 4; k++)
          bin.putUBYTE(col.n[k]);
        for (k = 0; k < song.patternLen * 2; k++)
          bin.putUBYTE(col.f[k]);
      }
    }

    // Pack the song data
    // FIXME: To avoid bugs, we try different compression methods here until we
    // find something that works (this should not be necessary).
    var unpackedData = bin.getData(), packedData, testData, compressionMethod = 0;
    for (i = 9; i > 0; i--) {
      packedData = RawDeflate.deflate(unpackedData, i);
      testData = RawDeflate.inflate(packedData);
      if (unpackedData === testData) {
        compressionMethod = 2;
        break;
      }
    }
    if (compressionMethod == 0) {
      packedData = rle_encode(bin.getData());
      testData = rle_decode(packedData);
      if (unpackedData === testData)
        compressionMethod = 1;
      else
        packedData = unpackedData;
    }

    // Create a new binary stream - this is the actual file
    bin = new CBinWriter();

    // Signature ("SBox")
    bin.putULONG(2020557395);

    // Format version
    bin.putUBYTE(11);

    // Compression method
    //  0: none
    //  1: RLE
    //  2: DEFLATE
    bin.putUBYTE(compressionMethod);

    // Append packed data
    bin.append(packedData);

    return bin.getData();
  };

  var soundboxBinToSong = function (d) {
    var bin = new CBinParser(d);
    var song = {};

    // Signature
    var signature = bin.getULONG();

    // Format version
    var version = bin.getUBYTE();

    // Check if this is a SoundBox song
    if (signature != 2020557395 || (version < 1 || version > 11))
      return undefined;

    if (version >= 8) {
      // Get compression method
      //  0: none
      //  1: RLE
      //  2: DEFLATE
      var compressionMethod = bin.getUBYTE();

      // Unpack song data
      var packedData = bin.getTail(), unpackedData;
      switch (compressionMethod) {
      default:
      case 0:
        unpackedData = packedData;
        break;
      case 1:
        unpackedData = rle_decode(packedData);
        break;
      case 2:
        unpackedData = RawDeflate.inflate(packedData);
        break;
      }
      bin = new CBinParser(unpackedData);
    }

    // Row length
    song.rowLen = bin.getULONG();

    // Last pattern to play
    song.endPattern = bin.getUBYTE() + 2;

    // Number of rows per pattern
    if (version >= 10)
      song.patternLen = bin.getUBYTE();
    else
      song.patternLen = 32;

    // All 8 instruments
    song.songData = [];
    var i, j, k, instr, col;
    for (i = 0; i < 8; i++) {
      instr = {};
      instr.i = [];

      // Oscillator 1
      if (version < 6) {
        instr.i[OSC1_SEMI] = bin.getUBYTE();
        instr.i[OSC1_XENV] = bin.getUBYTE();
        instr.i[OSC1_VOL] = bin.getUBYTE();
        instr.i[OSC1_WAVEFORM] = bin.getUBYTE();
      }
      else {
        instr.i[OSC1_WAVEFORM] = bin.getUBYTE();
        instr.i[OSC1_VOL] = bin.getUBYTE();
        instr.i[OSC1_SEMI] = bin.getUBYTE();
        instr.i[OSC1_XENV] = bin.getUBYTE();
      }

      // Oscillator 2
      if (version < 6) {
        instr.i[OSC2_SEMI] = bin.getUBYTE();
        instr.i[OSC2_DETUNE] = bin.getUBYTE();
        instr.i[OSC2_XENV] = bin.getUBYTE();
        instr.i[OSC2_VOL] = bin.getUBYTE();
        instr.i[OSC2_WAVEFORM] = bin.getUBYTE();
      }
      else {
        instr.i[OSC2_WAVEFORM] = bin.getUBYTE();
        instr.i[OSC2_VOL] = bin.getUBYTE();
        instr.i[OSC2_SEMI] = bin.getUBYTE();
        instr.i[OSC2_DETUNE] = bin.getUBYTE();
        instr.i[OSC2_XENV] = bin.getUBYTE();
      }

      // Noise oscillator
      instr.i[NOISE_VOL] = bin.getUBYTE();

      // Envelope
      if (version < 5) {
        instr.i[ENV_ATTACK] = Math.round(Math.sqrt(bin.getULONG()) / 2);
        instr.i[ENV_SUSTAIN] = Math.round(Math.sqrt(bin.getULONG()) / 2);
        instr.i[ENV_RELEASE] = Math.round(Math.sqrt(bin.getULONG()) / 2);
      }
      else {
        instr.i[ENV_ATTACK] = bin.getUBYTE();
        instr.i[ENV_SUSTAIN] = bin.getUBYTE();
        instr.i[ENV_RELEASE] = bin.getUBYTE();
      }

      // Arpeggio
      if (version < 11) {
        instr.i[ARP_CHORD] = 0;
        instr.i[ARP_SPEED] = 0;
      }
      else {
        instr.i[ARP_CHORD] = bin.getUBYTE();
        instr.i[ARP_SPEED] = bin.getUBYTE();
      }

      if (version < 6) {
        // Effects
        instr.i[FX_FILTER] = bin.getUBYTE();
        if (version < 5)
          instr.i[FX_FREQ] = Math.round(bin.getUSHORT() / 43.23529);
        else
          instr.i[FX_FREQ] = bin.getUBYTE();
        instr.i[FX_RESONANCE] = bin.getUBYTE();

        instr.i[FX_DELAY_TIME] = bin.getUBYTE();
        instr.i[FX_DELAY_AMT] = bin.getUBYTE();
        instr.i[FX_PAN_FREQ] = bin.getUBYTE();
        instr.i[FX_PAN_AMT] = bin.getUBYTE();
        instr.i[FX_DIST] = bin.getUBYTE();
        instr.i[FX_DRIVE] = bin.getUBYTE();

        // LFO
        instr.i[LFO_FX_FREQ] = bin.getUBYTE();
        instr.i[LFO_FREQ] = bin.getUBYTE();
        instr.i[LFO_AMT] = bin.getUBYTE();
        instr.i[LFO_WAVEFORM] = bin.getUBYTE();
      }
      else {
        // LFO
        instr.i[LFO_WAVEFORM] = bin.getUBYTE();
        instr.i[LFO_AMT] = bin.getUBYTE();
        instr.i[LFO_FREQ] = bin.getUBYTE();
        instr.i[LFO_FX_FREQ] = bin.getUBYTE();

        // Effects
        instr.i[FX_FILTER] = bin.getUBYTE();
        instr.i[FX_FREQ] = bin.getUBYTE();
        instr.i[FX_RESONANCE] = bin.getUBYTE();
        instr.i[FX_DIST] = bin.getUBYTE();
        instr.i[FX_DRIVE] = bin.getUBYTE();
        instr.i[FX_PAN_AMT] = bin.getUBYTE();
        instr.i[FX_PAN_FREQ] = bin.getUBYTE();
        instr.i[FX_DELAY_AMT] = bin.getUBYTE();
        instr.i[FX_DELAY_TIME] = bin.getUBYTE();
      }

      // Patterns
      var song_rows = version < 9 ? 48 : MAX_SONG_ROWS;
      instr.p = [];
      for (j = 0; j < song_rows; j++)
        instr.p[j] = bin.getUBYTE();
      for (j = song_rows; j < MAX_SONG_ROWS; j++)
        instr.p[j] = 0;

      // Columns
      var num_patterns = version < 9 ? 10 : MAX_PATTERNS;
      instr.c = [];
      for (j = 0; j < num_patterns; j++) {
        col = {};
        col.n = [];
        if (version == 1) {
          for (k = 0; k < song.patternLen; k++) {
            col.n[k] = bin.getUBYTE();
            col.n[k+song.patternLen] = 0;
            col.n[k+2*song.patternLen] = 0;
            col.n[k+3*song.patternLen] = 0;
          }
        }
        else {
          for (k = 0; k < song.patternLen * 4; k++)
            col.n[k] = bin.getUBYTE();
        }
        col.f = [];
        if (version < 4) {
          for (k = 0; k < song.patternLen * 2; k++)
            col.f[k] = 0;
        }
        else {
          for (k = 0; k < song.patternLen; k++) {
            var fxCmd = bin.getUBYTE();
            // We inserted two new commands in version 11
            if (version < 11 && fxCmd >= 14)
              fxCmd += 2;
            col.f[k] = fxCmd;
          }
          for (k = 0; k < song.patternLen; k++)
            col.f[song.patternLen + k] = bin.getUBYTE();
        }
        instr.c[j] = col;
      }
      for (j = num_patterns; j < MAX_PATTERNS; j++) {
        col = {};
        col.n = [];
        for (k = 0; k < song.patternLen * 4; k++)
          col.n[k] = 0;
        col.f = [];
        for (k = 0; k < song.patternLen * 2; k++)
          col.f[k] = 0;
        instr.c[j] = col;
      }

      // Fixup conversions
      if (version < 3) {
        if (instr.i[OSC1_WAVEFORM] == 2)
          instr.i[OSC1_VOL] = Math.round(instr.i[OSC1_VOL]/2);
        if (instr.i[OSC2_WAVEFORM] == 2)
          instr.i[OSC2_VOL] = Math.round(instr.i[OSC2_VOL]/2);
        if (instr.i[LFO_WAVEFORM] == 2)
          instr.i[LFO_AMT] = Math.round(instr.i[LFO_AMT]/2);
        instr.i[FX_DRIVE] = instr.i[FX_DRIVE] < 224 ? instr.i[FX_DRIVE] + 32 : 255;
      }
      if (version < 7)
        instr.i[FX_RESONANCE] = 255 - instr.i[FX_RESONANCE];

      song.songData[i] = instr;
    }

    return song;
  };

  var sonantBinToSong = function (d) {
    // Check if this is a sonant song (correct length & reasonable end pattern)
    if (d.length != 3333)
      return undefined;
    if ((d.charCodeAt(3332) & 255) > 48)
      return undefined;

    var bin = new CBinParser(d);
    var song = {};

    // Row length
    song.rowLen = bin.getULONG();

    // Number of rows per pattern
    song.patternLen = 32;

    // All 8 instruments
    song.songData = [];
    var i, j, k, instr, col, master;
    for (i = 0; i < 8; i++) {
      instr = {};
      instr.i = [];

      // Oscillator 1
      instr.i[OSC1_SEMI] = 12 * (bin.getUBYTE() - 8) + 128;
      instr.i[OSC1_SEMI] += bin.getUBYTE();
      bin.getUBYTE(); // Skip (detune)
      instr.i[OSC1_XENV] = bin.getUBYTE();
      instr.i[OSC1_VOL] = bin.getUBYTE();
      instr.i[OSC1_WAVEFORM] = bin.getUBYTE();

      // Oscillator 2
      instr.i[OSC2_SEMI] = 12 * (bin.getUBYTE() - 8) + 128;
      instr.i[OSC2_SEMI] += bin.getUBYTE();
      instr.i[OSC2_DETUNE] = bin.getUBYTE();
      instr.i[OSC2_XENV] = bin.getUBYTE();
      instr.i[OSC2_VOL] = bin.getUBYTE();
      instr.i[OSC2_WAVEFORM] = bin.getUBYTE();

      // Noise oscillator
      instr.i[NOISE_VOL] = bin.getUBYTE();
      bin.getUBYTE(); // Pad!
      bin.getUBYTE(); // Pad!
      bin.getUBYTE(); // Pad!

      // Envelope
      instr.i[ENV_ATTACK] = Math.round(Math.sqrt(bin.getULONG()) / 2);
      instr.i[ENV_SUSTAIN] = Math.round(Math.sqrt(bin.getULONG()) / 2);
      instr.i[ENV_RELEASE] = Math.round(Math.sqrt(bin.getULONG()) / 2);
      master = bin.getUBYTE(); // env_master

      // Effects
      instr.i[FX_FILTER] = bin.getUBYTE();
      bin.getUBYTE(); // Pad!
      bin.getUBYTE(); // Pad!
      instr.i[FX_FREQ] = Math.round(bin.getFLOAT() / 43.23529);
      instr.i[FX_RESONANCE] = 255 - bin.getUBYTE();
      instr.i[FX_DELAY_TIME] = bin.getUBYTE();
      instr.i[FX_DELAY_AMT] = bin.getUBYTE();
      instr.i[FX_PAN_FREQ] = bin.getUBYTE();
      instr.i[FX_PAN_AMT] = bin.getUBYTE();
      instr.i[FX_DIST] = 0;
      instr.i[FX_DRIVE] = 32;

      // Arpeggio
      instr.i[ARP_CHORD] = 0;
      instr.i[ARP_SPEED] = 0;

      // LFO
      bin.getUBYTE(); // Skip! (lfo_osc1_freq)
      instr.i[LFO_FX_FREQ] = bin.getUBYTE();
      instr.i[LFO_FREQ] = bin.getUBYTE();
      instr.i[LFO_AMT] = bin.getUBYTE();
      instr.i[LFO_WAVEFORM] = bin.getUBYTE();

      // Patterns
      instr.p = [];
      for (j = 0; j < 48; j++)
        instr.p[j] = bin.getUBYTE();
      for (j = 48; j < MAX_SONG_ROWS; j++)
        instr.p[j] = 0;

      // Columns
      instr.c = [];
      for (j = 0; j < 10; j++) {
        col = {};
        col.n = [];
        for (k = 0; k < 32; k++) {
          col.n[k] = bin.getUBYTE();
          col.n[k+32] = 0;
          col.n[k+64] = 0;
          col.n[k+96] = 0;
        }
        col.f = [];
        for (k = 0; k < 32 * 2; k++)
          col.f[k] = 0;
        instr.c[j] = col;
      }
      for (j = 10; j < MAX_PATTERNS; j++) {
        col = {};
        col.n = [];
        for (k = 0; k < 32 * 4; k++)
          col.n[k] = 0;
        col.f = [];
        for (k = 0; k < 32 * 2; k++)
          col.f[k] = 0;
        instr.c[j] = col;
      }

      bin.getUBYTE(); // Pad!
      bin.getUBYTE(); // Pad!

      // Fixup conversions
      if (instr.i[FX_FILTER] < 1 || instr.i[FX_FILTER] > 3) {
        instr.i[FX_FILTER] = 2;
        instr.i[FX_FREQ] = 255; // 11025;
      }
      instr.i[OSC1_VOL] *= master / 255;
      instr.i[OSC2_VOL] *= master / 255;
      instr.i[NOISE_VOL] *= master / 255;
      if (instr.i[OSC1_WAVEFORM] == 2)
        instr.i[OSC1_VOL] /= 2;
      if (instr.i[OSC2_WAVEFORM] == 2)
        instr.i[OSC2_VOL] /= 2;
      if (instr.i[LFO_WAVEFORM] == 2)
        instr.i[LFO_AMT] /= 2;
      instr.i[OSC1_VOL] = Math.round(instr.i[OSC1_VOL]);
      instr.i[OSC2_VOL] = Math.round(instr.i[OSC2_VOL]);
      instr.i[NOISE_VOL] = Math.round(instr.i[NOISE_VOL]);
      instr.i[LFO_AMT] = Math.round(instr.i[LFO_AMT]);

      song.songData[i] = instr;
    }
  
    // Last pattern to play
    song.endPattern = bin.getUBYTE() + 2;

    return song;
  };

  var binToSong = function (d) {
    // Try to parse the binary data as a SoundBox song
    var song = soundboxBinToSong(d);

    // Try to parse the binary data as a Sonant song
    if (!song)
      song = sonantBinToSong(d);

    // If we couldn't parse the song, just make a clean new song
    if (!song) {
      alert("Song format not recognized.");
      return undefined;
    }

    return song;
  };

  var songToJS = function (song) {
    var i, j, k;
    var jsData = "";
  
    jsData += "    // This music has been exported by SoundBox. You can use it with\n";
    jsData += "    // http://sb.bitsnbites.eu/player-small.js in your own product.\n\n";

    jsData += "    // See http://sb.bitsnbites.eu/demo.html for an example of how to\n";
    jsData += "    // use it in a demo.\n\n";

    jsData += "    // Song data\n";
    jsData += "    var song = {\n";

    jsData += "      songData: [\n";
    for (i = 0; i < 8; i++) {
      var instr = song.songData[i];
      jsData += "        { // Instrument " + i + "\n";
      jsData += "          i: [\n";
      jsData += "          " + instr.i[OSC1_WAVEFORM] + ", // OSC1_WAVEFORM\n";
      jsData += "          " + instr.i[OSC1_VOL] + ", // OSC1_VOL\n";
      jsData += "          " + instr.i[OSC1_SEMI] + ", // OSC1_SEMI\n";
      jsData += "          " + instr.i[OSC1_XENV] + ", // OSC1_XENV\n";
      jsData += "          " + instr.i[OSC2_WAVEFORM] + ", // OSC2_WAVEFORM\n";
      jsData += "          " + instr.i[OSC2_VOL] + ", // OSC2_VOL\n";
      jsData += "          " + instr.i[OSC2_SEMI] + ", // OSC2_SEMI\n";
      jsData += "          " + instr.i[OSC2_DETUNE] + ", // OSC2_DETUNE\n";
      jsData += "          " + instr.i[OSC2_XENV] + ", // OSC2_XENV\n";
      jsData += "          " + instr.i[NOISE_VOL] + ", // NOISE_VOL\n";
      jsData += "          " + instr.i[ENV_ATTACK] + ", // ENV_ATTACK\n";
      jsData += "          " + instr.i[ENV_SUSTAIN] + ", // ENV_SUSTAIN\n";
      jsData += "          " + instr.i[ENV_RELEASE] + ", // ENV_RELEASE\n";
      jsData += "          " + instr.i[ARP_CHORD] + ", // ARP_CHORD\n";
      jsData += "          " + instr.i[ARP_SPEED] + ", // ARP_SPEED\n";
      jsData += "          " + instr.i[LFO_WAVEFORM] + ", // LFO_WAVEFORM\n";
      jsData += "          " + instr.i[LFO_AMT] + ", // LFO_AMT\n";
      jsData += "          " + instr.i[LFO_FREQ] + ", // LFO_FREQ\n";
      jsData += "          " + instr.i[LFO_FX_FREQ] + ", // LFO_FX_FREQ\n";
      jsData += "          " + instr.i[FX_FILTER] + ", // FX_FILTER\n";
      jsData += "          " + instr.i[FX_FREQ] + ", // FX_FREQ\n";
      jsData += "          " + instr.i[FX_RESONANCE] + ", // FX_RESONANCE\n";
      jsData += "          " + instr.i[FX_DIST] + ", // FX_DIST\n";
      jsData += "          " + instr.i[FX_DRIVE] + ", // FX_DRIVE\n";
      jsData += "          " + instr.i[FX_PAN_AMT] + ", // FX_PAN_AMT\n";
      jsData += "          " + instr.i[FX_PAN_FREQ] + ", // FX_PAN_FREQ\n";
      jsData += "          " + instr.i[FX_DELAY_AMT] + ", // FX_DELAY_AMT\n";
      jsData += "          " + instr.i[FX_DELAY_TIME] + " // FX_DELAY_TIME\n";
      jsData += "          ],\n";

      // Sequencer data for this instrument
      jsData += "          // Patterns\n";
      jsData += "          p: [";
      var lastRow = song.endPattern - 2;
      var maxPattern = 0, lastNonZero = 0;
      for (j = 0; j <= lastRow; j++) {
        var pattern = instr.p[j];
        if (pattern > maxPattern)
          maxPattern = pattern;
        if (pattern)
          lastNonZero = j;
      }
      for (j = 0; j <= lastNonZero; j++) {
        var pattern = instr.p[j];
        if (pattern)
          jsData += pattern;
        if (j < lastNonZero)
          jsData += ",";
      }
      jsData += "],\n";

      // Pattern data for this instrument
      jsData += "          // Columns\n";
      jsData += "          c: [\n";
      for (j = 0; j < maxPattern; j++) {
        jsData += "            {n: [";
        lastNonZero = 0;
        for (k = 0; k < song.patternLen * 4; k++) {
          if (instr.c[j].n[k])
            lastNonZero = k;
        }
        for (k = 0; k <= lastNonZero; k++) {
          var note = instr.c[j].n[k];
          if (note)
            jsData += note;
          if (k < lastNonZero)
            jsData += ",";
        }
        jsData += "],\n";
        jsData += "             f: [";
        lastNonZero = 0;
        for (k = 0; k < song.patternLen * 2; k++) {
          if (instr.c[j].f[k])
            lastNonZero = k;
        }
        for (k = 0; k <= lastNonZero; k++) {
          var fx = instr.c[j].f[k];
          if (fx)
            jsData += fx;
          if (k < lastNonZero)
            jsData += ",";
        }
        jsData += "]}";
        if (j < maxPattern - 1)
          jsData += ",";
        jsData += "\n";
      }
      jsData += "          ]\n";
      jsData += "        }";
      if (i < 7)
        jsData += ",";
      jsData += "\n";
    }
    
    jsData += "      ],\n";
    jsData += "      rowLen: " + song.rowLen + ",   // In sample lengths\n";
    jsData += "      patternLen: " + song.patternLen + ",  // Rows per pattern\n";
    jsData += "      endPattern: " + song.endPattern + "  // End pattern\n";
    jsData += "    };\n";

    return jsData;
  };


  //----------------------------------------------------------------------------
  // Midi interaction.
  // Based on example code by Chris Wilson.
  //----------------------------------------------------------------------------

  var mSelectMIDI;
  var mMIDIAccess;
  var mMIDIIn;

  var midiMessageReceived = function (ev) {
    var cmd = ev.data[0] >> 4;
    var channel = ev.data[0] & 0xf;
    var noteNumber = ev.data[1];
    var velocity = ev.data[2];

    if (channel == 9) {
      return;
    }

    if (cmd == 9 && velocity > 0) {
      // Note on (note on with velocity zero is the same as note off).
      // NOTE: Note no. 69 is A4 (440 Hz), which is note no. 57 in SoundBox.
      playNote(noteNumber - 12);
    } else if (cmd == 14) {
      // Pitch wheel
      var pitch = ((velocity * 128.0 + noteNumber)-8192) / 8192.0;
      // TODO(m): We could use this for controlling something. I think it would
      // be neat to use the pitch wheel for moving up/down in the pattern
      // editor.
    }
  };

  var selectMIDIIn = function (ev) {
    mMIDIIn = mMIDIAccess.inputs()[mSelectMIDI.selectedIndex];
    mMIDIIn.onmidimessage = midiMessageReceived;
  };

  var onMIDIStarted = function (midi) {
    mMIDIAccess = midi;

    var list = mMIDIAccess.inputs();

    // Detect preferred device.
    var preferredIndex = 0;
    for (var i = 0; i < list.length; i++) {
      var str = list[i].name.toString().toLowerCase();
      if ((str.indexOf("keyboard") != -1)) {
        preferredIndex = i;
        break;
      }
    }

    // Populate the MIDI input selection drop down box.
    mSelectMIDI.options.length = 0;
    if (list.length) {
      for (var i = 0; i < list.length; i++) {
        mSelectMIDI.options[i] = new Option(list[i].name, list[i].fingerprint,
            i == preferredIndex, i == preferredIndex);
      }

      mMIDIIn = list[preferredIndex];
      mMIDIIn.onmidimessage = midiMessageReceived;

      mSelectMIDI.onchange = selectMIDIIn;

      // Show the MIDI input selection box.
      mSelectMIDI.style.display = "inline";
    }
  };

  var onMIDISystemError = function (err) {
    // TODO(m): Log an error message somehow (err.code)...
  };

  var initMIDI = function () {
    if (navigator.requestMIDIAccess) {
      mSelectMIDI = document.getElementById("midiInput");
      navigator.requestMIDIAccess().then(onMIDIStarted, onMIDISystemError);
    }
  };


  //--------------------------------------------------------------------------
  // Helper functions
  //--------------------------------------------------------------------------

  var preloadImage = function (url)
  {
    var img = new Image();
    img.src = url;
    mPreload.push(img);
  };

  var initPresets = function()
  {
    var parent = document.getElementById("instrPreset");
    var o, instr;
    for (var i = 0; i < gInstrumentPresets.length; ++i)
    {
      instr = gInstrumentPresets[i];
      o = document.createElement("option");
      o.value = instr.i ? "" + i : "";
      o.appendChild(document.createTextNode(instr.name));
      parent.appendChild(o);
    }
  };

  var getElementPos = function (o)
  {
    var left = 0, top = 0;
    if (o.offsetParent)
    {
      do {
        left += o.offsetLeft;
        top += o.offsetTop;
      } while (o = o.offsetParent);
    }
    return [left, top];
  };

  var getEventElement = function (e)
  {
    var o = null;
    if (!e) var e = window.event;
    if (e.target)
      o = e.target;
    else if (e.srcElement)
      o = e.srcElement;
    if (o.nodeType == 3) // defeat Safari bug
      o = o.parentNode;
    return o;
  };

  var getMousePos = function (e, rel)
  {
    // Get the mouse document position
    var p = [0, 0];
    if (e.pageX && e.pageY)
    {
      p = [e.pageX, e.pageY];
    }
    else if (e.clientX && e.clientY)
    {
      p = [e.clientX + document.body.scrollLeft +
           document.documentElement.scrollLeft,
           e.clientY + document.body.scrollTop +
           document.documentElement.scrollTop];
    }
    else if (e.touches && e.touches.length > 0) {
      p = [e.touches[0].clientX + document.body.scrollLeft +
           document.documentElement.scrollLeft,
           e.touches[0].clientY + document.body.scrollTop +
           document.documentElement.scrollTop];
    }

    if (!rel) return p;

    // Get the element document position
    var pElem = getElementPos(getEventElement(e));
    return [p[0] - pElem[0], p[1] - pElem[1]];
  };

  var unfocusHTMLInputElements = function () {
    document.getElementById("bpm").blur();
    document.getElementById("rpp").blur();
    document.getElementById("instrPreset").blur();
  };

  var setEditMode = function (mode) {
    if (mode === mEditMode)
      return;
    mEditMode = mode;

    // Set the style for the different edit sections
    document.getElementById("sequencer").className = (mEditMode == EDIT_SEQUENCE ? "edit" : "");
    document.getElementById("pattern").className = (mEditMode == EDIT_PATTERN ? "edit" : "");
    document.getElementById("fxtrack").className = (mEditMode == EDIT_FXTRACK ? "edit" : "");

    // Unfocus any focused input elements
    if (mEditMode != EDIT_NONE)
    {
      unfocusHTMLInputElements();
      updateSongSpeed();
      updatePatternLength();
    }
  };

  var updateSongInfo = function() {
    document.getElementById("bpm").value = getBPM();
    document.getElementById("rpp").value = mSong.patternLen;
  };

  var updateSequencer = function (scrollIntoView, selectionOnly) {
    // Update sequencer element contents and selection
    for (var i = 0; i < MAX_SONG_ROWS; ++i)
    {
      for (var j = 0; j < 8; ++j)
      {
        var o = document.getElementById("sc" + j + "r" + i);
        if (!selectionOnly)
        {
          var pat = mSong.songData[j].p[i];
          if (pat > 0)
            o.innerHTML = "" + (pat <= 10 ? pat - 1 : String.fromCharCode(64 + pat - 10));
          else
            o.innerHTML = "";
        }
        if (i >= mSeqRow && i <= mSeqRow2 &&
            j >= mSeqCol && j <= mSeqCol2)
          o.className ="selected";
        else
          o.className = "";
      }
    }

    // Scroll the row into view? (only when needed)
    if (scrollIntoView) {
      var o = document.getElementById("spr" + mSeqRow);
      if (o.scrollIntoView) {
        var so = document.getElementById("sequencer");
        var oy = o.offsetTop - so.scrollTop;
        if (oy < 0 || (oy + 10) > so.offsetHeight)
          o.scrollIntoView(oy < 0);
      }
    }
  };

  var updatePattern = function (scrollIntoView, selectionOnly) {
    buildPatternTable();
    var singlePattern = (mSeqCol == mSeqCol2 && mSeqRow == mSeqRow2);
    var pat = singlePattern ? mSong.songData[mSeqCol].p[mSeqRow] - 1 : -1;
    for (var i = 0; i < mSong.patternLen; ++i)
    {
      for (var j = 0; j < 4; ++j)
      {
        var o = document.getElementById("pc" + j + "r" + i);
        if (!selectionOnly) {
          var noteName = "";
          if (pat >= 0)
          {
            var n = mSong.songData[mSeqCol].c[pat].n[i+j*mSong.patternLen] - 87;
            if (n > 0)
              noteName = mNoteNames[n % 12] + Math.floor(n / 12);
          }
          if (o.innerHTML != noteName)
            o.innerHTML = noteName;
        }
        if (i >= mPatternRow && i <= mPatternRow2 &&
            j >= mPatternCol && j <= mPatternCol2)
          o.className ="selected";
        else
          o.className = "";
      }
    }

    // Scroll the row into view? (only when needed)
    if (scrollIntoView & singlePattern) {
      var o = document.getElementById("pc0r" + mPatternRow);
      if (o.scrollIntoView) {
        var so = document.getElementById("pattern");
        var oy = o.offsetTop - so.scrollTop;
        if (oy < 0 || (oy + 10) > so.offsetHeight)
          o.scrollIntoView(oy < 0);
      }
    }
  };

  var toHex = function (num, count) {
    var s = num.toString(16).toUpperCase();
    var leadingZeros = count - s.length;
    for (var i = 0; i < leadingZeros; ++i)
      s = "0" + s;
    return s;
  };

  var updateFxTrack = function (scrollIntoView, selectionOnly) {
    buildFxTable();
    var singlePattern = (mSeqCol == mSeqCol2 && mSeqRow == mSeqRow2);
    var pat = singlePattern ? mSong.songData[mSeqCol].p[mSeqRow] - 1 : -1;
    for (var i = 0; i < mSong.patternLen; ++i) {
      var o = document.getElementById("fxr" + i);
      if (!selectionOnly) {
        var fxTxt = ":";
        if (pat >= 0) {
          var fxCmd = mSong.songData[mSeqCol].c[pat].f[i];
          if (fxCmd) {
            var fxVal = mSong.songData[mSeqCol].c[pat].f[i+mSong.patternLen];
            fxTxt = toHex(fxCmd,2) + ":" + toHex(fxVal,2);
          }
        }
        if (o.innerHTML != fxTxt)
          o.innerHTML = fxTxt;
      }
      if (i >= mFxTrackRow && i <= mFxTrackRow2)
        o.className ="selected";
      else
        o.className = "";
    }

    // Scroll the row into view? (only when needed)
    if (scrollIntoView & singlePattern) {
      var o = document.getElementById("fxr" + mFxTrackRow);
      if (o.scrollIntoView) {
        var so = document.getElementById("fxtrack");
        var oy = o.offsetTop - so.scrollTop;
        if (oy < 0 || (oy + 10) > so.offsetHeight)
          o.scrollIntoView(oy < 0);
      }
    }
  };

  var setSelectedPatternCell = function (col, row) {
    mPatternCol = col;
    mPatternRow = row;
    mPatternCol2 = col;
    mPatternRow2 = row;
    for (var i = 0; i < mSong.patternLen; ++i) {
      for (var j = 0; j < 4; ++j) {
        var o = document.getElementById("pc" + j + "r" + i);
        if (i == row && j == col)
          o.className ="selected";
        else
          o.className = "";
      }
    }
    updatePattern(true, true);
  };

  var setSelectedPatternCell2 = function (col, row) {
    mPatternCol2 = col >= mPatternCol ? col : mPatternCol;
    mPatternRow2 = row >= mPatternRow ? row : mPatternRow;
    for (var i = 0; i < mSong.patternLen; ++i) {
      for (var j = 0; j < 4; ++j) {
        var o = document.getElementById("pc" + j + "r" + i);
        if (i >= mPatternRow && i <= mPatternRow2 &&
            j >= mPatternCol && j <= mPatternCol2)
          o.className ="selected";
        else
          o.className = "";
      }
    }
    updatePattern(false, true);
  };

  var setSelectedSequencerCell = function (col, row) {
    mSeqCol = col;
    mSeqRow = row;
    mSeqCol2 = col;
    mSeqRow2 = row;
    updateSequencer(true, true);
  };

  var setSelectedSequencerCell2 = function (col, row) {
    mSeqCol2 = col >= mSeqCol ? col : mSeqCol;
    mSeqRow2 = row >= mSeqRow ? row : mSeqRow;
    updateSequencer(false, true);
  };

  var setSelectedFxTrackRow = function (row) {
    mFxTrackRow = row;
    mFxTrackRow2 = row;
    for (var i = 0; i < mSong.patternLen; ++i) {
      var o = document.getElementById("fxr" + i);
      if (i >= mFxTrackRow && i <= mFxTrackRow2)
        o.className ="selected";
      else
        o.className = "";
    }
    updateFxTrack(true, true);
  };

  var setSelectedFxTrackRow2 = function (row) {
    mFxTrackRow2 = row >= mFxTrackRow ? row : mFxTrackRow;
    for (var i = 0; i < mSong.patternLen; ++i) {
      var o = document.getElementById("fxr" + i);
      if (i >= mFxTrackRow && i <= mFxTrackRow2)
        o.className ="selected";
      else
        o.className = "";
    }
    updateFxTrack(false, true);
  };

  var playNote = function (n) {
    // Calculate note number and trigger a new note in the jammer.
    var note = n + 87;
    mJammer.addNote(note);

    // Edit pattern if we're in pattern edit mode.
    if (mEditMode == EDIT_PATTERN &&
        mSeqCol == mSeqCol2 && mSeqRow == mSeqRow2 &&
        mPatternCol == mPatternCol2 && mPatternRow == mPatternRow2)
    {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        mSong.songData[mSeqCol].c[pat].n[mPatternRow + mPatternCol*mSong.patternLen] = note;
        setSelectedPatternCell(mPatternCol, (mPatternRow + 1) % mSong.patternLen);
        updatePattern();
        return true;
      }
    }
    return false;
  };

  var updateSlider = function (o, x) {
    var props = o.sliderProps;
    var pos = (x - props.min) / (props.max - props.min);
    pos = pos < 0 ? 0 : (pos > 1 ? 1 : pos);
    if (props.nonLinear)
    {
      pos = Math.sqrt(pos);
    }
    o.style.marginLeft = Math.round(120 * pos) + "px";
  };

  var updateCheckBox = function (o, check) {
    o.src = check ? "media/graphics/toggle_on.svg" : "media/graphics/toggle_off.svg";
  };

  var clearPresetSelection = function () {
    var o = document.getElementById("instrPreset");
    o.selectedIndex = 0;
  };

  var updateInstrument = function (resetPreset) {
    var instr = mSong.songData[mSeqCol];

    // Oscillator 1
    document.getElementById("osc1_wave_sin").src = instr.i[OSC1_WAVEFORM] == 0 ? "media/graphics/wave_sin_sel.svg" : "media/graphics/wave_sin.svg";
    document.getElementById("osc1_wave_sqr").src = instr.i[OSC1_WAVEFORM] == 1 ? "media/graphics/wave_sqr_sel.svg" : "media/graphics/wave_sqr.svg";
    document.getElementById("osc1_wave_saw").src = instr.i[OSC1_WAVEFORM] == 2 ? "media/graphics/wave_saw_sel.svg" : "media/graphics/wave_saw.svg";
    document.getElementById("osc1_wave_tri").src = instr.i[OSC1_WAVEFORM] == 3 ? "media/graphics/wave_tri_sel.svg" : "media/graphics/wave_tri.svg";
    updateSlider(document.getElementById("osc1_vol"), instr.i[OSC1_VOL]);
    updateSlider(document.getElementById("osc1_semi"), instr.i[OSC1_SEMI]);
    updateCheckBox(document.getElementById("osc1_xenv"), instr.i[OSC1_XENV]);

    // Oscillator 2
    document.getElementById("osc2_wave_sin").src = instr.i[OSC2_WAVEFORM] == 0 ? "media/graphics/wave_sin_sel.svg" : "media/graphics/wave_sin.svg";
    document.getElementById("osc2_wave_sqr").src = instr.i[OSC2_WAVEFORM] == 1 ? "media/graphics/wave_sqr_sel.svg" : "media/graphics/wave_sqr.svg";
    document.getElementById("osc2_wave_saw").src = instr.i[OSC2_WAVEFORM] == 2 ? "media/graphics/wave_saw_sel.svg" : "media/graphics/wave_saw.svg";
    document.getElementById("osc2_wave_tri").src = instr.i[OSC2_WAVEFORM] == 3 ? "media/graphics/wave_tri_sel.svg" : "media/graphics/wave_tri.svg";
    updateSlider(document.getElementById("osc2_vol"), instr.i[OSC2_VOL]);
    updateSlider(document.getElementById("osc2_semi"), instr.i[OSC2_SEMI]);
    updateSlider(document.getElementById("osc2_det"), instr.i[OSC2_DETUNE]);
    updateCheckBox(document.getElementById("osc2_xenv"), instr.i[OSC2_XENV]);

    // Noise
    updateSlider(document.getElementById("noise_vol"), instr.i[NOISE_VOL]);

    // Envelope
    updateSlider(document.getElementById("env_att"), instr.i[ENV_ATTACK]);
    updateSlider(document.getElementById("env_sust"), instr.i[ENV_SUSTAIN]);
    updateSlider(document.getElementById("env_rel"), instr.i[ENV_RELEASE]);

    // Arpeggio
    updateSlider(document.getElementById("arp_note1"), instr.i[ARP_CHORD] >> 4);
    updateSlider(document.getElementById("arp_note2"), instr.i[ARP_CHORD] & 15);
    updateSlider(document.getElementById("arp_speed"), instr.i[ARP_SPEED]);

    // LFO
    document.getElementById("lfo_wave_sin").src = instr.i[LFO_WAVEFORM] == 0 ? "media/graphics/wave_sin_sel.svg" : "media/graphics/wave_sin.svg";
    document.getElementById("lfo_wave_sqr").src = instr.i[LFO_WAVEFORM] == 1 ? "media/graphics/wave_sqr_sel.svg" : "media/graphics/wave_sqr.svg";
    document.getElementById("lfo_wave_saw").src = instr.i[LFO_WAVEFORM] == 2 ? "media/graphics/wave_saw_sel.svg" : "media/graphics/wave_saw.svg";
    document.getElementById("lfo_wave_tri").src = instr.i[LFO_WAVEFORM] == 3 ? "media/graphics/wave_tri_sel.svg" : "media/graphics/wave_tri.svg";
    updateSlider(document.getElementById("lfo_amt"), instr.i[LFO_AMT]);
    updateSlider(document.getElementById("lfo_freq"), instr.i[LFO_FREQ]);
    updateCheckBox(document.getElementById("lfo_fxfreq"), instr.i[LFO_FX_FREQ]);

    // Effects
    document.getElementById("fx_filt_lp").src = instr.i[FX_FILTER] == 2 ? "gui/filt-lp-sel.png" : "gui/filt-lp.png";
    document.getElementById("fx_filt_hp").src = instr.i[FX_FILTER] == 1 ? "gui/filt-hp-sel.png" : "gui/filt-hp.png";
    document.getElementById("fx_filt_bp").src = instr.i[FX_FILTER] == 3 ? "gui/filt-bp-sel.png" : "gui/filt-bp.png";
    updateSlider(document.getElementById("fx_freq"), instr.i[FX_FREQ]);
    updateSlider(document.getElementById("fx_res"), instr.i[FX_RESONANCE]);
    updateSlider(document.getElementById("fx_dly_amt"), instr.i[FX_DELAY_AMT]);
    updateSlider(document.getElementById("fx_dly_time"), instr.i[FX_DELAY_TIME]);
    updateSlider(document.getElementById("fx_pan_amt"), instr.i[FX_PAN_AMT]);
    updateSlider(document.getElementById("fx_pan_freq"), instr.i[FX_PAN_FREQ]);
    updateSlider(document.getElementById("fx_dist"), instr.i[FX_DIST]);
    updateSlider(document.getElementById("fx_drive"), instr.i[FX_DRIVE]);

    // Clear the preset selection?
    if (resetPreset)
      clearPresetSelection();

    // Update the jammer instrument
    mJammer.updateInstr(instr.i);
  };

  var updateSongSpeed = function () {
    // Determine song speed
    var bpm = parseInt(document.getElementById("bpm").value);
    if (bpm && (bpm >= 10) && (bpm <= 1000)) {
      mSong.rowLen = calcSamplesPerRow(bpm);
      mJammer.updateRowLen(mSong.rowLen);
    }
  };

  var setPatternLength = function (length) {
    if (mSong.patternLen === length)
      return;

    // Stop song if it's currently playing (the song will be wrong and the
    // follower will be off)
    stopAudio();

    // Truncate/extend patterns
    var i, j, k, col, notes, fx;
    for (i = 0; i < 8; i++) {
      for (j = 0; j < MAX_PATTERNS; j++) {
        col = mSong.songData[i].c[j];
        notes = [];
        fx = [];
        for (k = 0; k < 4 * length; k++)
          notes[k] = 0;
        for (k = 0; k < 2 * length; k++)
          fx[k] = 0;
        for (k = 0; k < Math.min(mSong.patternLen, length); k++) {
          notes[k] = col.n[k];
          notes[k + length] = col.n[k + mSong.patternLen];
          notes[k + 2 * length] = col.n[k + 2 * mSong.patternLen];
          notes[k + 3 * length] = col.n[k + 3 * mSong.patternLen];
          fx[k] = col.f[k];
          fx[k + length] = col.f[k + mSong.patternLen];
        }
        col.n = notes;
        col.f = fx;
      }
    }

    // Update pattern length
    mSong.patternLen = length;
  };

  var updatePatternLength = function () {
    var rpp = parseInt(document.getElementById("rpp").value);
    if (rpp && (rpp >= 1) && (rpp <= 256)) {
      // Update the pattern length of the song data
      setPatternLength(rpp);

      // Update UI
      buildPatternTable();
      buildFxTable();
      updatePattern();
      updateFxTrack();
    }
  };

  var updateSongRanges = function () {
    var i, j, emptyRow;

    // Determine the last song pattern
    mSong.endPattern = MAX_SONG_ROWS + 1;
    for (i = MAX_SONG_ROWS - 1; i >= 0; --i) {
      emptyRow = true;
      for (j = 0; j < 8; ++j) {
        if (mSong.songData[j].p[i] > 0) {
          emptyRow = false;
          break;
        }
      }
      if (!emptyRow) break;
      mSong.endPattern--;
    }

    // Update the song speed
    updateSongSpeed();
  };

  var showDialog = function () {
    var e = document.getElementById("cover");
    e.style.visibility = "visible";
    e = document.getElementById("dialog");
    e.style.visibility = "visible";
    deactivateMasterEvents();
  };

  var hideDialog = function () {
    var e = document.getElementById("cover");
    e.style.visibility = "hidden";
    e = document.getElementById("dialog");
    e.style.visibility = "hidden";
    activateMasterEvents();
  };

  var showProgressDialog = function (msg) {
    var parent = document.getElementById("dialog");
    parent.innerHTML = "";

    // Create dialog content
    var o, o2;
    o = document.createElement("img");
    o.src = "gui/progress.gif";
    parent.appendChild(o);
    o = document.createTextNode(msg);
    parent.appendChild(o);
    o = document.createElement("div");
    o.id = "progressBarParent";
    parent.appendChild(o);
    o2 = document.createElement("div");
    o2.id = "progressBar";
    o.appendChild(o2);

    showDialog();
  };

  var loadSongFromData = function (songData) {
    var song = binToSong(songData);
    if (song) {
      stopAudio();
      mSong = song;
      updateSongInfo();
      updateSequencer();
      updatePattern();
      updateFxTrack();
      updateInstrument(true);
    }
  };

  var showOpenDialog = function () {
    var parent = document.getElementById("dialog");
    parent.innerHTML = "";

    // Create dialog content
    var o;
    o = document.createElement("h3");
    o.appendChild(document.createTextNode("Open song"));
    parent.appendChild(o);

    parent.appendChild(document.createElement("br"));

    var form = document.createElement("form");

    var listDiv = document.createElement("div");
    listDiv.style.textAlign = "left";
    listDiv.style.marginLeft = "30px";
    listDiv.style.lineHeight = "1.8em";

    // List demo songs...
    var demoSongsElements = [];
    for (var i = 0; i < gDemoSongs.length; i++) {
      o = document.createElement("input");
      o.type = "radio";
      o.name = "radiogroup1";
      o.value = gDemoSongs[i].name;
      if (i === 0)
        o.checked = true;
      demoSongsElements.push(o);
      listDiv.appendChild(o);
      o = document.createElement("span");
      o.innerHTML = gDemoSongs[i].description;
      listDiv.appendChild(o);
      listDiv.appendChild(document.createElement("br"));
    }

    // Add input for a custom data URL
    var customURLRadioElement = document.createElement("input");
    customURLRadioElement.type = "radio";
    customURLRadioElement.name = "radiogroup1";
    customURLRadioElement.value = "custom";
    listDiv.appendChild(customURLRadioElement);
    listDiv.appendChild(document.createTextNode(" Data URL: "));
    var customURLElement = document.createElement("input");
    customURLElement.type = "text";
    customURLElement.size = "45";
    customURLElement.title = "Paste a saved song data URL here";
    customURLElement.onchange = function () {
      customURLRadioElement.checked = true;
    };
    customURLElement.onkeydown = customURLElement.onchange;
    customURLElement.onclick = customURLElement.onchange;
    listDiv.appendChild(customURLElement);

    form.appendChild(listDiv);

    o = document.createElement("p");
    o.appendChild(document.createTextNode("Hint: You can also drag'n'drop binary files into the editor."));
    form.appendChild(o);

    form.appendChild(document.createElement("br"));

    o = document.createElement("input");
    o.type = "submit";
    o.value = "Open";
    o.title = "Open song";
    o.onclick = function (e) {
      e.preventDefault();

      var songData = null;
      if (customURLRadioElement.checked) {
        // Convert custom data URL to song data
        var params = parseURLGetData(customURLElement.value);
        songData = getURLSongData(params && params.data && params.data[0]);
      } else {
        // Pick a demo song
        for (var i = 0; i < demoSongsElements.length; i++) {
          var e = demoSongsElements[i];
          if (e.checked) {
            for (var j = 0; j < gDemoSongs.length; j++) {
              if (gDemoSongs[j].name === e.value) {
                if (gDemoSongs[j].data)
                  songData = gDemoSongs[j].data;
                else
                  songData = getURLSongData(gDemoSongs[j].base64);
                break;
              }
            }
            break;
          }
        }
      }

      // Load the song
      if (songData)
        loadSongFromData(songData);
      hideDialog();
    };
    form.appendChild(o);
    form.appendChild(document.createTextNode(" "));
    o = document.createElement("input");
    o.type = "submit";
    o.value = "Cancel";
    o.onclick = function () {
      hideDialog();
      return false;
    };
    form.appendChild(o);
    parent.appendChild(form);

    showDialog();
  };

  var showSaveDialog = function () {
    var parent = document.getElementById("dialog");
    parent.innerHTML = "";

    // Create dialog content
    var o, o2;
    o = document.createElement("h3");
    o.appendChild(document.createTextNode("Save song"));
    parent.appendChild(o);

    o = document.createElement("p");
    o.appendChild(document.createTextNode("Data URL (copy/paste, bookmark, mail etc):"));
    parent.appendChild(o);

    o = document.createElement("p");
    o2 = document.createElement("a");
    var url = makeURLSongData(songToBin(mSong));
    var shortURL = url.length < 70 ? url : url.slice(0,67) + "...";
    o2.href = url;
    o2.title = url;
    o2.appendChild(document.createTextNode(shortURL));
    o.appendChild(o2);
    parent.appendChild(o);

    var form = document.createElement("form");
    o = document.createElement("input");
    o.type = "submit";
    o.value = "Save binary";
    o.title = "Save the song as a binary file.";
    o.onclick = function () {
      var dataURI = "data:application/octet-stream;base64," + btoa(songToBin(mSong));
      window.open(dataURI);
      hideDialog();
      return false;
    };
    form.appendChild(o);
    o = document.createElement("input");
    o.type = "submit";
    o.value = "Close";
    o.onclick = function () {
      hideDialog();
      return false;
    };
    form.appendChild(o);

    parent.appendChild(form);

    showDialog();
  };

  var showAboutDialog = function () {
    var parent = document.getElementById("dialog");
    parent.innerHTML = "";

    // Create dialog content
    var o, o2;
    o = document.createElement("img");
    o.src = "gui/logo-big.png";
    parent.appendChild(o);

    o = document.createElement("p");
    o.appendChild(document.createTextNode("an HTML5 synth music tracker"));
    parent.appendChild(o);

    o = document.createElement("p");
    o.innerHTML = "Licensed under the <a href=\"gpl.txt\">GPL v3</a> license " +
                  "(get the <a href=\"https://github.com/mbitsnbites/soundbox\">source</a>).";
    o.style.fontStyle = "italic";
    parent.appendChild(o);

    o = document.createElement("p");
    o.appendChild(document.createTextNode("To get started, open a demo song."));
    parent.appendChild(o);

    o = document.createElement("a");
    o.href = "help.html";
    o.appendChild(document.createTextNode("Help"));
    parent.appendChild(o);
    parent.appendChild(document.createElement("br"));
    parent.appendChild(document.createElement("br"));

    var form = document.createElement("form");
    o = document.createElement("input");
    o.type = "submit";
    o.value = "Close";
    o.onclick = function () {
      hideDialog();
      return false;
    };
    form.appendChild(o);
    parent.appendChild(form);

    showDialog();
  };


  //--------------------------------------------------------------------------
  // Event handlers
  //--------------------------------------------------------------------------

  var about = function (e) {
    e.preventDefault();
    showAboutDialog();
  };

  var newSong = function (e) {
    mSong = makeNewSong();

    // Update GUI
    updateSongInfo();
    updateSequencer();
    updatePattern();
    updateFxTrack();
    updateInstrument();

    // Initialize the song
    setEditMode(EDIT_PATTERN);
    setSelectedPatternCell(0, 0);
    setSelectedSequencerCell(0, 0);
    setSelectedFxTrackRow(0);
    return false;
  };

  var openSong = function (e) {
    e.preventDefault();
    showOpenDialog();
  };

  var saveSong = function (e) {
    // Update song ranges
    updateSongRanges();

    showSaveDialog();

    e.preventDefault();
  };

  var exportWAV = function(e)
  {
    e.preventDefault();

    // Update song ranges
    updateSongRanges();

    // Generate audio data
    var doneFun = function (wave)
    {
      var blob = new Blob([wave], {type: "application/octet-stream"});
      saveAs(blob, "SoundBox-music.wav");
    };
    generateAudio(doneFun);
  };

  var exportJS = function(e)
  {
    // Update song ranges
    updateSongRanges();

    // Generate JS song data
    var dataURI = "data:text/javascript;base64," + btoa(songToJS(mSong));
    window.open(dataURI);
    return false;
  };

  var setStatus = function (msg)
  {
    document.getElementById("statusText").innerHTML = msg;
//    window.status = msg;
  };

  var generateAudio = function (doneFun, opts)
  {
    // Show dialog
    showProgressDialog("Generating sound...");

    // Start time measurement
    var d1 = new Date();

    // Generate audio data in a worker.
    mPlayer = new CPlayer();
    mPlayer.generate(mSong, opts, function (progress) {
      // Update progress bar
      var o = document.getElementById("progressBar");
      o.style.width = Math.floor(200 * progress) + "px";

      if (progress >= 1) {
        // Create the wave file
        var wave = mPlayer.createWave();

        // Stop time measurement
        var d2 = new Date();
        setStatus("Generation time: " + (d2.getTime() - d1.getTime())/1000 + "s");

        // Hide dialog
        hideDialog();

        // Call the callback function
        doneFun(wave);
      }
    });
  };

  var stopAudio = function () {
    stopFollower();
    if (mAudio) {
      mAudio.pause();
      mAudioTimer.reset();
    }
  };


  //----------------------------------------------------------------------------
  // Playback follower
  //----------------------------------------------------------------------------

  var mFollowerTimerID = -1;
  var mFollowerFirstRow = 0;
  var mFollowerLastRow = 0;
  var mFollowerFirstCol = 0;
  var mFollowerLastCol = 0;
  var mFollowerActive = false;
  var mFollowerLastVULeft = 0;
  var mFollowerLastVURight = 0;

  var getSamplesSinceNote = function (t, chan) {
    var nFloat = t * 44100 / mSong.rowLen;
    var n = Math.floor(nFloat);
    var seqPos0 = Math.floor(n / mSong.patternLen) + mFollowerFirstRow;
    var patPos0 = n % mSong.patternLen;
    for (var k = 0; k < mSong.patternLen; ++k) {
      var seqPos = seqPos0;
      var patPos = patPos0 - k;
      while (patPos < 0) {
        --seqPos;
        if (seqPos < mFollowerFirstRow) return -1;
        patPos += mSong.patternLen;
      }
      var pat = mSong.songData[chan].p[seqPos] - 1;
      for (var patCol = 0; patCol < 4; patCol++) {
        if (pat >= 0 && mSong.songData[chan].c[pat].n[patPos+patCol*mSong.patternLen] > 0)
          return (k + (nFloat - n)) * mSong.rowLen;
      }
    }
    return -1;
  };

  var redrawPlayerGfx = function (t)
  {
    var o = document.getElementById("playGfxCanvas");
    var w = mPlayGfxVUImg.width > 0 ? mPlayGfxVUImg.width : o.width;
    var h = mPlayGfxVUImg.height > 0 ? mPlayGfxVUImg.height : 51;
    var ctx = o.getContext("2d");
    if (ctx)
    {
      // Draw the VU meter BG
      ctx.drawImage(mPlayGfxVUImg, 0, 0);

      // Calculate singal powers
      var pl = 0, pr = 0;
      if (mFollowerActive && t >= 0)
      {
        // Get the waveform
        var wave = mPlayer.getData(t, 1000);

        // Calculate volume
        var i, l, r;
        var sl = 0, sr = 0, l_old = 0, r_old = 0;
        for (i = 1; i < wave.length; i += 2)
        {
          l = wave[i-1];
          r = wave[i];

          // Band-pass filter (low-pass + high-pass)
          sl = 0.8 * l + 0.1 * sl - 0.3 * l_old;
          sr = 0.8 * r + 0.1 * sr - 0.3 * r_old;
          l_old = l;
          r_old = r;

          // Sum of squares
          pl += sl * sl;
          pr += sr * sr;
        }

        // Low-pass filtered mean power (RMS)
        pl = Math.sqrt(pl / wave.length) * 0.2 + mFollowerLastVULeft * 0.8;
        pr = Math.sqrt(pr / wave.length) * 0.2 + mFollowerLastVURight * 0.8;
        mFollowerLastVULeft = pl;
        mFollowerLastVURight = pr;
      }

      // Convert to angles in the VU meter
      var a1 = pl > 0 ? 1.3 + 0.5 * Math.log(pl) : -1000;
      a1 = a1 < -1 ? -1 : a1 > 1 ? 1 : a1;
      a1 *= 0.57;
      var a2 = pr > 0 ? 1.3 + 0.5 * Math.log(pr) : -1000;
      a2 = a2 < -1 ? -1 : a2 > 1 ? 1 : a2;
      a2 *= 0.57;

      // Draw VU hands
      ctx.strokeStyle = "rgb(0,0,0)";
      ctx.beginPath();
      ctx.moveTo(w * 0.25, h * 2.1);
      ctx.lineTo(w * 0.25 + h * 1.8 * Math.sin(a1), h * 2.1 - h * 1.8 * Math.cos(a1));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.75, h * 2.1);
      ctx.lineTo(w * 0.75 + h * 1.8 * Math.sin(a2), h * 2.1 - h * 1.8 * Math.cos(a2));
      ctx.stroke();

      // Draw leds
      ctx.fillStyle = "rgb(0,0,0)";
      ctx.fillRect(0, h, w, 20);
      for (i = 0; i < 8; ++i)
      {
        // Draw un-lit led
        var x = Math.round(26 + 23.0 * i);
        ctx.drawImage(mPlayGfxLedOffImg, x, h);

        if (i >= mFollowerFirstCol && i <= mFollowerLastCol)
        {
          // Get envelope profile for this channel
          var env_a = mSong.songData[i].i[ENV_ATTACK],
              env_s = mSong.songData[i].i[ENV_SUSTAIN],
              env_r = mSong.songData[i].i[ENV_RELEASE];
          env_a = env_a * env_a * 4;
          env_r = env_s * env_s * 4 + env_r * env_r * 4;
          var env_tot = env_a + env_r;
          if (env_tot < 10000)
          {
            env_tot = 10000;
            env_r = env_tot - env_a;
          }

          // Get number of samples since last new note
          var numSamp = getSamplesSinceNote(t, i);
          if (numSamp >= 0 && numSamp < env_tot)
          {
            // Calculate current envelope (same method as the synth, except sustain)
            var alpha;
            if (numSamp < env_a)
              alpha = numSamp / env_a;
            else
              alpha = 1 - (numSamp - env_a) / env_r;

            // Draw lit led with alpha blending
            ctx.globalAlpha = alpha * alpha;
            ctx.drawImage(mPlayGfxLedOnImg, x, h);
            ctx.globalAlpha = 1.0;
          }
        }
      }
    }
  };

  var updateFollower = function () {
    if (mAudio == null)
      return;

    // Get current time
    var t = mAudioTimer.currentTime();

    // Are we past the play range (i.e. stop the follower?)
    if (mAudio.ended || (mAudio.duration && ((mAudio.duration - t) < 0.1))) {
      stopFollower();

      // Reset pattern position
      mPatternRow = 0;
      mPatternRow2 = 0;
      updatePattern();
      mFxTrackRow = 0;
      mFxTrackRow2 = 0;
      updateFxTrack();

      return;
    }

    // Calculate current song position
    var n = Math.floor(t * 44100 / mSong.rowLen);
    var seqPos = Math.floor(n / mSong.patternLen) + mFollowerFirstRow;
    var patPos = n % mSong.patternLen;

    // Have we stepped?
    var newSeqPos = (seqPos != mSeqRow);
    var newPatPos = newSeqPos || (patPos != mPatternRow);

    // Update the sequencer
    if (newSeqPos) {
      if (seqPos >= 0) {
        mSeqRow = seqPos;
        mSeqRow2 = seqPos;
        updateSequencer(true, true);
      }
      for (var i = 0; i < MAX_SONG_ROWS; ++i) {
        var o = document.getElementById("spr" + i);
        o.className = (i == seqPos ? "playpos" : "");
      }
    }

    // Update the pattern
    if (newPatPos) {
      if (patPos >= 0) {
        mPatternRow = patPos;
        mPatternRow2 = patPos;
        updatePattern(true, !newSeqPos);
        mFxTrackRow = patPos;
        mFxTrackRow2 = patPos;
        updateFxTrack(true, !newSeqPos);
      }
      for (var i = 0; i < mSong.patternLen; ++i) {
        var o = document.getElementById("ppr" + i);
        o.className = (i == patPos ? "playpos" : "");
      }
    }

    // Player graphics
    redrawPlayerGfx(t);
  };

  var startFollower = function () {
    // Update the sequencer selection
    mSeqRow = mFollowerFirstRow;
    mSeqRow2 = mFollowerFirstRow;
    mSeqCol2 = mSeqCol;
    updateSequencer(true, true);
    updatePattern();
    updateFxTrack();

    // Start the follower
    mFollowerActive = true;
    mFollowerTimerID = setInterval(updateFollower, 16);
  };

  var stopFollower = function ()
  {
    if (mFollowerActive)
    {
      // Stop the follower
      if (mFollowerTimerID !== -1) {
        clearInterval(mFollowerTimerID);
        mFollowerTimerID = -1;
      }

      // Clear the follower markers
      for (var i = 0; i < MAX_SONG_ROWS; ++i) {
        document.getElementById("spr" + i).className = "";
      }
      for (var i = 0; i < mSong.patternLen; ++i) {
        document.getElementById("ppr" + i).className = "";
      }

      // Clear player gfx
      redrawPlayerGfx(-1);

      mFollowerActive = false;
    }
  };

  //----------------------------------------------------------------------------
  // (end of playback follower)
  //----------------------------------------------------------------------------


  var playSong = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    // Stop the currently playing audio
    stopAudio();

    // Update song ranges
    updateSongRanges();

    // Select range to play
    mFollowerFirstRow = 0;
    mFollowerLastRow = mSong.endPattern - 2;
    mFollowerFirstCol = 0;
    mFollowerLastCol = 7;

    // Generate audio data
    var doneFun = function (wave)
    {
      if (mAudio == null)
      {
         alert("Audio element unavailable.");
         return;
      }

      try
      {
        // Start the follower
        startFollower();

        // Load the data into the audio element (it will start playing as soon
        // as the data has been loaded)
        mAudio.src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));

        // Hack
        mAudioTimer.reset();
        mAudio.play();
      }
      catch (err)
      {
        alert("Error playing: " + err.message);
      }
    };
    generateAudio(doneFun);
  };

  var playRange = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    // Stop the currently playing audio
    stopAudio();

    // Update song ranges
    updateSongRanges();

    // Select range to play
    var opts = {
      firstRow: mSeqRow,
      lastRow: mSeqRow2,
      firstCol: mSeqCol,
      lastCol: mSeqCol2
    };
    mFollowerFirstRow = mSeqRow;
    mFollowerLastRow = mSeqRow2;
    mFollowerFirstCol = mSeqCol;
    mFollowerLastCol = mSeqCol2;

    // Generate audio data
    var doneFun = function (wave)
    {
      if (mAudio == null)
      {
         alert("Audio element unavailable.");
         return;
      }

      try
      {
        // Restart the follower
        startFollower();

        // Load the data into the audio element (it will start playing as soon
        // as the data has been loaded)
        mAudio.src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));

        // Hack
        mAudio.play();
        mAudioTimer.reset();
      }
      catch (err)
      {
        alert("Error playing: " + err.message);
      }
    };
    generateAudio(doneFun, opts);
  };

  var stopPlaying = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mAudio == null)
    {
       alert("Audio element unavailable.");
       return;
    }

    stopAudio();
  };

  var bpmFocus = function (e) {
    setEditMode(EDIT_NONE);
    return true;
  };

  var rppFocus = function (e) {
    setEditMode(EDIT_NONE);
    return true;
  };

  var instrPresetFocus = function (e) {
    setEditMode(EDIT_NONE);
    return true;
  };

  var instrCopyMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqCol == mSeqCol2) {
      mInstrCopyBuffer = [];
      var instr = mSong.songData[mSeqCol];
      for (var i = 0; i <= instr.i.length; ++i)
        mInstrCopyBuffer[i] = instr.i[i];
    }
  };

  var instrPasteMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqCol == mSeqCol2 && mInstrCopyBuffer.length > 0) {
      var instr = mSong.songData[mSeqCol];
      instr.i = [];
      for (var i = 0; i <= mInstrCopyBuffer.length; ++i)
        instr.i[i] = mInstrCopyBuffer[i];
    }
    updateInstrument(true);
  };

  var patternCopyMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        mPatCopyBuffer = [];
        for (var row = mPatternRow; row <= mPatternRow2; ++row) {
          var arr = [];
          for (var col = mPatternCol; col <= mPatternCol2; ++col) {
            arr.push(mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen]);
          }
          mPatCopyBuffer.push(arr);
        }
      }
    }
  };

  var patternPasteMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        for (var row = mPatternRow, i = 0; row < mSong.patternLen && i < mPatCopyBuffer.length; ++row, ++i) {
          for (var col = mPatternCol, j = 0; col < 4 && j < mPatCopyBuffer[i].length; ++col, ++j) {
            mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen] = mPatCopyBuffer[i][j];
          }
        }
        updatePattern();
      }
    }
  };

  var patternNoteUpMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        for (var row = mPatternRow; row <= mPatternRow2; ++row) {
          for (var col = mPatternCol; col <= mPatternCol2; ++col) {
            var n = mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen];
            if (n > 0)
              mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen] = n + 1;
          }
        }
        updatePattern();
      }
    }
  };

  var patternNoteDownMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        for (var row = mPatternRow; row <= mPatternRow2; ++row) {
          for (var col = mPatternCol; col <= mPatternCol2; ++col) {
            var n = mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen];
            if (n > 1)
              mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen] = n - 1;
          }
        }
        updatePattern();
      }
    }
  };

  var patternOctaveUpMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        for (var row = mPatternRow; row <= mPatternRow2; ++row) {
          for (var col = mPatternCol; col <= mPatternCol2; ++col) {
            var n = mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen];
            if (n > 0)
              mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen] = n + 12;
          }
        }
        updatePattern();
      }
    }
  };

  var patternOctaveDownMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        for (var row = mPatternRow; row <= mPatternRow2; ++row) {
          for (var col = mPatternCol; col <= mPatternCol2; ++col) {
            var n = mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen];
            if (n > 12)
              mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen] = n - 12;
          }
        }
        updatePattern();
      }
    }
  };

  var sequencerCopyMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    mSeqCopyBuffer = [];
    for (var row = mSeqRow; row <= mSeqRow2; ++row)
    {
      var arr = [];
      for (var col = mSeqCol; col <= mSeqCol2; ++col)
      {
        arr.push(mSong.songData[col].p[row]);
      }
      mSeqCopyBuffer.push(arr);
    }
  };

  var sequencerPasteMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    for (var row = mSeqRow, i = 0; row < MAX_SONG_ROWS && i < mSeqCopyBuffer.length; ++row, ++i)
    {
      for (var col = mSeqCol, j = 0; col < 8 && j < mSeqCopyBuffer[i].length; ++col, ++j)
      {
        mSong.songData[col].p[row] = mSeqCopyBuffer[i][j];
      }
    }
    updateSequencer();
  };

  var sequencerPatUpMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    for (var row = mSeqRow; row <= mSeqRow2; ++row)
    {
      for (var col = mSeqCol; col <= mSeqCol2; ++col)
      {
        var pat = mSong.songData[col].p[row];
        if (pat < MAX_PATTERNS)
        {
          mSong.songData[col].p[row] = pat + 1;
        }
      }
    }
    updateSequencer();
    updatePattern();
    updateFxTrack();
  };

  var sequencerPatDownMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    for (var row = mSeqRow; row <= mSeqRow2; ++row)
    {
      for (var col = mSeqCol; col <= mSeqCol2; ++col)
      {
        var pat = mSong.songData[col].p[row];
        if (pat > 0)
        {
          mSong.songData[col].p[row] = pat - 1;
        }
      }
    }
    updateSequencer();
    updatePattern();
    updateFxTrack();
  };

  var fxCopyMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        mFxCopyBuffer = [];
        for (var row = mFxTrackRow; row <= mFxTrackRow2; ++row) {
          var arr = [];
          arr.push(mSong.songData[mSeqCol].c[pat].f[row]);
          arr.push(mSong.songData[mSeqCol].c[pat].f[row + mSong.patternLen]);
          mFxCopyBuffer.push(arr);
        }
      }
    }
  };

  var fxPasteMouseDown = function (e) {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
      var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
      if (pat >= 0) {
        for (var row = mFxTrackRow, i = 0; row < mSong.patternLen && i < mFxCopyBuffer.length; ++row, ++i) {
          var arr = mFxCopyBuffer[i];
          mSong.songData[mSeqCol].c[pat].f[row] = arr[0];
          mSong.songData[mSeqCol].c[pat].f[row + mSong.patternLen] = arr[1];
        }
        updateFxTrack();
      }
    }
  };

  var boxMouseDown = function (e) {
    if (!e) var e = window.event;
    if (mSeqCol == mSeqCol2) {
      var o = getEventElement(e);

      // Check which instrument parameter was changed
      var fxCmd = -1;
      if (o.id === "osc1_xenv")
        fxCmd = OSC1_XENV;
      else if (o.id === "osc2_xenv")
        fxCmd = OSC2_XENV;
      else if (o.id === "lfo_fxfreq")
        fxCmd = LFO_FX_FREQ;

      // Update the instrument (toggle boolean)
      var fxValue;
      if (fxCmd >= 0) {
        fxValue = mSong.songData[mSeqCol].i[fxCmd] ? 0 : 1;
        mSong.songData[mSeqCol].i[fxCmd] = fxValue;
      }

      // Edit the fx track
      if (mEditMode == EDIT_FXTRACK && mSeqRow == mSeqRow2 &&
          mFxTrackRow == mFxTrackRow2 && fxCmd) {
        var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
        if (pat >= 0) {
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow] = fxCmd + 1;
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow+mSong.patternLen] = fxValue;
          updateFxTrack();
        }
      }

      updateInstrument(true);
      unfocusHTMLInputElements();
      e.preventDefault();
    }
  };

  var osc1WaveMouseDown = function (e) {
    if (!e) var e = window.event;
    if (mSeqCol == mSeqCol2) {
      var o = getEventElement(e);
      var wave = 0;
      if (o.id === "osc1_wave_sin") wave = 0;
      else if (o.id === "osc1_wave_sqr") wave = 1;
      else if (o.id === "osc1_wave_saw") wave = 2;
      else if (o.id === "osc1_wave_tri") wave = 3;
      if (mEditMode == EDIT_FXTRACK && mSeqRow == mSeqRow2 &&
          mFxTrackRow == mFxTrackRow2) {
        var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
        if (pat >= 0) {
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow] = OSC1_WAVEFORM + 1;
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow+mSong.patternLen] = wave;
          updateFxTrack();
        }
      }
      mSong.songData[mSeqCol].i[OSC1_WAVEFORM] = wave;
      updateInstrument();
      unfocusHTMLInputElements();
      e.preventDefault();
    }
  };

  var osc2WaveMouseDown = function (e) {
    if (!e) var e = window.event;
    if (mSeqCol == mSeqCol2) {
      var o = getEventElement(e);
      var wave = 0;
      if (o.id === "osc2_wave_sin") wave = 0;
      else if (o.id === "osc2_wave_sqr") wave = 1;
      else if (o.id === "osc2_wave_saw") wave = 2;
      else if (o.id === "osc2_wave_tri") wave = 3;
      if (mEditMode == EDIT_FXTRACK && mSeqRow == mSeqRow2 &&
          mFxTrackRow == mFxTrackRow2) {
        var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
        if (pat >= 0) {
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow] = OSC2_WAVEFORM + 1;
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow+mSong.patternLen] = wave;
          updateFxTrack();
        }
      }
      mSong.songData[mSeqCol].i[OSC2_WAVEFORM] = wave;
      updateInstrument(true);
      unfocusHTMLInputElements();
      e.preventDefault();
    }
  };

  var lfoWaveMouseDown = function (e) {
    if (!e) var e = window.event;
    if (mSeqCol == mSeqCol2) {
      var o = getEventElement(e);
      var wave = 0;
      if (o.id === "lfo_wave_sin") wave = 0;
      else if (o.id === "lfo_wave_sqr") wave = 1;
      else if (o.id === "lfo_wave_saw") wave = 2;
      else if (o.id === "lfo_wave_tri") wave = 3;
      if (mEditMode == EDIT_FXTRACK && mSeqRow == mSeqRow2 &&
          mFxTrackRow == mFxTrackRow2) {
        var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
        if (pat >= 0) {
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow] = LFO_WAVEFORM + 1;
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow+mSong.patternLen] = wave;
          updateFxTrack();
        }
      }
      mSong.songData[mSeqCol].i[LFO_WAVEFORM] = wave;
      updateInstrument(true);
      unfocusHTMLInputElements();
      e.preventDefault();
    }
  };

  var fxFiltMouseDown = function (e) {
    if (!e) var e = window.event;
    if (mSeqCol == mSeqCol2) {
      var o = getEventElement(e);
      var filt = 2;
      if (o.id === "fx_filt_hp") filt = 1;
      else if (o.id === "fx_filt_lp") filt = 2;
      else if (o.id === "fx_filt_bp") filt = 3;
      if (mEditMode == EDIT_FXTRACK && mSeqRow == mSeqRow2 &&
          mFxTrackRow == mFxTrackRow2) {
        var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
        if (pat >= 0) {
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow] = FX_FILTER + 1
          mSong.songData[mSeqCol].c[pat].f[mFxTrackRow+mSong.patternLen] = filt;
          updateFxTrack();
        }
      }
      mSong.songData[mSeqCol].i[FX_FILTER] = filt;
      updateInstrument(true);
      unfocusHTMLInputElements();
      e.preventDefault();
    }
  };

  var octaveUp = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mKeyboardOctave < 8)
    {
      mKeyboardOctave++;
      document.getElementById("keyboardOctave").innerHTML = "" + mKeyboardOctave;
    }
  };

  var octaveDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (mKeyboardOctave > 1)
    {
      mKeyboardOctave--;
      document.getElementById("keyboardOctave").innerHTML = "" + mKeyboardOctave;
    }
  };

  var selectPreset = function (e)
  {
    if (!e) var e = window.event;
    if (mSeqCol == mSeqCol2)
    {
      var o = getEventElement(e);
      var val = o.options[o.selectedIndex].value;
      if (val !== "")
      {
        val = parseInt(val);
        if (val)
        {
          // Clone instrument settings
          var src = gInstrumentPresets[val];
          for (var i = 0; i < src.i.length; ++i)
            mSong.songData[mSeqCol].i[i] = src.i[i];

          updateInstrument(false);
          e.preventDefault();
        }
      }
    }
  };

  var keyboardMouseDown = function (e)
  {
    if (!e) var e = window.event;
    var p = getMousePos(e, true);

    // Calculate keyboard position
    var n = 0;
    if (p[1] < 68) {
      // Possible black key
      for (var i = 0; i < mBlackKeyPos.length; i += 2) {
        if (p[0] >= (mBlackKeyPos[i] - 10) &&
            p[0] <= (mBlackKeyPos[i] + 10)) {
          n = mBlackKeyPos[i + 1];
          break;
        }
      }
    }
    if (!n) {
      // Must be a white key
      n = Math.floor((p[0] * 14) / 420) * 2;
      var comp = 0;
      if (n >= 20) comp++;
      if (n >= 14) comp++;
      if (n >= 6) comp++;
      n -= comp;
    }

    // Play the note
    if (playNote(n + mKeyboardOctave * 12)) {
      e.preventDefault();
    }
  };

  var fxTrackMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (!mFollowerActive)
    {
      var o = getEventElement(e);
      var row = parseInt(o.id.slice(3));
      setSelectedFxTrackRow(row);
      mSelectingFxRange = true;
    }
    setEditMode(EDIT_FXTRACK);
  };

  var fxTrackMouseOver = function (e)
  {
    if (mSelectingFxRange)
    {
      if (!e) var e = window.event;
      var o = getEventElement(e);
      var row = parseInt(o.id.slice(3));
      setSelectedFxTrackRow2(row);
      e.preventDefault();
    }
  };

  var fxTrackMouseUp = function (e)
  {
    if (mSelectingFxRange)
    {
      if (!e) var e = window.event;
      var o = getEventElement(e);
      var row = parseInt(o.id.slice(3));
      setSelectedFxTrackRow2(row);
      mSelectingFxRange = false;
      e.preventDefault();
    }
  };

  var patternMouseDown = function (e)
  {
    if (!e) var e = window.event;
    e.preventDefault();

    if (!mFollowerActive)
    {
      var o = getEventElement(e);
      var col = parseInt(o.id.slice(2,3));
      var row = parseInt(o.id.slice(4));
      setSelectedPatternCell(col, row);
      mSelectingPatternRange = true;
    }
    setEditMode(EDIT_PATTERN);
  };

  var patternMouseOver = function (e)
  {
    if (mSelectingPatternRange)
    {
      if (!e) var e = window.event;
      var o = getEventElement(e);
      var col = parseInt(o.id.slice(2,3));
      var row = parseInt(o.id.slice(4));
      setSelectedPatternCell2(col, row);
      e.preventDefault();
    }
  };

  var patternMouseUp = function (e)
  {
    if (mSelectingPatternRange)
    {
      if (!e) var e = window.event;
      var o = getEventElement(e);
      var col = parseInt(o.id.slice(2,3));
      var row = parseInt(o.id.slice(4));
      setSelectedPatternCell2(col, row);
      mSelectingPatternRange = false;
      e.preventDefault();
    }
  };

  var sequencerMouseDown = function (e)
  {
    if (!e) var e = window.event;
    var o = getEventElement(e);
    var col = parseInt(o.id.slice(2,3));
    var row;
    if (!mFollowerActive)
      row = parseInt(o.id.slice(4));
    else
      row = mSeqRow;
    var newChannel = col != mSeqCol || mSeqCol != mSeqCol2;
    setSelectedSequencerCell(col, row);
    if (!mFollowerActive)
      mSelectingSeqRange = true;
    setEditMode(EDIT_SEQUENCE);
    updatePattern();
    updateFxTrack();
    updateInstrument(newChannel);
    e.preventDefault();
  };

  var sequencerMouseOver = function (e)
  {
    if (mSelectingSeqRange)
    {
      if (!e) var e = window.event;
      var o = getEventElement(e);
      var col = parseInt(o.id.slice(2,3));
      var row = parseInt(o.id.slice(4));
      setSelectedSequencerCell2(col, row);
      updatePattern();
      updateFxTrack();
      updateInstrument(true);
      e.preventDefault();
    }
  };

  var sequencerMouseUp = function (e)
  {
    if (mSelectingSeqRange)
    {
      if (!e) var e = window.event;
      var o = getEventElement(e);
      var col = parseInt(o.id.slice(2,3));
      var row = parseInt(o.id.slice(4));
      var newChannel = col != mSeqCol2 || mSeqCol != mSeqCol2;
      setSelectedSequencerCell2(col, row);
      mSelectingSeqRange = false;
      updatePattern();
      updateFxTrack();
      updateInstrument(newChannel);
      e.preventDefault();
    }
  };

  var mActiveSlider = null;

  var sliderMouseDown = function (e)
  {
    if (mSeqCol == mSeqCol2)
    {
      if (!e) var e = window.event;
      mActiveSlider = getEventElement(e);
      unfocusHTMLInputElements();
      e.preventDefault();
    }
  };

  var mouseMove = function (e) {
    if (!e) var e = window.event;

    // Handle slider?
    if (mActiveSlider) {
      var instr = mSong.songData[mSeqCol];

      // Calculate slider position
      var pos = getMousePos(e, false);
      var origin = getElementPos(mActiveSlider.parentNode);
      var x = pos[0] - 6 - origin[0];
      x = x < 0 ? 0 : (x > 150 ? 1 : (x / 150));

      // Adapt to the range of the slider
      if (mActiveSlider.sliderProps.nonLinear)
        x = x * x;
      var min = mActiveSlider.sliderProps.min;
      var max = mActiveSlider.sliderProps.max;
      x = Math.round(min + ((max - min) * x));

      // Update the slider position
      updateSlider(mActiveSlider, x);
      clearPresetSelection();

      // Check which instrument property to update
      var cmdNo = -1;
      if (mActiveSlider.id == "osc1_vol")         cmdNo = OSC1_VOL;
      else if (mActiveSlider.id == "osc1_semi")   cmdNo = OSC1_SEMI;
      else if (mActiveSlider.id == "osc2_vol")    cmdNo = OSC2_VOL;
      else if (mActiveSlider.id == "osc2_semi")   cmdNo = OSC2_SEMI;
      else if (mActiveSlider.id == "osc2_det")    cmdNo = OSC2_DETUNE;
      else if (mActiveSlider.id == "noise_vol")   cmdNo = NOISE_VOL;
      else if (mActiveSlider.id == "env_att")     cmdNo = ENV_ATTACK;
      else if (mActiveSlider.id == "env_sust")    cmdNo = ENV_SUSTAIN;
      else if (mActiveSlider.id == "env_rel")     cmdNo = ENV_RELEASE;
      else if (mActiveSlider.id == "arp_note1")   cmdNo = ARP_CHORD;
      else if (mActiveSlider.id == "arp_note2")   cmdNo = ARP_CHORD;
      else if (mActiveSlider.id == "arp_speed")   cmdNo = ARP_SPEED;
      else if (mActiveSlider.id == "lfo_amt")     cmdNo = LFO_AMT;
      else if (mActiveSlider.id == "lfo_freq")    cmdNo = LFO_FREQ;
      else if (mActiveSlider.id == "fx_freq")     cmdNo = FX_FREQ;
      else if (mActiveSlider.id == "fx_res")      cmdNo = FX_RESONANCE;
      else if (mActiveSlider.id == "fx_dist")     cmdNo = FX_DIST;
      else if (mActiveSlider.id == "fx_drive")    cmdNo = FX_DRIVE;
      else if (mActiveSlider.id == "fx_pan_amt")  cmdNo = FX_PAN_AMT;
      else if (mActiveSlider.id == "fx_pan_freq") cmdNo = FX_PAN_FREQ;
      else if (mActiveSlider.id == "fx_dly_amt")  cmdNo = FX_DELAY_AMT;
      else if (mActiveSlider.id == "fx_dly_time") cmdNo = FX_DELAY_TIME;

      // The arpeggio chord notes are combined into a single byte
      if (cmdNo === ARP_CHORD) {
        if (mActiveSlider.id == "arp_note1")
          x = (instr.i[ARP_CHORD] & 15) | (x << 4);
        else
          x = (instr.i[ARP_CHORD] & 240) | x;
      }

      if (mEditMode == EDIT_FXTRACK && mFxTrackRow == mFxTrackRow2) {
        // Update the effect command in the FX track
        if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
          var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
          if (pat >= 0) {
            mSong.songData[mSeqCol].c[pat].f[mFxTrackRow] = cmdNo + 1;
            mSong.songData[mSeqCol].c[pat].f[mFxTrackRow+mSong.patternLen] = x;
            updateFxTrack();
          }
        }
      }

      // Update the instrument property
      if (cmdNo >= 0)
        instr.i[cmdNo] = x;

      // Update the jammer instrument
      mJammer.updateInstr(instr.i);

      e.preventDefault();
    }
  };

  var mouseUp = function (e)
  {
    if (mActiveSlider)
    {
      mActiveSlider = null;
      return false;
    }
    return true;
  };

  var keyDown = function (e) {
    if (!e) var e = window.event;

    // Check if we're editing BPM / RPP
    var editingBpmRpp =
        document.activeElement === document.getElementById("bpm") ||
        document.activeElement === document.getElementById("rpp");

    var row, col, n;

    // Sequencer editing
    if (mEditMode == EDIT_SEQUENCE &&
        mSeqCol == mSeqCol2 && mSeqRow == mSeqRow2)
    {
      // 0 - 9
      if (e.keyCode >= 48 && e.keyCode <= 57)
      {
        mSong.songData[mSeqCol].p[mSeqRow] = e.keyCode - 47;
        updateSequencer();
        updatePattern();
        updateFxTrack();
        return false;
      }

      // A - Z
      if (e.keyCode >= 64 && e.keyCode <= 90)
      {
        mSong.songData[mSeqCol].p[mSeqRow] = e.keyCode - 54;
        updateSequencer();
        updatePattern();
        updateFxTrack();
        return false;
      }
    }

    // Emulate a piano through keyboard input.
    if (mEditMode != EDIT_SEQUENCE && !editingBpmRpp) {
      n = -1;
      switch (e.keyCode)
      {
        // First octave on the ZXCVB... row
        case 90: n = 0; break;
        case 83: n = 1; break;
        case 88: n = 2; break;
        case 68: n = 3; break;
        case 67: n = 4; break;
        case 86: n = 5; break;
        case 71: n = 6; break;
        case 66: n = 7; break;
        case 72: n = 8; break;
        case 78: n = 9; break;
        case 74: n = 10; break;
        case 77: n = 11; break;
        // "Bonus keys" 1 (extensions of first octave into second octave)
        case 188: n = 12; break;
        case 76: n = 13; break;
        case 190: n = 14; break;
        case 186: n = 15; break;
        case 191: n = 16; break;
        // Second octave on the QWERTY... row
        case 81: n = 12; break;
        case 50: n = 13; break;
        case 87: n = 14; break;
        case 51: n = 15; break;
        case 69: n = 16; break;
        case 82: n = 17; break;
        case 53: n = 18; break;
        case 84: n = 19; break;
        case 54: n = 20; break;
        case 89: n = 21; break;
        case 55: n = 22; break;
        case 85: n = 23; break;
        // "Bonus keys" 2 (extensions of second octave into third octave)
        case 73: n = 24; break;
        case 57: n = 25; break;
        case 79: n = 26; break;
        case 48: n = 27; break;
        case 80: n = 28; break;
      }
      if (n >= 0)
      {
        if (playNote(n + mKeyboardOctave * 12))
        {
          return false;
        }
      }
    }

    // The rest of the key presses...
    switch (e.keyCode)
    {
      case 39:  // RIGHT
        if (mEditMode == EDIT_SEQUENCE)
        {
          setSelectedSequencerCell((mSeqCol + 1) % 8, mSeqRow);
          updatePattern();
          updateFxTrack();
          updateInstrument(true);
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          setSelectedPatternCell((mPatternCol + 1) % 4, mPatternRow);
          return false;
        }
        break;

      case 37:  // LEFT
        if (mEditMode == EDIT_SEQUENCE)
        {
          setSelectedSequencerCell((mSeqCol - 1 + 8) % 8, mSeqRow);
          updatePattern();
          updateFxTrack();
          updateInstrument(true);
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          setSelectedPatternCell((mPatternCol - 1 + 4) % 4, mPatternRow);
          return false;
        }
        break;

      case 40:  // DOWN
        if (mEditMode == EDIT_SEQUENCE)
        {
          setSelectedSequencerCell(mSeqCol, (mSeqRow + 1) % MAX_SONG_ROWS);
          updatePattern();
          updateFxTrack();
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          setSelectedPatternCell(mPatternCol, (mPatternRow + 1) % mSong.patternLen);
          return false;
        }
        else if (mEditMode == EDIT_FXTRACK)
        {
          setSelectedFxTrackRow((mFxTrackRow + 1) % mSong.patternLen);
          return false;
        }
        break;

      case 38:  // UP
        if (mEditMode == EDIT_SEQUENCE)
        {
          setSelectedSequencerCell(mSeqCol, (mSeqRow - 1 + MAX_SONG_ROWS) % MAX_SONG_ROWS);
          updatePattern();
          updateFxTrack();
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          setSelectedPatternCell(mPatternCol, (mPatternRow - 1 + mSong.patternLen) % mSong.patternLen);
          return false;
        }
        else if (mEditMode == EDIT_FXTRACK)
        {
          setSelectedFxTrackRow((mFxTrackRow - 1 + mSong.patternLen) % mSong.patternLen);
          return false;
        }
        break;

      case 36:  // HOME
        if (mEditMode == EDIT_SEQUENCE)
        {
          setSelectedSequencerCell(mSeqCol, 0);
          updatePattern();
          updateFxTrack();
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          setSelectedPatternCell(mPatternCol, 0);
          return false;
        }
        else if (mEditMode == EDIT_FXTRACK)
        {
          setSelectedFxTrackRow(0);
          return false;
        }
        break;

      case 35:  // END
        if (mEditMode == EDIT_SEQUENCE)
        {
          setSelectedSequencerCell(mSeqCol, MAX_SONG_ROWS - 1);
          updatePattern();
          updateFxTrack();
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          setSelectedPatternCell(mPatternCol, mSong.patternLen - 1);
          return false;
        }
        else if (mEditMode == EDIT_FXTRACK)
        {
          setSelectedFxTrackRow(mSong.patternLen - 1);
          return false;
        }
        break;

      case 32: // SPACE
        if (mEditMode != EDIT_NONE)
        {
          playRange(e);
          return false;
        }
        break;

      case 8:   // BACKSPACE (Mac delete)
      case 46:  // DELETE
        if (mEditMode == EDIT_SEQUENCE)
        {
          for (row = mSeqRow; row <= mSeqRow2; ++row)
          {
            for (col = mSeqCol; col <= mSeqCol2; ++col)
            {
              mSong.songData[col].p[row] = 0;
            }
          }
          updateSequencer();
          updatePattern();
          updateFxTrack();
          return false;
        }
        else if (mEditMode == EDIT_PATTERN)
        {
          if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2)
          {
            var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
            if (pat >= 0) {
              for (row = mPatternRow; row <= mPatternRow2; ++row) {
                for (col = mPatternCol; col <= mPatternCol2; ++col)
                  mSong.songData[mSeqCol].c[pat].n[row+col*mSong.patternLen] = 0;
              }
              if (mPatternRow == mPatternRow2) {
                setSelectedPatternCell(mPatternCol, (mPatternRow + 1) % mSong.patternLen);
              }
              updatePattern();
            }
            return false;
          }
        }
        else if (mEditMode == EDIT_FXTRACK)
        {
          if (mSeqRow == mSeqRow2 && mSeqCol == mSeqCol2) {
            var pat = mSong.songData[mSeqCol].p[mSeqRow] - 1;
            if (pat >= 0) {
              for (row = mFxTrackRow; row <= mFxTrackRow2; ++row) {
                mSong.songData[mSeqCol].c[pat].f[row] = 0;
                mSong.songData[mSeqCol].c[pat].f[row + mSong.patternLen] = 0;
              }
              if (mFxTrackRow == mFxTrackRow2) {
                setSelectedFxTrackRow((mFxTrackRow + 1) % mSong.patternLen);
              }
              updateFxTrack();
            }
            return false;
          }
        }
        break;

      case 13:  // ENTER / RETURN
        if (editingBpmRpp) {
          updateSongSpeed();
          updatePatternLength();
          document.getElementById("bpm").blur();
          document.getElementById("rpp").blur();
        }
        break;

      default:
        // alert("onkeydown: " + e.keyCode);
        break;
    }

    return true;
  };

  var onFileDrop = function (e) {
    e.stopPropagation();
    e.preventDefault();

    // Get the dropped file
    var files = e.dataTransfer.files;
    if (files.length != 1) {
      alert("Only open one file at a time.");
      return;
    }
    var file = files[0];

    // Load the file into the editor
    var reader = new FileReader();
    reader.onload = function(e) {
      loadSongFromData(getURLSongData(e.target.result));
    };
    reader.readAsDataURL(file);
  };

  var activateMasterEvents = function ()
  {
    // Set up the master mouse event handlers
    document.onmousedown = null;
    document.addEventListener("mousemove", mouseMove, false);
    document.addEventListener("touchmove", mouseMove, false);
    document.addEventListener("mouseup", mouseUp, false);
    document.addEventListener("touchend", mouseUp, false);

    // Set up the master key event handler
    document.onkeydown = keyDown;

    // Set up the drag'n'drop handler
    var dropElement = document.body.parentNode;
    dropElement.addEventListener("dragenter", function dragenter(e) { e.stopPropagation(); e.preventDefault(); }, false);
    dropElement.addEventListener("dragover", function dragenter(e) { e.stopPropagation(); e.preventDefault(); }, false);
    dropElement.addEventListener("drop", onFileDrop, false);
  };

  var deactivateMasterEvents = function ()
  {
    // Set up the master mouse event handlers
    document.onmousedown = function () { return true; };
    document.onmousemove = null;
    document.onmouseup = null;

    // Set up the master key event handler
    document.onkeydown = null;
  };

  var buildSequencerTable = function () {
    var table = document.getElementById("sequencer-table");
    var tr, th, td;
    for (var row = 0; row < MAX_SONG_ROWS; row++) {
      tr = document.createElement("tr");
      if (row % 4 === 0)
        tr.className = "beat";
      th = document.createElement("th");
      th.id = "spr" + row;
      th.textContent = "" + row;
      tr.appendChild(th);
      for (col = 0; col < 8; col++) {
        td = document.createElement("td");
        td.id = "sc" + col + "r" + row;
        td.textContent = " ";
        td.addEventListener("mousedown", sequencerMouseDown, false);
        td.addEventListener("mouseover", sequencerMouseOver, false);
        td.addEventListener("mouseup", sequencerMouseUp, false);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  };

  var getCurrentBeatDistance = function (table) {
    var beatDistance = 1;
    while (beatDistance < table.children.length) {
      if (table.children[beatDistance].className === "beat")
        break;
      beatDistance++;
    }
    return beatDistance;
  };

  var getBeatDistance = function () {
    var bpm = getBPM();
    var beatDistance = 4;
    if (mSong.patternLen % 3 === 0)
      beatDistance = 3;
    else if (mSong.patternLen % 4 === 0)
      beatDistance = 4;
    else if (mSong.patternLen % 2 === 0)
      beatDistance = 2;
    else if (mSong.patternLen % 5 === 0)
      beatDistance = 5;
    if ((bpm / beatDistance) >= 40 && mSong.patternLen > 24 && (mSong.patternLen % (beatDistance * 2) === 0))
      beatDistance *= 2;

    return beatDistance;
  };

  var buildPatternTable = function () {
    var beatDistance = getBeatDistance();
    var table = document.getElementById("pattern-table");
    if (table.children.length === mSong.patternLen && getCurrentBeatDistance(table) === beatDistance)
      return;
    while (table.firstChild)
      table.removeChild(table.firstChild);
    var tr, th, td;
    for (var row = 0; row < mSong.patternLen; row++) {
      tr = document.createElement("tr");
      if (row % beatDistance === 0)
        tr.className = "beat";
      th = document.createElement("th");
      th.id = "ppr" + row;
      th.textContent = "" + row;
      tr.appendChild(th);
      for (col = 0; col < 4; col++) {
        td = document.createElement("td");
        td.id = "pc" + col + "r" + row;
        td.textContent = " ";
        td.addEventListener("mousedown", patternMouseDown, false);
        td.addEventListener("mouseover", patternMouseOver, false);
        td.addEventListener("mouseup", patternMouseUp, false);
        tr.appendChild(td);
      }
      table.appendChild(tr);
    }
  };

  var buildFxTable = function () {
    var beatDistance = getBeatDistance();
    var table = document.getElementById("fxtrack-table");
    if (table.children.length === mSong.patternLen && getCurrentBeatDistance(table) === beatDistance)
      return;
    while (table.firstChild)
      table.removeChild(table.firstChild);
    var tr, td;
    for (var row = 0; row < mSong.patternLen; row++) {
      tr = document.createElement("tr");
      if (row % beatDistance === 0)
        tr.className = "beat";
      td = document.createElement("td");
      td.id = "fxr" + row;
      td.textContent = String.fromCharCode(160);  // &nbsp;
      td.addEventListener("mousedown", fxTrackMouseDown, false);
      td.addEventListener("mouseover", fxTrackMouseOver, false);
      td.addEventListener("mouseup", fxTrackMouseUp, false);
      tr.appendChild(td);
      table.appendChild(tr);
    }
  };


  //--------------------------------------------------------------------------
  // Initialization
  //--------------------------------------------------------------------------

  this.init = function ()
  {
    var i, j, o;

    // Parse URL
    mBaseURL = getURLBase(window.location.href);
    mGETParams = parseURLGetData(window.location.href);

    // Preload images
    preloadImage("gui/progress.gif");
    preloadImage("media/graphics/toggle_off.svg");
    preloadImage("media/graphics/toggle_on.svg");
    preloadImage("gui/wave-sin.png");
    preloadImage("gui/wave-sin-sel.png");
    preloadImage("gui/wave-saw.png");
    preloadImage("gui/wave-saw-sel.png");
    preloadImage("gui/wave-sqr.png");
    preloadImage("gui/wave-sqr-sel.png");
    preloadImage("gui/wave-tri.png");
    preloadImage("gui/wave-tri-sel.png");
    preloadImage("gui/filt-lp.png");
    preloadImage("gui/filt-lp-sel.png");
    preloadImage("gui/filt-hp.png");
    preloadImage("gui/filt-hp-sel.png");
    preloadImage("gui/filt-bp.png");
    preloadImage("gui/filt-bp-sel.png");
    preloadImage("gui/filt-n.png");
    preloadImage("gui/filt-n-sel.png");

    // Set up presets
    initPresets();

    // Load images for the play graphics canvas
    mPlayGfxVUImg.onload = function () {
      redrawPlayerGfx(-1);
    };
    mPlayGfxLedOffImg.onload = function () {
      redrawPlayerGfx(-1);
    };
    mPlayGfxVUImg.src = "gui/playGfxBg.png";
    mPlayGfxLedOffImg.src = "gui/led-off.png";
    mPlayGfxLedOnImg.src = "gui/led-on.png";

    // Build the UI tables
    buildSequencerTable();

    // Set up GUI elements
    document.getElementById("osc1_vol").sliderProps = { min: 0, max: 255 };
    document.getElementById("osc1_semi").sliderProps = { min: 92, max: 164 };
    document.getElementById("osc2_vol").sliderProps = { min: 0, max: 255 };
    document.getElementById("osc2_semi").sliderProps = { min: 92, max: 164 };
    document.getElementById("osc2_det").sliderProps = { min: 0, max: 255, nonLinear: true };
    document.getElementById("noise_vol").sliderProps = { min: 0, max: 255 };
    document.getElementById("env_att").sliderProps = { min: 0, max: 255 };
    document.getElementById("env_sust").sliderProps = { min: 0, max: 255 };
    document.getElementById("env_rel").sliderProps = { min: 0, max: 255 };
    document.getElementById("arp_note1").sliderProps = { min: 0, max: 12 };
    document.getElementById("arp_note2").sliderProps = { min: 0, max: 12 };
    document.getElementById("arp_speed").sliderProps = { min: 0, max: 7 };
    document.getElementById("lfo_amt").sliderProps = { min: 0, max: 255 };
    document.getElementById("lfo_freq").sliderProps = { min: 0, max: 16 };
    document.getElementById("fx_freq").sliderProps = { min: 0, max: 255, nonLinear: true };
    document.getElementById("fx_res").sliderProps = { min: 0, max: 254 };
    document.getElementById("fx_dly_amt").sliderProps = { min: 0, max: 255 };
    document.getElementById("fx_dly_time").sliderProps = { min: 0, max: 16 };
    document.getElementById("fx_pan_amt").sliderProps = { min: 0, max: 255 };
    document.getElementById("fx_pan_freq").sliderProps = { min: 0, max: 16 };
    document.getElementById("fx_dist").sliderProps = { min: 0, max: 255, nonLinear: true };
    document.getElementById("fx_drive").sliderProps = { min: 0, max: 255 };

    // Create audio element, and always play the audio as soon as it's ready
    try
    {
      mAudio = new Audio();
      mAudioTimer.setAudioElement(mAudio);
      mAudio.addEventListener("canplay", function () { this.play(); }, true);
    }
    catch (err)
    {
      mAudio = null;
    }

    // Load the song
    var songData = getURLSongData(mGETParams && mGETParams.data && mGETParams.data[0]);
    var song = songData ? binToSong(songData) : null;
    mSong = song ? song : makeNewSong();

    // Update UI according to the loaded song
    updateSongInfo();
    updateSequencer();
    updatePattern();
    updateFxTrack();
    updateInstrument(true);

    // Initialize the song
    setEditMode(EDIT_PATTERN);
    setSelectedSequencerCell(0, 0);
    setSelectedPatternCell(0, 0);

    // Misc event handlers
    document.getElementById("newSong").onmousedown = newSong;
    document.getElementById("openSong").onmousedown = openSong;
    document.getElementById("saveSong").onmousedown = saveSong;
    document.getElementById("exportJS").onmousedown = exportJS;
    document.getElementById("exportWAV").onmousedown = exportWAV;
    document.getElementById("playSong").onmousedown = playSong;
    document.getElementById("playRange").onmousedown = playRange;
    document.getElementById("stopPlaying").onmousedown = stopPlaying;
    document.getElementById("bpm").onfocus = bpmFocus;
    document.getElementById("rpp").onfocus = rppFocus;

    document.getElementById("sequencerCopy").onmousedown = sequencerCopyMouseDown;
    document.getElementById("sequencerPaste").onmousedown = sequencerPasteMouseDown;
    document.getElementById("sequencerPatUp").onmousedown = sequencerPatUpMouseDown;
    document.getElementById("sequencerPatDown").onmousedown = sequencerPatDownMouseDown;

    document.getElementById("patternCopy").onmousedown = patternCopyMouseDown;
    document.getElementById("patternPaste").onmousedown = patternPasteMouseDown;
    document.getElementById("patternNoteUp").onmousedown = patternNoteUpMouseDown;
    document.getElementById("patternNoteDown").onmousedown = patternNoteDownMouseDown;
    document.getElementById("patternOctaveUp").onmousedown = patternOctaveUpMouseDown;
    document.getElementById("patternOctaveDown").onmousedown = patternOctaveDownMouseDown;

    document.getElementById("fxCopy").onmousedown = fxCopyMouseDown;
    document.getElementById("fxPaste").onmousedown = fxPasteMouseDown;

    document.getElementById("instrPreset").onfocus = instrPresetFocus;
    document.getElementById("instrPreset").onchange = selectPreset;
    document.getElementById("osc1_wave_sin").addEventListener("mousedown", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_sin").addEventListener("touchstart", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_sqr").addEventListener("mousedown", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_sqr").addEventListener("touchstart", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_saw").addEventListener("mousedown", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_saw").addEventListener("touchstart", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_tri").addEventListener("mousedown", osc1WaveMouseDown, false);
    document.getElementById("osc1_wave_tri").addEventListener("touchstart", osc1WaveMouseDown, false);
    document.getElementById("osc1_vol").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("osc1_vol").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("osc1_semi").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("osc1_semi").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("osc1_xenv").addEventListener("mousedown", boxMouseDown, false);
    document.getElementById("osc1_xenv").addEventListener("touchstart", boxMouseDown, false);
    document.getElementById("osc2_wave_sin").addEventListener("mousedown", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_sin").addEventListener("touchstart", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_sqr").addEventListener("mousedown", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_sqr").addEventListener("touchstart", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_saw").addEventListener("mousedown", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_saw").addEventListener("touchstart", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_tri").addEventListener("mousedown", osc2WaveMouseDown, false);
    document.getElementById("osc2_wave_tri").addEventListener("touchstart", osc2WaveMouseDown, false);
    document.getElementById("osc2_vol").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("osc2_vol").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("osc2_semi").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("osc2_semi").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("osc2_det").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("osc2_det").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("osc2_xenv").addEventListener("mousedown", boxMouseDown, false);
    document.getElementById("osc2_xenv").addEventListener("touchstart", boxMouseDown, false);
    document.getElementById("noise_vol").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("noise_vol").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("env_att").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("env_att").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("env_sust").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("env_sust").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("env_rel").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("env_rel").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("arp_note1").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("arp_note1").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("arp_note2").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("arp_note2").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("arp_speed").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("arp_speed").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("lfo_wave_sin").addEventListener("mousedown", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_sin").addEventListener("touchstart", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_sqr").addEventListener("mousedown", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_sqr").addEventListener("touchstart", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_saw").addEventListener("mousedown", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_saw").addEventListener("touchstart", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_tri").addEventListener("mousedown", lfoWaveMouseDown, false);
    document.getElementById("lfo_wave_tri").addEventListener("touchstart", lfoWaveMouseDown, false);
    document.getElementById("lfo_amt").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("lfo_amt").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("lfo_freq").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("lfo_freq").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("lfo_fxfreq").addEventListener("mousedown", boxMouseDown, false);
    document.getElementById("lfo_fxfreq").addEventListener("touchstart", boxMouseDown, false);
    document.getElementById("fx_filt_lp").addEventListener("mousedown", fxFiltMouseDown, false);
    document.getElementById("fx_filt_lp").addEventListener("touchstart", fxFiltMouseDown, false);
    document.getElementById("fx_filt_hp").addEventListener("mousedown", fxFiltMouseDown, false);
    document.getElementById("fx_filt_hp").addEventListener("touchstart", fxFiltMouseDown, false);
    document.getElementById("fx_filt_bp").addEventListener("mousedown", fxFiltMouseDown, false);
    document.getElementById("fx_filt_bp").addEventListener("touchstart", fxFiltMouseDown, false);
    document.getElementById("fx_freq").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_freq").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_res").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_res").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_dly_amt").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_dly_amt").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_dly_time").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_dly_time").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_pan_amt").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_pan_amt").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_pan_freq").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_pan_freq").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_dist").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_dist").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("fx_drive").addEventListener("mousedown", sliderMouseDown, false);
    document.getElementById("fx_drive").addEventListener("touchstart", sliderMouseDown, false);
    document.getElementById("octaveDown").addEventListener("mousedown", octaveDown, false);
    document.getElementById("octaveDown").addEventListener("touchstart", octaveDown, false);
    document.getElementById("octaveUp").addEventListener("mousedown", octaveUp, false);
    document.getElementById("octaveUp").addEventListener("touchstart", octaveUp, false);
    document.getElementById("keyboard").addEventListener("mousedown", keyboardMouseDown, false);
    document.getElementById("keyboard").addEventListener("touchstart", keyboardMouseDown, false);

    document.getElementById("instrCopy").onmousedown = instrCopyMouseDown;
    document.getElementById("instrPaste").onmousedown = instrPasteMouseDown;

    // Initialize the MIDI handler
    initMIDI();

    // Set up master event handlers
    activateMasterEvents();

    // Show the about dialog (if no song was loaded)
    if (!songData)
      showAboutDialog();

    // Start the jammer
    mJammer.start();

    // Update the jammer rowLen (BPM) - requires that the jammer has been
    // started.
    mJammer.updateRowLen(mSong.rowLen);
  };

};


//------------------------------------------------------------------------------
// Program start
//------------------------------------------------------------------------------

function gui_init()
{
  try
  {
    // Create a global GUI object, and initialize it
    gGui = new CGUI();
    gGui.init();
  }
  catch (err)
  {
    alert("Unexpected error: " + err.message);
  }
}

