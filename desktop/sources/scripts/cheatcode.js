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
    console.log("cheatcode","start")
    marabu.loop.stop();

    var active_pattern = marabu.song.pattern_at(marabu.selection.instrument,marabu.selection.track);

    if(active_pattern == 0){ return; }

    this.is_active = true;
    this.select();
    marabu.selection.row = 0;
    marabu.update();
    marabu.controller.set("cheatcode");
  }

  this.stop = function()
  {
    console.log("cheatcode","stop")
    this.is_active = false;
    this.rate = 1;
    this.offset = 0;
    this.length = 0;

    this.val = "";
    marabu.update();
    marabu.controller.set("default");
  }

  this.set_rate = function(mod)
  {
    this.rate = mod;
    this.select();
    marabu.update();
  }

  this.set_offset = function(mod)
  {
    this.offset += mod;
    this.select();
    marabu.update();
  }

  this.set_length = function(mod)
  {
    this.length = this.length == 0 ? 1 : this.length;
    this.length += mod;
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
    console.log("cheatcode","ins")
    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue; }
      var note = (marabu.selection.octave * 12)+mod;
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note);
      this.selection[row] = 0;
      marabu.selection.row = (row+1)%32;
      marabu.update();
      if(this.selection_count() == 0){ this.stop(); }
      return;
    }
    marabu.history.push(marabu.song.song());
  }

  this.del = function()
  {
    console.log("cheatcode","del")
    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue;}
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,-87);
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row+32,-87);
    }
    marabu.history.push(marabu.song.song());
    this.stop();
  }

  this.mod = function(mod)
  {
    console.log("cheatcode","mod")
    for(var row = 0; row < 32; row++){
      if(!this.selection[row]){ continue;}
      var note = marabu.song.note_at(marabu.selection.instrument,marabu.selection.track,row);
      if(note == 0){ continue; }
      note += mod;
      marabu.selection.row = row;
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note-87);
    }
    marabu.history.push(marabu.song.song());
    marabu.update();
  } 

  this.stash = null;

  this.copy = function()
  {
    console.log("cheatcode","copy")
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
    console.log("cheatcode","paste")
    for(var row = 0; row < 32; row++){
      var target_row = (row + marabu.selection.row) % 32;
      if(this.stash[row] == 0){ continue; }
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,target_row,this.stash[row]-87);
    }
    marabu.history.push(marabu.song.song());
    this.stop();
  }
}