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
    this.height = 1;
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

  this.solo = function()
  {
    this.x = marabu.selection.instrument;
    this.width = 0;
    this.y = marabu.selection.track;
    this.height = 1;
    marabu.update();
  }

  this.input = function(e)
  {
    if(e.key == "Control" || e.key == "Meta"){ return; }
    if(e.key == "Escape"){ this.stop(); return; }
    if(e.key == "/"){ this.solo(); }
    if(e.key == "Enter"){ this.play(); return; }

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