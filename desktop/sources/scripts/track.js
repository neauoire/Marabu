function Track()
{
  var MAX_SONG_ROWS = 32, MAX_PATTERNS = 32, MAX_INSTRUMENTS = 16;

  var song = {}, i, j, k, instr, col;

  // Settings  
  song.artist = "Unknown";
  song.name = "Untitled";
  song.bpm = 120;

  song.theme = new Theme().default;

  // Automated
  song.rowLen = calcSamplesPerRow(song.bpm);
  song.endPattern = 2;
  song.patternLen = 32;

  // All 8 instruments
  song.songData = [];
  for (i = 0; i < MAX_INSTRUMENTS; i++){
    instr = {};
    instr.i = [15,67,111,0,0,100,111,6,0,0,0,0,153,0,20,0,0,8,64,2,205,90,0,63,127,0,0,0,190,0,0];

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
      for (k = 0; k < song.patternLen * 2; k++)
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

  song.songData[0].name = "SYN1"
  song.songData[1].name = "SYN2"
  song.songData[2].name = "PAD1"
  song.songData[3].name = "PAD2"

  song.songData[4].name = "IDM1"
  song.songData[5].name = "IDM2"
  song.songData[6].name = "TXT1"
  song.songData[7].name = "TXT2"

  song.songData[8].name  = "SNAR"
  song.songData[9].name  = "CLAP"
  song.songData[10].name = "BASS"
  song.songData[11].name = "KICK"

  song.songData[12].name  = "INST"
  song.songData[13].name  = "INST"
  song.songData[14].name = "INST"
  song.songData[15].name = "INST"

  return song;
};