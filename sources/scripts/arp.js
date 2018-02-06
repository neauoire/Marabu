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
    if(this.is_recording){ this.is_recording = false; return; }

    console.log("arp","stop")
    this.is_active = false;
    marabu.controller.set("default");
    marabu.update();
  }

  this.ins = function(mod)
  {
    var note = (marabu.selection.octave * 12)+mod;

    if(this.is_recording){
      this.record(note);
      return;
    }
    else{
      this.play(note);
    }
  }

  this.play = function(note)
  {
    console.log("play",note)
    marabu.update();
  }

  this.record = function(note)
  {
    this.memory.push(parse_note(note));
    console.log("record",this.memory)
    marabu.update();
  }
}