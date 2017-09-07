function Marabu()
{
  this.el = document.createElement("app");
  this.el.className = "noir";
  this.el.id = "marabu";

  this.wrapper_el = document.createElement("yu"); 
  this.wrapper_el.className = "wrapper";

  this.el.appendChild(this.wrapper_el);

  document.body.appendChild(this.el);

  this.song = null;
  this.sequencer = null;
  this.editor = null;
  this.instrument = null;

  this.selection = {instrument:0,track:0,row:0,octave:5,control:0,bpm:120};
  this.formats = ["mar"];
  this.channels = 16;

  this.song = new Song();
  this.sequencer = new Sequencer(120);
  this.editor = new Editor(8,4);
  this.instrument = new Instrument();

  this.start = function()
  {
    this.wrapper_el.innerHTML += this.sequencer.build();
    this.wrapper_el.innerHTML += this.editor.build();
    this.wrapper_el.innerHTML += this.instrument.build();

    this.song.init();

    this.sequencer.start();
    this.editor.start();
    this.instrument.start();  

    this.sequencer.update();
    this.editor.update();
    this.instrument.update();  
  }

  this.update = function()
  {
    this.selection.instrument = clamp(this.selection.instrument,0,this.channels-1);
    this.selection.track = clamp(this.selection.track,0,32);
    this.selection.row = clamp(this.selection.row,0,32);
    this.selection.octave = clamp(this.selection.octave,0,8);
    this.selection.control = clamp(this.selection.control,0,28);

    console.log("Update",this.selection);

    this.sequencer.update();
    this.editor.update();
    this.instrument.update();
  }

  // Controls

  this.move_inst = function(mod)
  {
    this.selection.instrument += mod;
    this.update();
  }

  this.move_pattern = function(mod)
  {
    var p = this.song.pattern_at(this.selection.instrument,this.selection.track) + mod;
    p = clamp(p,0,15);
    this.song.inject_pattern_at(this.selection.instrument,this.selection.track,p);
    this.update();
  }

  this.move_row = function(mod)
  {
    this.selection.row += mod;
    this.update();
  }

  this.move_track = function(mod)
  {
    this.selection.track += mod;
    this.update();
  }

  this.move_octave = function(mod)
  {
    this.selection.octave += mod;
    this.update();
  }

  this.move_control = function(mod)
  {
    this.selection.control += mod;
    this.update();
  }

  this.move_control_value = function(mod)
  {
    var control = this.instrument.control_target(this.selection.control);
    control.mod(mod);
    control.save();
  }

  this.save_control_value = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    var control_storage = this.instrument.get_storage(control.id);
    var control_value = control.value;

    this.song.inject_effect_at(this.selection.instrument,this.selection.track,this.selection.row,control_storage+1,control_value);
    this.update();
  }

  this.set_note = function(val)
  {
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row,val-87);
    this.update();
  }

  this.move_note_value = function(mod)
  {
    var note = marabu.song.note_at(this.selection.instrument,this.selection.track,this.selection.row);

    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row,note+mod-87);
    this.update();
  }

  this.play_note = function(note,right_hand)
  {
    var note_value = note + (this.selection.octave * 12);
    this.song.play_note(note_value);
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row+(right_hand ? 0 : 32),note_value);
    this.update();
  }

  // Methods

  this.play = function()
  {
    console.log("Play!")
    this.song.play_song();
  }

  this.stop = function()
  {
    console.log("Stop!")
    this.song.stop_song();
  }

  this.load_file = function(track)
  {
    marabu.song.replace_song(track);
    marabu.update();
  }

  this.save_file = function(val, is_passive = false)
  {  
    this.song.update_ranges();
    var str = JSON.stringify(this.song.song());

    var blob = new Blob([str], {type: "application/json;charset=" + document.characterSet});
    var d = new Date(), e = new Date(d), since_midnight = e - d.setHours(0,0,0,0);
    var timestamp = parseInt((since_midnight/864) * 10);
    saveAs(blob, "export.mar");
  }

  this.render = function(val, is_passive = false)
  {
    this.song.export_wav();
  }

  this.set_bpm = function(val, is_passive = false)
  {
    var val = clamp(parseInt(val),80,600);
    this.selection.bpm = val;
    this.song.update_bpm(this.selection.bpm);
  }

  this.operate = function(val, is_passive = false)
  {
    var loop = val.split(" ")[0].split(""); // s.charAt(0)
    var rate = parseInt(lobby.commander.find_variable("r:",4));

    var counter = 0; // marabu.operate 0259 r:2
    for(var row = 0; row < 32; row++){
      if(row % rate != 0){ continue; }
      var mod = parseInt(loop[counter]);
      var note = (this.selection.octave * 12)+mod;

      this.song.inject_note_at(this.selection.instrument,this.selection.track,row,note);

      counter += 1;
      counter = counter % loop.length;
    }
    this.update();
  }

  this.when_key = function(e)
  {
    var key = e.key;

    if(key == "Escape"){ marabu.song.stop_song(); return; }

    // Sequencer

    if(key == "+")         { marabu.move_pattern(1); return; }
    if(key == "-")         { marabu.move_pattern(-1); return; }
    if(key == "_")         { marabu.move_pattern(-1); return; }
    if(key == "ArrowDown" && (e.altKey || e.metaKey))         { marabu.move_track(1); e.preventDefault(); return; }
    if(key == "ArrowUp" && (e.altKey || e.metaKey))         { marabu.move_track(-1); e.preventDefault();return; }

    // Editor

    if(key == "ArrowRight"){ marabu.move_inst(1); return; }
    if(key == "ArrowLeft") { marabu.move_inst(-1); return; }
    if(key == "ArrowDown") { marabu.move_row(1); return; }
    if(key == "ArrowUp")   { marabu.move_row(-1); return; }
    if(key == "/")         { marabu.save_control_value(); return; }
    if(key == "Backspace") { marabu.set_note(0); return; }

    // Instrument

    if(key == ")") { marabu.move_note_value(12); return; }
    if(key == "(") { marabu.move_note_value(-12); return; }
    if(key == "0") { marabu.move_note_value(1); return; }
    if(key == "9") { marabu.move_note_value(-1); return; }
    if(key == "l") { marabu.move_control(1); return; }
    if(key == "p") { marabu.move_control(-1); return; }
    if(key == "2") { marabu.move_control(1); return; }
    if(key == "1") { marabu.move_control(-1); return; }
    if(key == "]") { marabu.move_control_value(10); return; }
    if(key == "[") { marabu.move_control_value(-10); return; }
    if(key == "}") { marabu.move_control_value(1); return; }
    if(key == "{") { marabu.move_control_value(-1); return; }
    if(key == "x") { marabu.move_octave(1); return; }
    if(key == "z") { marabu.move_octave(-1); return; }

    // Global

    if(e.ctrlKey || e.metaKey){
      if(key == " "){ marabu.play(); }
      if(key == "r"){ marabu.render(); }
      if(key == "s"){ marabu.save_file(); }
      return;
    }

    // Keyboard

    var note = null;
    var is_cap = key == key.toLowerCase();
    switch (key.toLowerCase())
    {
      case "a": marabu.play_note(0,is_cap); break;
      case "s": marabu.play_note(2,is_cap); break;
      case "d": marabu.play_note(4,is_cap); break;
      case "f": marabu.play_note(5,is_cap); break;
      case "g": marabu.play_note(7,is_cap); break;
      case "h": marabu.play_note(9,is_cap); break;
      case "j": marabu.play_note(11,is_cap); break;

      case "w": marabu.play_note(1,is_cap); break;
      case "e": marabu.play_note(3,is_cap); break;
      case "t": marabu.play_note(6,is_cap); break;
      case "y": marabu.play_note(8,is_cap); break;
      case "u": marabu.play_note(10,is_cap); break;
    }

  }
  window.addEventListener("keydown", this.when_key, false);
}

window.addEventListener('dragover',function(e)
{
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('drop', function(e)
{
  e.stopPropagation();
  e.preventDefault();

  var files = e.dataTransfer.files;
  var file = files[0];

  if (file.name.indexOf(".mar") == -1) { console.log("Wrong Format"); return false; }

  var reader = new FileReader();
  reader.onload = function(e){
    var o = JSON.parse(e.target.result);
    marabu.load_file(o);
  };
  reader.readAsText(file);
});

window.onbeforeunload = function(e)
{

};

// Tools

var parse_note = function(val)
{
  val -= 87;
  var notes = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
  var octave = Math.floor((val)/12);
  var key = notes[(val) % 12];
  var key_sharp = key.substr(1,1) == "#" ? true : false;
  var key_note = key.substr(0,1);
  return {octave:octave,sharp:key_sharp,note:key_note};
}

var to_hex = function(num, count)
{
  var s = num.toString(16).toUpperCase();
  for (var i = 0; i < (count - s.length); ++i){
    s = "0" + s;
  }
  return s;
};

var clamp = function(val,min,max)
{
  val = val < min ? min : val;
  val = val > max ? max : val;
  return val;
}

var calcSamplesPerRow = function(bpm)
{
  return Math.round((60 * 44100 / 4) / bpm);
};