function Marabu()
{
  this.theme = new Theme();
  this.controller = new Controller();
  
  this.el = document.createElement("app");
  this.el.style.opacity = 0;
  this.el.id = "marabu";

  this.wrapper_el = document.createElement("yu"); 
  this.wrapper_el.className = "wrapper";

  this.el.appendChild(this.wrapper_el);

  document.body.appendChild(this.el);

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

    this.controller.add("default","*","About",() => { require('electron').shell.openExternal('https://github.com/hundredrabbits/Marabu'); },"CmdOrCtrl+,");
    this.controller.add("default","*","Fullscreen",() => { app.toggle_fullscreen(); },"CmdOrCtrl+Enter");
    this.controller.add("default","*","Hide",() => { app.toggle_visible(); },"CmdOrCtrl+H");
    this.controller.add("default","*","Inspect",() => { app.inspect(); },"CmdOrCtrl+.");
    this.controller.add("default","*","Documentation",() => { marabu.controller.docs(); },"CmdOrCtrl+Esc");
    this.controller.add("default","*","Reset",() => { marabu.theme.reset(); },"CmdOrCtrl+Backspace");
    this.controller.add("default","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");
    
    this.controller.add("default","File","New",() => { marabu.reset(); },"CmdOrCtrl+N");
    this.controller.add("default","File","Open",() => { marabu.open(); },"CmdOrCtrl+O");
    this.controller.add("default","File","Save",() => { marabu.save(); },"CmdOrCtrl+S");
    this.controller.add("default","File","Save As",() => { marabu.export(); },"CmdOrCtrl+E");
    this.controller.add("default","File","Render",() => { marabu.render(); },"CmdOrCtrl+R");
    this.controller.add("default","File","Export Ins",() => { marabu.export_instrument(); },"CmdOrCtrl+I");

    this.controller.add("default","Track","Next Inst",() => { marabu.move_inst(1); },"Right");
    this.controller.add("default","Track","Prev Inst",() => { marabu.move_inst(-1) },"Left");
    this.controller.add("default","Track","Next Row",() => { marabu.move_row(1); },"Down");
    this.controller.add("default","Track","Prev Row",() => { marabu.move_row(-1) },"Up");
    this.controller.add("default","Track","Inc BPM",() => { marabu.move_bpm(5) },">");
    this.controller.add("default","Track","Dec BPM",() => { marabu.move_bpm(-5) },"<");
    this.controller.add("default","Track","Next Track",() => { marabu.move_track(1); },"CmdOrCtrl+Down");
    this.controller.add("default","Track","Prev Track",() => { marabu.move_track(-1); },"CmdOrCtrl+Up");
    this.controller.add("default","Track","Next Pattern",() => { marabu.move_pattern(1); },"CmdOrCtrl+Right");
    this.controller.add("default","Track","Prev Pattern",() => { marabu.move_pattern(-1); },"CmdOrCtrl+Left");  
    this.controller.add("default","Track","Keyframe",() => { marabu.add_control_value(); },"/");  
    this.controller.add("default","Track","Delete",() => { marabu.set_note(0); marabu.remove_control_value(0); },"Backspace");  
    this.controller.add("default","Track","Inc Note",() => { marabu.move_note_value(12); },"Plus");  
    this.controller.add("default","Track","Dec Note",() => { marabu.move_note_value(12); },"-");  
    
    this.controller.add("default","Play","Track",() => { marabu.play(); },"Space");  
    this.controller.add("default","Play","Range",() => { marabu.loop.start(); },"Enter");  
    this.controller.add("default","Play","Stop",() => { marabu.stop(); },"Esc");

    this.controller.add("default","Mode","Cheatcode",() => { marabu.cheatcode.start(); },"CmdOrCtrl+K");
    this.controller.add("default","Mode","Loop",() => { marabu.loop.start(); },"CmdOrCtrl+L");
    this.controller.add("default","Mode","Composer",() => { marabu.editor.toggle_composer(); },"M");
    
    this.controller.add("default","Keyboard","Inc Octave",() => { marabu.move_octave(1); },"X");
    this.controller.add("default","Keyboard","Dec Octave",() => { marabu.move_octave(-1); },"Z");
    this.controller.add("default","Keyboard","C",() => { marabu.play_note(0,true); },"A");
    this.controller.add("default","Keyboard","C#",() => { marabu.play_note(1,true); },"W");
    this.controller.add("default","Keyboard","D",() => { marabu.play_note(2,true); },"S");
    this.controller.add("default","Keyboard","D#",() => { marabu.play_note(3,true); },"E");
    this.controller.add("default","Keyboard","E",() => { marabu.play_note(4,true); },"D");
    this.controller.add("default","Keyboard","F",() => { marabu.play_note(5,true); },"F");
    this.controller.add("default","Keyboard","F#",() => { marabu.play_note(6,true); },"T");
    this.controller.add("default","Keyboard","G",() => { marabu.play_note(7,true); },"G");
    this.controller.add("default","Keyboard","G#",() => { marabu.play_note(8,true); },"Y");
    this.controller.add("default","Keyboard","A",() => { marabu.play_note(9,true); },"H");
    this.controller.add("default","Keyboard","A#",() => { marabu.play_note(10,true); },"U");
    this.controller.add("default","Keyboard","B",() => { marabu.play_note(11,true); },"J");
    this.controller.add("default","Keyboard","(Right)C",() => { marabu.play_note(0,false); },"Shift+A");
    this.controller.add("default","Keyboard","(Right)C#",() => { marabu.play_note(1,false); },"Shift+W");
    this.controller.add("default","Keyboard","(Right)D",() => { marabu.play_note(2,false); },"Shift+S");
    this.controller.add("default","Keyboard","(Right)D#",() => { marabu.play_note(3,false); },"Shift+E");
    this.controller.add("default","Keyboard","(Right)E",() => { marabu.play_note(4,false); },"Shift+D");
    this.controller.add("default","Keyboard","(Right)F",() => { marabu.play_note(5,false); },"Shift+F");
    this.controller.add("default","Keyboard","(Right)F#",() => { marabu.play_note(6,false); },"Shift+T");
    this.controller.add("default","Keyboard","(Right)G",() => { marabu.play_note(7,false); },"Shift+G");
    this.controller.add("default","Keyboard","(Right)G#",() => { marabu.play_note(8,false); },"Shift+Y");
    this.controller.add("default","Keyboard","(Right)A",() => { marabu.play_note(9,false); },"Shift+H");
    this.controller.add("default","Keyboard","(Right)A#",() => { marabu.play_note(10,false); },"Shift+U");
    this.controller.add("default","Keyboard","(Right)B",() => { marabu.play_note(11,false); },"Shift+J");

    this.controller.add("default","Instrument","Next Control",() => { marabu.move_control(1); },"Shift+Up");
    this.controller.add("default","Instrument","Prev Control",() => { marabu.move_control(-1); },"Shift+Down");
    this.controller.add("default","Instrument","Inc Control +10",() => { marabu.move_control_value(10); },"Shift+Right");
    this.controller.add("default","Instrument","Dec Control -10",() => { marabu.move_control_value(-10); },"Shift+Left");
    this.controller.add("default","Instrument","Inc Control 1",() => { marabu.move_control_value(1); },"}");
    this.controller.add("default","Instrument","Dec Control -1",() => { marabu.move_control_value(-1); },"{");
    this.controller.add("default","Instrument","Inc Control 10(alt)",() => { marabu.move_control_value(10); },"]");
    this.controller.add("default","Instrument","Dec Control -10(alt)",() => { marabu.move_control_value(-10); },"[");

    this.controller.add("cheatcode","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");
    this.controller.add("cheatcode","Mode","Stop",() => { marabu.cheatcode.stop(); },"Esc");
    this.controller.add("cheatcode","Mode","Copy",() => { marabu.cheatcode.copy(); },"CmdOrCtrl+C");
    this.controller.add("cheatcode","Mode","Paste",() => { marabu.cheatcode.paste(); },"CmdOrCtrl+V");
    this.controller.add("loop","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");
    this.controller.add("loop","Mode","Stop",() => { marabu.loop.stop(); },"Esc");
    this.controller.add("loop","Mode","Copy",() => { marabu.loop.copy(); },"CmdOrCtrl+C");
    this.controller.add("loop","Mode","Paste",() => { marabu.loop.paste(); },"CmdOrCtrl+V");
    this.controller.add("loop","Mode","Paste",() => { marabu.loop.erase(); },"Backspace");
    this.controller.add("loop","Mode","render",() => { marabu.loop.render(); },"CmdOrCtrl+R");

    this.controller.commit();

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