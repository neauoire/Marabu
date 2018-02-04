var Song = function()
{
  var MAX_SONG_ROWS = 32,
      MAX_PATTERNS = 32;

  // Resources
  var mSong = {};
  var mAudio = null;
  var mAudioTimer = new CAudioTimer();
  var mPlayer = new CPlayer();
  var mJammer = new CJammer();

  this.mAudio = function(){ return mAudio; }
  this.mAudio_timer = function(){ return mAudioTimer; }

  this.mJammer = mJammer;

  var mPreload = [];

  //--------------------------------------------------------------------------
  // Song import/export functions
  //--------------------------------------------------------------------------

  this.player = function()
  {
    return mPlayer;
  }

  this.get_bpm = function()
  {
    return Math.round((60 * 44100 / 4) / mSong.rowLen);
  };

  this.update_bpm = function(bpm)
  {
    console.log(bpm)
    mSong.rowLen = calcSamplesPerRow(bpm);
    mJammer.updateRowLen(mSong.rowLen);
  }

  this.update_rpp = function(rpp)
  {
    setPatternLength(rpp);
    marabu.update();
  }

  this.play_note = function(note)
  {
    mJammer.addNote(note+87);
  }

  this.song = function()
  {
    return mSong;
  }

  this.to_string = function()
  {
    return JSON.stringify(this.song());
  }

  this.replace_song = function(new_song)
  {
    if(!new_song.name){ return; }
    stopAudio();

    mSong = new_song;

    this.update_bpm(mSong.bpm ? mSong.bpm : 120);
    this.update_rpp(32);

    // Inject names
    for(id in this.song().songData){
      var ins = this.song().songData[id];
      ins.name = ins.name && ins.name.length > 3 ? ins.name.substr(0,4) : `INS${to_hex_val(id).toUpperCase()}`
    }

    updateSongRanges();
  }

  this.mJammer_update = function()
  {
    return mJammer.updateInstr(this.instrument().i);
  }

  this.instrument = function(id = marabu.selection.instrument)
  {
    return this.song().songData[id];
  }

  //

  this.pattern_at = function(i,t)
  {
    return this.song().songData[i].p[t];
  }

  this.inject_pattern_at = function(i,t,v)
  {
    this.song().songData[i].p[t] = v;
    this.update_ranges();
    marabu.update();
  }

  this.note_at = function(i,t,n)
  {
    var c = this.pattern_at(i,t)-1; if(c == -1){ return; }
    return this.song().songData[i].c[c].n[n];
  }

  this.inject_note_at = function(i,t,n,v)
  {
    var c = this.pattern_at(i,t)-1; if(c == -1){ return; }
    this.song().songData[i].c[c].n[n] = (v == -87 ? 0 : clamp(v,36,107)+87);
  }

  this.effect_at = function(i,t,f)
  {
    var c = this.pattern_at(i,t)-1; if(c == -1){ return; }
    return this.song().songData[i].c[c].f[f];
  }

  this.effect_value_at = function(i,t,f)
  {
    var c = this.pattern_at(i,t)-1; if(c == -1){ return; }
    return this.song().songData[i].c[c].f[f+32];
  }

  this.inject_effect_at = function(i,t,f,cmd,val)
  {
    if(!cmd || val === undefined){ return; }
    var c = this.pattern_at(i,t)-1; if(c == -1){ return; }
    this.song().songData[i].c[c].f[f] = cmd;
    this.song().songData[i].c[c].f[f+32] = val;
  }

  this.erase_effect_at = function(i,t,f)
  {
    var c = this.pattern_at(i,t)-1; if(c == -1){ return; }
    this.song().songData[i].c[c].f[f] = 0;
    this.song().songData[i].c[c].f[f+32] = 0;
  }

  this.control_at = function(i,s)
  {
    return this.song().songData[i].i[s];
  }

  this.inject_control = function(i,s,v)
  {
    this.song().songData[i].i[s] = v;
    this.mJammer_update();
  }

  var setPatternLength = function (length)
  {
    if (mSong.patternLen === length)
      return;

    stopAudio();

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

  this.update_ranges = function()
  {
    updateSongRanges();
  }

  var updateSongRanges = function ()
  {
    var i, j, emptyRow;

    // Determine the last song pattern
    mSong.endPattern = marabu.sequencer.length + 1;
    for (i = marabu.sequencer.length; i >= 0; --i) {
      emptyRow = true;
      for (j = 0; j < 16; ++j) {
        if (mSong.songData[j].p[i] > 0) {
          emptyRow = false;
          break;
        }
      }
      if (!emptyRow) break;
      mSong.endPattern--;
    }
  };

  this.export_wav = function(opts = null)
  {
    updateSongRanges();
    
    var doneFun = function(wave)
    {
      var blob = new Blob([wave], {type: "application/octet-stream"});
      saveAs(blob, "render.wav");
    };
    generateAudio(doneFun,opts);
  };

  this.calculate_time = function(pos = (8 * (marabu.song.length+1)))
  {
    var bpm = parseFloat(marabu.song.song().bpm);
    var beats = pos;
    var minutes = beats/bpm; 
    var seconds = minutes * 60;

    return seconds;
  }

  var generateAudio = function(doneFun, opts, override_song = null)
  {
    var display_progress_el = document.getElementById("fxr31");
    var song = mSong;
    var render_time = marabu.song.calculate_time();
    var minutes = Math.floor(render_time/60.0);
    var seconds = Math.floor(render_time % 60);

    var d1 = new Date();
    mPlayer = new CPlayer();
    mPlayer.generate(song, opts, function(progress){
      if(progress >= 1){
        var wave = mPlayer.createWave();
        var d2 = new Date();
        doneFun(wave);
        display_progress_el.className = "fl";
      }
      else{
        display_progress_el.className = "b_inv f_inv";
        display_progress_el.textContent = prepend_to_length(parseInt(progress * 100),4,"0");
      }
    });
  };

  var stopAudio = function ()
  {
    marabu.sequencer.follower.stop();
    if(mAudio) {
      mAudio.pause();
      mAudioTimer.reset();
    }
  };

  this.stop_song = function()
  {
    stopAudio();
    marabu.selection.row = 0;
    marabu.update();
  }

  this.start_over = function()
  {
    this.currentTime = 0; 
    this.play();
  }

  this.play_song = function()
  {
    mAudio.removeEventListener('ended', marabu.song.start_over, false);

    this.update();
    this.update_bpm(this.song().bpm);
    this.update_rpp(32);

    stopAudio();
    updateSongRanges();

    var doneFun = function(wave)
    {
      console.log("playing..")
      marabu.sequencer.follower.start();
      mAudio.src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
      mAudioTimer.reset();
      mAudio.play();
    };
    generateAudio(doneFun);
  }

  this.play_loop = function(opts,looped_song)
  {
    mAudio.addEventListener('ended', marabu.song.start_over, false);

    this.update_bpm(this.song().bpm);
    this.update_rpp(32);

    this.stop_song();
    updateSongRanges();

    var offset = opts.firstRow;

    var doneFun = function(wave)
    {
      console.log("playing..",offset)
      marabu.sequencer.follower.start(offset);
      mAudio.src = URL.createObjectURL(new Blob([wave], {type: "audio/wav"}));
      mAudioTimer.reset();
      mAudio.play();
    };
    generateAudio(doneFun,opts,looped_song);
  }

  this.length = 0;
  this.is_looping = false;

  this.update = function()
  {
    this.validate();
    this.update_length();
  }

  this.validate = function()
  {
    for(var i = 0; i < 16; ++i) {
      var offset = (this.length+34) - mSong.songData[i].p.length;
      if(offset < 0){ continue; }
      // Fill
      for(var fill = 0; fill < offset; ++fill){
        mSong.songData[i].p.push(0);
      }
    }
  }

  this.update_length = function()
  {
    var l = 0;
    for(var i = 0; i < 16; ++i) {
      for(var p = 0; p < mSong.songData[i].p.length; ++p){
        if(mSong.songData[i].p[p] > 0 && p > l){ l = p; }
      }
    }
    this.length = l;
  }

  //--------------------------------------------------------------------------
  // Initialization
  //--------------------------------------------------------------------------

  this.init = function ()
  {
    var i, j, o;

    // Create audio element, and always play the audio as soon as it's ready
    mAudio = new Audio();
    mAudioTimer.setAudioElement(mAudio);
    mAudio.addEventListener("canplay", function (){ this.play(); }, true);

    mSong = new Track();

    mJammer.start();
    mJammer.updateRowLen(mSong.rowLen);
  };
};

var CAudioTimer = function ()
{
  var mAudioElement = null;
  var mStartT = 0;
  var mErrHist = [0, 0, 0, 0, 0, 0];
  var mErrHistPos = 0;

  this.setAudioElement = function (audioElement)
  {
    mAudioElement = audioElement;
  }

  this.currentTime = function ()
  {
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

  this.reset = function ()
  {
    mStartT = (new Date()).getTime() * 0.001;
    for (var i = 0; i < mErrHist.length; i++){
      mErrHist[i] = 0;
    }
  };
};