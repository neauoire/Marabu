function Track()
{
  var MAX_SONG_ROWS = 32, MAX_PATTERNS = 32;

    var song = {}, i, j, k, instr, col;

    // Settings
    song.artist = "Unknown";
    song.name = "Untitled";
    song.theme = {background:"#000",f_high:"#fff",f_med:"#999",f_low:"#555",f_inv:"#000",f_special:"#000",b_high:"#000",b_med:"#555",b_low:"#222",b_inv:"#fff",b_special:"#72dec2"};
    song.bpm = 120;

    // Automated
    song.rowLen = calcSamplesPerRow(song.bpm);
    song.endPattern = 2;
    song.patternLen = 32;

    // Select the default instrument from the presets
    var defaultInstr = { name: "FORM sin", i: [15,67,111,0,0,100,111,6,0,0,0,0,153,0,20,0,0,123,64,2,205,90,0,63,127,0,0,0,190,0] };

    // All 8 instruments
    song.songData = [];
    for (i = 0; i < marabu.channels; i++) {
      instr = {};
      instr.i = [];

      // Instrument
      for (j = 0; j <= defaultInstr.i.length; ++j) {
        instr.i[j] = defaultInstr.i[j];
      }

      // Sequence
      instr.p = [];
      for (j = 0; j < marabu.sequencer.length; j++)
        instr.p[j] = 0;

      // Patterns
      instr.c = [];
      for (j = 0; j < MAX_PATTERNS; j++)
      {
        col = {};
        col.n = [];
        for (k = 0; k < song.patternLen * 2; k++)
          col.n[k] = 0;
        col.f = [];
        for (k = 0; k < song.patternLen * 2; k++)
          col.f[k] = 0;
        instr.c[j] = col;
      }
      song.songData[i] = instr;
    }

    // Default instruments
    song.songData[0].name = "SYN1";
    song.songData[1].name = "SYN2";
    song.songData[2].name = "CH02";
    song.songData[3].name = "CH03";

    song.songData[4].name = "CH04";
    song.songData[5].name = "CH05";
    song.songData[6].name = "CH06";
    song.songData[7].name = "CH07";

    song.songData[8].name = "CH08";
    song.songData[9].name = "CH09";
    song.songData[10].name = "CH10";
    song.songData[11].name = "CH11";
    song.songData[12].name = "CH12";
    song.songData[13].name = "CH13";
    song.songData[14].name = "CH14";
    song.songData[15].name = "CH15";
    
    // Make a first empty pattern
    song.songData[0].p[0] = 1;

    return song;
};