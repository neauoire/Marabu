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
    var defaultInstr = { name: "FORM sin", i: [3,100,111,0,0,100,111,0,0,0,0,0,63,0,0,0,121,0,100,2,255,0,0,63,0,0,0,0,0] };

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
    song.songData[2].name = "PAD1";
    song.songData[3].i = [2,100,111,0,1,50,111,24,0,0,0,50,123,0,50,0,255,27,0,0,255,150,0,63,0,0,0,0,255,0];
    song.songData[3].name = "PAD2";

    song.songData[4].name = "KICK";
    song.songData[4].i = [2,0,92,0,0,255,92,23,1,0,14,0,74,0,0,0,89,0,1,1,16,0,21,255,49,6,0,0,0];
    song.songData[5].name = "SNAR";
    song.songData[5].i = [0,221,92,1,0,210,92,0,1,192,4,0,46,0,0,1,97,141,1,3,93,0,4,57,20,0,0,6,0];
    song.songData[6].name = "HIHA";
    song.songData[6].i = [0,0,140,0,0,0,140,0,0,60,4,10,34,0,0,0,187,5,0,1,239,135,0,170,87,5,0,4,0];
    song.songData[7].name = "TOMS";
    song.songData[7].i = [0,192,104,1,0,80,99,0,0,0,4,0,66,0,0,3,0,0,0,1,0,1,2,32,37,4,0,0,0];

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