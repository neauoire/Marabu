function Loop()
{
  this.is_active = false;
  this.val = "";

  this.x = 0;
  this.width = 0;
  this.y = 0;
  this.height = 0;

  this.start = function()
  {
    marabu.cheatcode.stop();
    this.is_active = true;
    this.x = marabu.selection.instrument;
    this.width = 1;
    this.y = 0;
    this.height = 1;
    marabu.update();
  }

  this.stop = function()
  {
    this.is_active = false;
    this.x = 0;
    this.width = 0;
    this.y = 0;
    this.height = 0;
    this.val = "";
    marabu.update();
  }

  this.input = function(e)
  {
    if(e.key == "Control" || e.key == "Meta"){ return; }
    if(e.key == "Escape" || this.val.length > 4){ this.stop(); return; }

    if(e.key == "Enter"){ this.play(); return; }

    this.val += e.key;

    this.x = this.val.length > 0 ? hex_to_int(this.val.charAt(0)) : marabu.selection.instrument;
    this.y = this.val.length > 1 ? hex_to_int(this.val.charAt(1)) : 0;
    this.width = this.val.length > 2 ? hex_to_int(this.val.charAt(2)) : 1;
    this.height = this.val.length > 3 ? hex_to_int(this.val.charAt(3)) : 1;

    marabu.update();
  }

  this.play = function()
  {
    this.stop();

    var opts = {
      firstRow: this.x,
      lastRow: this.x + this.width,
      firstCol: this.y,
      lastCol: this.y + this.height
    };

    marabu.song.play_loop(opts);
  }
}