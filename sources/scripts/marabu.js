function Marabu()
{
  this.theme = new Theme();
  
  this.el = document.createElement("app");
  this.el.style.opacity = 0;
  this.el.id = "marabu";

  this.wrapper_el = document.createElement("yu"); 
  this.wrapper_el.className = "wrapper";

  this.el.appendChild(this.wrapper_el);

  document.body.appendChild(this.el);
  document.body.appendChild(this.theme.el);

  this.selection = {instrument:0,track:0,row:0,octave:5,control:0};
  this.channels = 16;

  this.song = new Song();
  this.sequencer = new Sequencer();
  this.editor = new Editor(8,4);
  this.instrument = new Instrument();
  this.cheatcode = new Cheatcode();
  this.loop = new Loop();

  this.start = function()
  {
    this.wrapper_el.innerHTML += "<div id='sequencer'><table class='tracks' id='sequencer-table'></table></div><yu id='scrollbar'></yu><yu id='position'></yu>";
    this.wrapper_el.innerHTML += this.editor.build();
    this.wrapper_el.innerHTML += this.instrument.build();

    this.song.init();
    this.theme.start();

    this.sequencer.start();
    this.editor.start();
    this.instrument.start();  

    this.song.update();
    this.sequencer.update();
    this.editor.update();
    this.instrument.update();

    setTimeout(marabu.show,250)
  }

  this.update = function()
  {
    this.selection.instrument = clamp(this.selection.instrument,0,this.channels-1);
    this.selection.track = clamp(this.selection.track,0,this.sequencer.length-1);
    this.selection.row = clamp(this.selection.row,0,31);
    this.selection.octave = clamp(this.selection.octave,3,8);
    this.selection.control = clamp(this.selection.control,0,23);

    this.song.update();
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

  this.move_bpm = function(mod)
  {
    this.song.song().bpm = this.song.get_bpm() + mod;
    this.song.update_bpm(this.song.get_bpm() + mod);
    this.update();
  }

  this.move_control_value = function(mod,relative)
  {
    var control = this.instrument.control_target(this.selection.control);
    control.mod(mod,relative);
    control.save();
  }

  this.add_control_value = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    var control_storage = this.instrument.get_storage(control.family+"_"+control.id);
    var control_value = control.value;

    this.song.inject_effect_at(this.selection.instrument,this.selection.track,this.selection.row,control_storage+1,control_value);
    this.update();
  }

  this.remove_control_value = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    var control_storage = this.instrument.get_storage(control.family+"_"+control.id);
    var control_value = control.value;

    this.song.erase_effect_at(this.selection.instrument,this.selection.track,this.selection.row);
    this.update();
  }

  this.set_note = function(val)
  {
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row,val-87);
    
    if(val == 0){
      this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row+32,val-87);
    }
    this.update();
  }

  this.move_note_value = function(mod)
  {
    var note = marabu.song.note_at(this.selection.instrument,this.selection.track,this.selection.row);

    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row,note+mod-87);
    this.update();
  }

  this.play_note = function(note,right_hand = true)
  {
    var note_value = note + (this.selection.octave * 12);
    this.song.play_note(note_value);
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row+(right_hand ? 0 : 32),note_value);
    this.update();
  }

  // Methods

  this.is_playing = false;

  this.play = function()
  {
    if(this.selection.row > 0){ this.stop(); return; }
    console.log("Play!");
    this.song.play_song();
    this.is_playing = true;
  }

  this.stop = function()
  {
    console.log("Stop!");
    this.song.stop_song();
    this.instrument.controls.uv.monitor.clear();
    this.is_playing = false;
    this.selection.row = 0;  
    this.update();
  }

  this.path = null;

  this.open = function()
  {
    var filepath = dialog.showOpenDialog({filters: [{name: 'Marabu Files', extensions: ['mar', 'ins']}], properties: ['openFile']});

    if(!filepath){ console.log("Nothing to load"); return; }

    fs.readFile(filepath[0], 'utf-8', (err, data) => {
      if(err){ alert("An error ocurred reading the file :" + err.message); return; }

      marabu.load(data,filepath[0]);
    });
  }

  this.load = function(data,path = "")
  {
    console.log("loading",path);

    var file_type = path.split(".")[path.split(".").length-1];

    if(file_type == "mar"){
      var o = JSON.parse(data);
      marabu.load_file(o);
      marabu.path = path;
    }
    else if(file_type == "ins"){
      var o = JSON.parse(data);
      marabu.load_instrument(o);
    }
    else if(file_type == "thm"){
      var o = JSON.parse(data);
      marabu.theme.install(o);
    }
  }

  this.save = function()
  {
    if(!marabu.path){ marabu.export(); return; }

    fs.writeFile(marabu.path, marabu.song.to_string(), (err) => {
      if(err) { alert("An error ocurred updating the file" + err.message); console.log(err); return; }
      console.log("saved",marabu.path);
      var el = document.getElementById("fxr31");
      if(el){ el.className = "b_inv f_inv"; el.innerHTML = "--OK";  }
    });
  }

  this.export = function()
  {  
    this.song.update_ranges();
    var str = this.song.to_string();

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".mar", str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        marabu.path = fileName+".mar";
        var el = document.getElementById("fxr31");
        if(el){ el.className = "b_inv f_inv"; el.innerHTML = "--OK";  }
      });
    }); 
  }

  this.load_file = function(track)
  {
    if(track.theme){ this.theme.install(track.theme); }

    marabu.song.replace_song(track);
    marabu.update();
  }

  this.export_instrument = function()
  {
    var instr = this.song.instrument();
    var instr_obj = {};
    instr_obj.name = instr.name;
    instr_obj.i = instr.i;
    var str = JSON.stringify(instr_obj);

    dialog.showSaveDialog((fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(fileName+".ins", str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
      });
    }); 
  }

  this.load_instrument = function(instr)
  {
    this.song.song().songData[this.selection.instrument].name = instr.name;
    this.song.song().songData[this.selection.instrument].i = instr.i;
    this.update();
  }

  this.render = function(val, is_passive = false)
  {
    this.song.export_wav();
  }

  this.reset = function()
  {
    this.path = null;
    this.song = new Song();
    this.theme.reset();
    this.song.init();
    this.update();
  }

  this.show = function()
  {
    marabu.el.style.opacity = 1;
  }

  this.when_key = function(e)
  {
    var key = e.key;

    if(marabu.cheatcode.is_active == true){ marabu.cheatcode.input(e); return; }
    if(marabu.loop.is_active == true){ marabu.loop.input(e); return; }

    if(key == "Escape"){ marabu.stop(); return; }
    if(key == " "){ marabu.play(); e.preventDefault(); return; }

    // Arrows

    if(e.shiftKey){ // Instrument
      if(key == "ArrowDown") { marabu.move_control(1); e.preventDefault(); return; }
      if(key == "ArrowUp")   { marabu.move_control(-1); e.preventDefault();return; }
      if(key == "ArrowRight"){ marabu.move_control_value(1,true); e.preventDefault(); return; }
      if(key == "ArrowLeft") { marabu.move_control_value(-1,true); e.preventDefault();return; }
    }
    else if(e.altKey || e.metaKey){
      if(key == "ArrowDown") { marabu.move_track(1); e.preventDefault(); return; }
      if(key == "ArrowUp")   { marabu.move_track(-1); e.preventDefault();return; }
      if(key == "ArrowRight"){ marabu.move_pattern(1); e.preventDefault(); return; }
      if(key == "ArrowLeft") { marabu.move_pattern(-1); e.preventDefault();return; }
    }
    else{
      if(key == "ArrowRight"){ marabu.move_inst(1); e.preventDefault(); return; }
      if(key == "ArrowLeft") { marabu.move_inst(-1); e.preventDefault(); return; }
      if(key == "ArrowDown") { marabu.move_row(1); e.preventDefault(); return; }
      if(key == "ArrowUp")   { marabu.move_row(-1); e.preventDefault(); return; }
    }
    
    // Sequencer

    if(key == "+")         { marabu.move_pattern(1); e.preventDefault();return; }
    if(key == "-")         { marabu.move_pattern(-1); e.preventDefault();return; }
    if(key == "_")         { marabu.move_pattern(-1); e.preventDefault();return; }
    if(key == "Tab")       { marabu.editor.toggle_composer(); e.preventDefault(); return; }

    // Editor

    if(key == "/")         { marabu.add_control_value(); e.preventDefault(); return; }
    if(key == "Backspace" || key == "Delete") { marabu.set_note(0); marabu.remove_control_value(0); e.preventDefault(); return; }

    // Instrument

    if(key == ")") { marabu.move_note_value(12); return; }
    if(key == "(") { marabu.move_note_value(-12); return; }
    if(key == "0") { marabu.move_note_value(1); return; }
    if(key == "9") { marabu.move_note_value(-1); return; }
    if(key == "]") { marabu.move_control_value(10); e.preventDefault(); return; }
    if(key == "[") { marabu.move_control_value(-10); e.preventDefault(); return; }
    if(key == "}") { marabu.move_control_value(1); e.preventDefault(); return; }
    if(key == "{") { marabu.move_control_value(-1); e.preventDefault(); return; }
    if(key == "x") { marabu.move_octave(1); return; }
    if(key == "z") { marabu.move_octave(-1); return; }

    // Global

    if(e.ctrlKey || e.metaKey){
      if(key == "n"){ marabu.reset(); e.preventDefault(); return; }
      if(key == "o"){ marabu.open(); e.preventDefault(); return; }
      if(key == "s"){ marabu.save(); e.preventDefault(); return; }
      if(key == "S"){ marabu.export(); e.preventDefault(); return; }
      if(key == "r"){ marabu.render(); e.preventDefault(); return; }
      if(key == "i"){ marabu.export_instrument(); e.preventDefault(); return; }
      
      if(key == "k"){ marabu.cheatcode.start(); e.preventDefault(); return; }
      if(key == "l"){ marabu.loop.start(); e.preventDefault(); return; }
      return;
    }
    if(key == ">") { marabu.move_bpm(5); e.preventDefault(); return; }
    if(key == "<") { marabu.move_bpm(-5); e.preventDefault(); return; }

    // Keyboard

    var note = null;
    var is_cap = key == key.toLowerCase();
    switch(key.toLowerCase())
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
  e.preventDefault();
  e.stopPropagation();
  e.dataTransfer.dropEffect = 'copy';
});

window.addEventListener('drop', function(e)
{
  e.preventDefault();
  e.stopPropagation();

  var files = e.dataTransfer.files;

  for(file_id in files){
    var file = files[file_id];
    if(!file || !file.name || file.name.indexOf(".mar") == -1 && file.name.indexOf(".ins") == -1 && file.name.indexOf(".thm") == -1){ console.log("skipped",file); continue; }

    var path = file.path;
    var reader = new FileReader();
    reader.onload = function(e){
      var o = e.target.result;
      marabu.load(o,path);
    };
    reader.readAsText(file);
    return;
  }
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

var hex_to_int = function(hex)
{
  var hex = hex.toLowerCase();
  if(parseInt(hex) > 0){ return parseInt(hex); }
  if(hex == "a"){ return 10; }
  if(hex == "b"){ return 11; }
  if(hex == "c"){ return 12; }
  if(hex == "d"){ return 13; }
  if(hex == "e"){ return 14; }
  if(hex == "f"){ return 15; }
  return 0;
}

var prepend_to_length = function(str,length = 4,fill = "0")
{
  var str = str+"";

  var offset = length - str.length;

  if(offset == 1){ return fill+str; }
  else if(offset == 2){ return fill+fill+str; }
  else if(offset == 3){ return fill+fill+fill+str; }
  else if(offset == 4){ return fill+fill+fill+fill+str; }

  return str
}

var to_hex_val = function(num)
{
  if(num < 10){ return ""+num; }
  var l = ["a","b","c","d","e","f"];
  return l[num % l.length];
}

var to_hex = function(num, count = 1)
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