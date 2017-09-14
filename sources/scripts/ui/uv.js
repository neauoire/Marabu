function UI_Uv()
{
  this.el = null;

  this.vol_name_el = document.createElement("t");
  this.vol_canvas = document.createElement("canvas");
  this.env_name_el = document.createElement("t");
  this.env_canvas = document.createElement("canvas");
  this.wav_name_el = document.createElement("t");
  this.wav_canvas = document.createElement("canvas");

  this.size = {width:45,height:15};

  var mFollowerLastVULeft = 0;
  var mFollowerLastVURight = 0;

  this.install = function()
  {
    this.el = document.getElementById("uv");

    this.el.appendChild(this.vol_name_el);
    this.el.appendChild(this.vol_canvas);
    this.el.appendChild(document.createElement("hr"));
    this.el.appendChild(this.env_name_el);
    this.el.appendChild(this.env_canvas);
    this.el.appendChild(document.createElement("hr"));
    this.el.appendChild(this.wav_name_el);
    this.el.appendChild(this.wav_canvas);

    this.vol_name_el.className = "name fl";
    this.vol_name_el.innerHTML = "VOL";
    this.vol_name_el.style.width = "30px";
    this.vol_name_el.style.display = "inline-block";

    this.vol_canvas.style.width = this.size.width+"px";
    this.vol_canvas.style.height = this.size.height+"px";
    this.vol_canvas.width = this.size.width * 2;
    this.vol_canvas.height = this.size.height * 2;

    this.env_name_el.className = "name fl";
    this.env_name_el.innerHTML = "ENV";
    this.env_name_el.style.width = "30px";
    this.env_name_el.style.display = "inline-block";

    this.env_canvas.style.width = this.size.width+"px";
    this.env_canvas.style.height = this.size.height+"px";
    this.env_canvas.width = this.size.width * 2;
    this.env_canvas.height = this.size.height * 2;

    this.wav_name_el.className = "name fl";
    this.wav_name_el.innerHTML = "WAV";
    this.wav_name_el.style.width = "30px";
    this.wav_name_el.style.display = "inline-block";

    this.wav_canvas.style.width = this.size.width+"px";
    this.wav_canvas.style.height = this.size.height+"px";
    this.wav_canvas.width = this.size.width * 2;
    this.wav_canvas.height = this.size.height * 2;

    this.el.style.width = "120px";
    this.el.style.padding = "0px 2.5px";

    var vol_ctx = this.vol_canvas.getContext("2d");
    var env_ctx = this.env_canvas.getContext("2d");
    var wav_ctx = this.env_canvas.getContext("2d");

    vol_ctx.setLineDash([2, 2]);
    vol_ctx.lineWidth = 2;
    env_ctx.setLineDash([2, 2]);
    env_ctx.lineWidth = 2;
    wav_ctx.setLineDash([2, 2]);
    wav_ctx.lineWidth = 2;

    this.clear();
  }

  var getSamplesSinceNote = function (t, chan)
  {
    var mSong = marabu.song.song();
    var nFloat = t * 44100 / mSong.rowLen;
    var n = Math.floor(nFloat);
    var seqPos0 = Math.floor(n / mSong.patternLen);
    var patPos0 = n % mSong.patternLen;
    for (var k = 0; k < mSong.patternLen; ++k) {
      var seqPos = seqPos0;
      var patPos = patPos0 - k;
      while (patPos < 0) {
        --seqPos;
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

  this.clear = function()
  {
    var vol_ctx = this.vol_canvas.getContext("2d");
    var env_ctx = this.env_canvas.getContext("2d");
    var wav_ctx = this.env_canvas.getContext("2d");

    vol_ctx.clearRect(0, 0, this.size.width * 2, this.size.height * 2);
    env_ctx.clearRect(0, 0, this.size.width * 2, this.size.height * 2);
    wav_ctx.clearRect(0, 0, this.size.width * 2, this.size.height * 2);

    vol_ctx.strokeStyle = marabu.theme.active.f_low;
    vol_ctx.beginPath();
    vol_ctx.moveTo(0,15);
    vol_ctx.lineTo(this.size.width * 2,15);
    vol_ctx.stroke();

    env_ctx.strokeStyle = marabu.theme.active.f_low;
    env_ctx.beginPath();
    env_ctx.moveTo(0,15);
    env_ctx.lineTo(this.size.width * 2,15);
    env_ctx.stroke();
  }

  this.draw = function(t)
  {
    if(t <= 0){ return; }

    this.clear();

    var pl = 0, pr = 0;
    var vol_ctx = this.vol_canvas.getContext("2d");
    var env_ctx = this.env_canvas.getContext("2d");
    var wav_ctx = this.wav_canvas.getContext("2d");

    // Get the waveform
    var wave = marabu.song.player().getData(t, 1000);

    wav_ctx.clearRect(0, 0, this.size.width * 2, this.size.height * 2);
    wav_ctx.strokeStyle = marabu.theme.active.f_high;
    wav_ctx.beginPath();
    wav_ctx.setLineDash([2, 2]);
    wav_ctx.lineWidth = 2;
    wav_ctx.moveTo(0,this.size.height);

    // Calculate volume
    var i, l, r;
    var sl = 0, sr = 0, l_old = 0, r_old = 0;
    for (i = 1; i < wave.length; i += 2)
    {
      this.clear();

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

      var last_x = 0;
      var x = parseInt(i/20);

      if(parseInt(x) != parseInt(last_x) && x < this.size.width * 2){
        var mod = ((l+r)/2.0) * 20;
        var y = this.size.height + mod;
        // y = y * (i/parseFloat(this.width));
        y = clamp(y,0,this.size.height*2);
        wav_ctx.lineTo(x, y);
        last_x = x;
      }
    }
    wav_ctx.stroke();

    // Low-pass filtered mean power (RMS)
    pl = Math.sqrt(pl / wave.length) * 0.2 + mFollowerLastVULeft * 0.8;
    pr = Math.sqrt(pr / wave.length) * 0.2 + mFollowerLastVURight * 0.8;
    mFollowerLastVULeft = pl;
    mFollowerLastVURight = pr;

    var index = ((pl+pr)/2) * 2.0;

    vol_ctx.strokeStyle = marabu.theme.active.f_high;
    vol_ctx.beginPath();
    vol_ctx.moveTo(0,15);
    vol_ctx.lineTo((this.size.width * 2) * index,15);
    vol_ctx.stroke();

    for (i = 0; i < 16; ++i)
    {
      var env_a = marabu.song.song().songData[i].i[10],
          env_s = marabu.song.song().songData[i].i[11],
          env_r = marabu.song.song().songData[i].i[12];
      env_a = env_a * env_a * 4;
      env_r = env_s * env_s * 4 + env_r * env_r * 4;
      var env_tot = env_a + env_r;
      if (env_tot < 10000)
      {
        env_tot = 10000;
        env_r = env_tot - env_a;
      }

      var numSamp = getSamplesSinceNote(t, i);
      if (numSamp >= 0 && numSamp < env_tot)
      {
        var alpha = (numSamp < env_a) ? alpha = numSamp / env_a : 1 - (numSamp - env_a) / env_r;
        env_ctx.strokeStyle = marabu.theme.active.f_high;
        env_ctx.beginPath();
        env_ctx.moveTo(0,15);
        env_ctx.lineTo((this.size.width * 2) * alpha,15);
        env_ctx.stroke();
      }
    }

  }

  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
}