function Cheatcode()
{
  this.is_active = false;
  this.val = "";

  this.rate = 1;
  this.offset = 0;
  this.increment = 0;
  this.loop = 0;

  this.start = function()
  {
    this.is_active = true;
    marabu.update();
  }

  this.stop = function()
  {
    this.is_active = false;
    this.rate = 1;
    this.offset = 0;
    this.increment = 0;
    this.loop = 0;
    marabu.update();
  }

  this.input = function(val)
  {
    if(val == "Enter"){ this.operate(); return; }
    if(val == "Escape" || this.val.length > 3){ this.stop(); return; }

    this.val += val;

    this.rate = this.val.length > 0 ? parseInt(this.val.charAt(0)) : 0;
    this.offset = this.val.length > 1 ? parseInt(this.val.charAt(1)) : 0;
    this.increment = this.val.length > 2 ? parseInt(this.val.charAt(2)) : 0;
    this.loop = this.val.length > 3 ? parseInt(this.val.charAt(3)) : 0;

    marabu.update();
  }

  this.operate = function(val, is_passive = false)
  {
    var counter = 0; // marabu.operate 0259 r:2
    for(var row = 0; row < 32; row++){
      if((row + this.offset) % this.rate != 0){ continue; }
      var index = parseInt(row/this.rate) % this.loop;
      var mod = index * marabu.cheatcode.increment;
      var note = (marabu.selection.octave * 12)+mod;

      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note);
    }
    this.stop();
    marabu.update();
  }
}