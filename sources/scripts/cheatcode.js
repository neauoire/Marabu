function Cheatcode()
{
  this.is_active = false;
  this.val = "";

  this.rate = 1;
  this.offset = 0;
  this.length = 0;

  this.selection = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

  this.start = function()
  {
    marabu.loop.stop();

    var active_pattern = marabu.song.pattern_at(marabu.selection.instrument,marabu.selection.track);

    if(active_pattern == 0){ return; }

    this.is_active = true;
    this.select();
    marabu.selection.row = 0;
    marabu.update();
  }

  this.stop = function()
  {
    this.is_active = false;
    this.rate = 1;
    this.offset = 0;
    this.length = 0;

    this.val = "";
    marabu.update();
  }

  this.input = function(e)
  {
    if(e.key == "k"){ this.start(); return; }
    if(e.key == "Control" || e.key == "Meta" || e.key == "Shift"){ return; }
    if(e.key == "Escape" || this.val.length > 4){ this.stop(); return; }
    if(e.key == "Backspace" || e.key == "Delete"){ this.del(); return; }
    if(e.key == "+"){ this.mod(1); return; }
    if(e.key == "-" || e.key == "_"){ this.mod(-1); return; }

    // Copy/Paste
    if(e.key == "c"){ this.copy(); return; }
    if(e.key == "v"){ this.paste(); return; }

    // Ins
    if(e.key == "a"){ this.ins(0); return; }
    if(e.key == "s"){ this.ins(2); return; }
    if(e.key == "d"){ this.ins(4); return; }
    if(e.key == "f"){ this.ins(5); return; }
    if(e.key == "g"){ this.ins(7); return; }
    if(e.key == "h"){ this.ins(9); return; }
    if(e.key == "j"){ this.ins(11); return; }
    if(e.key == "w"){ this.ins(1); return; }
    if(e.key == "e"){ this.ins(3); return; }
    if(e.key == "t"){ this.ins(6); return; }
    if(e.key == "y"){ this.ins(8); return; }
    if(e.key == "u"){ this.ins(10); return; }

    this.val += e.key;

    this.rate = this.val.length > 0 ? this.val.charAt(0) == "/" ? 32 : hex_to_int(this.val.charAt(0)) : 0;
    this.length = this.val.length > 1 ? hex_to_int(this.val.charAt(1)) : 0;
    this.offset = this.val.length > 2 ? hex_to_int(this.val.charAt(2)) : 0;

    this.select();

    marabu.update();
  }

  this.selection_count = function()
  {
    var count = 0;
    for(var row = 0; row < 32; row++){
      count += this.selection[row];
    }
    return count;
  }

  this.select = function()
  {
    this.selection = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    this.offset = this.offset == 15 ? 16 : this.offset;
    this.length = this.length == 15 ? 16 : this.length;
    for(var row = 0; row < 32; row++){
      var key = (row-this.offset) % this.rate;
      if(key < 0){ key = this.rate + key; }
      if(key == 0 || key < this.length){ this.selection[row] = key+1; }
    }
    if(this.offset > 0){
      marabu.selection.row = (this.offset)%32;  
    }
  }

  this.ins = function(mod)
  {
    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue;}
      var note = (marabu.selection.octave * 12)+mod;
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note);
      this.selection[row] = 0;
      marabu.selection.row = (row+1)%32;
      marabu.update();
      if(this.selection_count() == 0){ this.stop(); }
      return;
    }
    this.stop();
  }

  this.del = function()
  {
    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue;}
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,-87);
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row+32,-87);
    }
    this.stop();
  }

  this.mod = function(mod)
  {
    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue;}
      var note = marabu.song.note_at(marabu.selection.instrument,marabu.selection.track,row);
      if(note == 0){ continue; }
      note += mod;
      marabu.selection.row = row;
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note-87);
    }
    marabu.update();
  } 

  this.stash = null;

  this.copy = function()
  {
    var new_stash = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue;}
      var note = marabu.song.note_at(marabu.selection.instrument,marabu.selection.track,row);
      new_stash[row] = note;
    }
    this.stash = new_stash;
    this.stop();
  }

  this.paste = function()
  {
    for(var row = 0; row < 32; row++){
      var target_row = (row + marabu.selection.row) % 32;
      if(this.stash[row] == 0){ continue; }
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,target_row,this.stash[row]-87);
    }
    this.stop();
  }
}