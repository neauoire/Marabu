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
    this.val = "";
    marabu.update();
  }

  this.input = function(e)
  {
    if(e.key == "Control" || e.key == "Meta"){ return; }
    if(e.key == "Escape" || this.val.length > 4){ this.stop(); return; }

    if(e.key == "Enter" && (e.ctrlKey || e.metaKey)){ this.mod(); return; }
    if(e.key == "Enter"){ this.ins(); return; }
    if(e.key == "Backspace" || e.key == "Delete"){ this.del(); return; }

    this.val += e.key;

    this.rate = this.val.length > 0 ? parseInt(this.val.charAt(0)) : 0;
    this.offset = this.val.length > 1 ? parseInt(this.val.charAt(1)) : 0;
    this.increment = this.val.length > 2 ? parseInt(this.val.charAt(2)) : 0;
    this.loop = this.val.length > 3 ? parseInt(this.val.charAt(3)) : 0;

    marabu.update();
  }

  this.ins = function()
  {
    var counter = 0;
    for(var row = 0; row < 32; row++){
      if((row + this.offset) % this.rate != 0){ continue; }
      var index = parseInt(row/this.rate) % (this.loop+1);
      var mod = this.loop > 0 ? index * this.increment : this.increment;
      var note = (marabu.selection.octave * 12)+mod;

      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note);
    }
    this.stop();
  }

  this.del = function()
  {
    var counter = 0;
    for(var row = 0; row < 32; row++){
      if((row + this.offset) % this.rate != 0){ continue; }
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,-87);
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row+32,-87);
    }
    this.stop();
  }

  this.mod = function()
  {
    var counter = 0;
    for(var row = 0; row < 32; row++){
      if((row + this.offset) % this.rate != 0){ continue; }
      var index = parseInt(row/this.rate) % (this.loop+1);
      var mod = this.loop > 0 ? index * this.increment : this.increment;
      var note = marabu.song.note_at(marabu.selection.instrument,marabu.selection.track,row)+mod;

      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note-87);
    }
    this.stop();
  }
}