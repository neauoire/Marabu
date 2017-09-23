function Loop()
{
  this.is_active = false;

  this.x = 0;
  this.width = 0;
  this.y = 0;
  this.height = 0;

  this.reset = function()
  {
    this.x = 0;
    this.width = 15;
    this.y = marabu.selection.track;
    this.height = 0;
  }

  this.start = function()
  {
    marabu.cheatcode.stop();
    this.is_active = true;
    this.reset();
    marabu.update();
  }

  this.stop = function()
  {
    this.is_active = false;
    this.reset();
    marabu.update();
  }

  this.buffer = [];

  this.copy = function()
  {
    this.buffer = [];
    for(var i = 0; i < 16; i++){
      this.buffer[i] = marabu.song.song().songData[i].p.slice(this.y,this.y+this.height+1);
    }
    this.stop();
  }

  this.paste = function()
  {
    for(var i = 0; i < 16; i++){
      marabu.song.song().songData[i].p.splice(this.y, 0, ...this.buffer[i]);
    }
    this.stop();
  }

  this.solo = function()
  {
    this.x = marabu.selection.instrument;
    this.width = 0;
    this.y = marabu.selection.track;
    this.height = 0;
    marabu.update();
  }

  this.input = function(e)
  {
    if(e.key == "Control" || e.key == "Meta"){ return; }
    if(e.key == "Escape"){ this.stop(); return; }
    if(e.key == "/"){ this.solo(); }
    if(e.key == "Enter"){ this.play(); return; }
    if(e.key == "c"){ this.copy(); return; }
    if(e.key == "v"){ this.paste(); return; }

    if(parseInt(e.key) > 0){
      this.height = parseInt(e.key)-1;
    }

    marabu.update();
  }

  this.play = function()
  {
    var opts = {
      firstCol: this.x,
      lastCol: this.x + this.width,
      firstRow: this.y,
      lastRow: this.y + this.height
    };
    this.stop();

    marabu.song.play_loop(opts);
  }
}