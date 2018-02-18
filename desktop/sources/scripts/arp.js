function Arp()
{
  this.is_active = false;
  this.is_recording = false;
  this.memory = [];

  this.start = function()
  {
    console.log("arp","start")
    this.is_active = true;
    this.is_recording = true;
    this.memory = [];
    marabu.controller.set("arp");
    marabu.update();
  }

  this.stop = function()
  {
    if(this.is_recording){ this.is_recording = false; marabu.update(); return; }

    this.is_active = false;
    marabu.controller.set("default");
    marabu.update();
  }

  this.ins = function(mod)
  {
    if(mod == -99){
      this.record(null);
      return
    }

    var note = (marabu.selection.octave * 12)+mod;

    if(this.is_recording && mod != null){
      this.record(note);
      return;
    }
    else{
      this.play(note);
    }
  }

  this.play = function(note)
  {
    var key = this.memory[0];
    for(id in this.memory){
      if(marabu.selection.row+parseInt(id) >= 32){ break; }
      var n = this.memory[id];
      var offset = n.distance - key.distance;
      var row = marabu.selection.row+parseInt(id);
      marabu.song.inject_note_at(marabu.selection.instrument,marabu.selection.track,row,note ? this.offset_note(note,offset) : 0);
    }
    marabu.update();
  }

  this.record = function(note)
  {
    this.memory.push(note ? parse_note(note) : 0);
    console.log("record",this.memory)
    marabu.update();
  }

  this.offset_note = function(note,offset)
  {
    var dict = this.notes_dict()[parse_note(note).sharp ? "sharp" : "normal"];
    var index = dict.indexOf(note);

    return dict[index+offset];
  }

  this.notes_dict = function()
  {
    var h = {normal:[],sharp:[]}
    var n = 12 * 3;
    while(n < 87){
      var note = parse_note(n);
      h[note.sharp ? "sharp" : "normal"].push(n)
      n += 1
    }
    return h;
  }
}