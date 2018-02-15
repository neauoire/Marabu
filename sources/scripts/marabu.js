function Marabu()
{
  this.history = new History();
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
  this.arp = new Arp();

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
    this.controller.add("default","File","New",() => { marabu.new(); },"CmdOrCtrl+N");
    this.controller.add("default","File","Open",() => { marabu.open(); },"CmdOrCtrl+O");
    this.controller.add("default","File","Save",() => { marabu.save(); },"CmdOrCtrl+S");
    this.controller.add("default","File","Save As",() => { marabu.export(); },"CmdOrCtrl+Shift+S");
    this.controller.add("default","File","Render",() => { marabu.render(); },"CmdOrCtrl+R");
    this.controller.add("default","File","Export Ins",() => { marabu.export_instrument(); },"CmdOrCtrl+I");
    this.controller.add("default","Edit","Inc BPM",() => { marabu.move_bpm(5) },">");
    this.controller.add("default","Edit","Dec BPM",() => { marabu.move_bpm(-5) },"<");
    this.controller.add("default","Edit","Delete",() => { marabu.set_note(0); marabu.remove_control_value(0); },"Backspace");  
    this.controller.add("default","Edit","Undo",() => { marabu.undo(); },"CmdOrCtrl+Z");
    this.controller.add("default","Edit","Redo",() => { marabu.redo(); },"CmdOrCtrl+Shift+Z");
    this.controller.add("default","Select","1st Row",() => { marabu.select_row(0); },"1");
    this.controller.add("default","Select","4th Row",() => { marabu.select_row(4); },"2");
    this.controller.add("default","Select","8th Row",() => { marabu.select_row(8); },"3");
    this.controller.add("default","Select","12th Row",() => { marabu.select_row(12); },"4");
    this.controller.add("default","Select","16th Row",() => { marabu.select_row(16); },"5");
    this.controller.add("default","Select","20th Row",() => { marabu.select_row(20); },"6");
    this.controller.add("default","Select","24th Row",() => { marabu.select_row(24); },"7");
    this.controller.add("default","Select","28th Row",() => { marabu.select_row(28); },"8");
    this.controller.add("default","Track","Next Inst",() => { marabu.move_inst(1); },"Right");
    this.controller.add("default","Track","Prev Inst",() => { marabu.move_inst(-1) },"Left");
    this.controller.add("default","Track","Next Row",() => { marabu.move_row(1); },"Down");
    this.controller.add("default","Track","Prev Row",() => { marabu.move_row(-1) },"Up");
    this.controller.add("default","Track","Next Track",() => { marabu.move_track(1); },"CmdOrCtrl+Down");
    this.controller.add("default","Track","Prev Track",() => { marabu.move_track(-1); },"CmdOrCtrl+Up");
    this.controller.add("default","Track","Next Pattern",() => { marabu.move_pattern(1); },"CmdOrCtrl+Right");
    this.controller.add("default","Track","Prev Pattern",() => { marabu.move_pattern(-1); },"CmdOrCtrl+Left");  
    this.controller.add("default","Play","Track",() => { marabu.play(); },"Space");  
    this.controller.add("default","Play","Range",() => { marabu.loop.start(); },"Enter");  
    this.controller.add("default","Play","Stop",() => { marabu.stop(); },"Esc");
    this.controller.add("default","Mode","Cheatcode",() => { marabu.cheatcode.start(); },"CmdOrCtrl+K");
    this.controller.add("default","Mode","Loop",() => { marabu.loop.start(); },"CmdOrCtrl+L");
    this.controller.add("default","Mode","Arp",() => { marabu.arp.start(); },"CmdOrCtrl+M");
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
    this.controller.add("default","Instrument","Min",() => { marabu.move_control_min(); },"9");
    this.controller.add("default","Instrument","Max",() => { marabu.move_control_max(); },"0");
    this.controller.add("default","Instrument","Keyframe",() => { marabu.add_control_value(); },"/");  

    this.controller.add("cheatcode","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");
    this.controller.add("cheatcode","Mode","Stop",() => { marabu.cheatcode.stop(); },"Esc");
    this.controller.add("cheatcode","Mode","Copy",() => { marabu.cheatcode.copy(); },"C");
    this.controller.add("cheatcode","Mode","Paste",() => { marabu.cheatcode.paste(); },"V");
    this.controller.add("cheatcode","Mode","Erase",() => { marabu.cheatcode.del(); },"Backspace");
    this.controller.add("cheatcode","Effect","Inc Note +12",() => { marabu.cheatcode.mod(12); },"]");
    this.controller.add("cheatcode","Effect","Dec Note -12",() => { marabu.cheatcode.mod(-12); },"[");
    this.controller.add("cheatcode","Effect","Inc Note +1",() => { marabu.cheatcode.mod(1); },"}");
    this.controller.add("cheatcode","Effect","Dec Note -1",() => { marabu.cheatcode.mod(-1); },"{");
    this.controller.add("cheatcode","Selection","All",() => { marabu.cheatcode.set_rate(1); },"1");
    this.controller.add("cheatcode","Selection","2nd",() => { marabu.cheatcode.set_rate(2); },"2");
    this.controller.add("cheatcode","Selection","3rd",() => { marabu.cheatcode.set_rate(3); },"3");
    this.controller.add("cheatcode","Selection","4th",() => { marabu.cheatcode.set_rate(4); },"4");
    this.controller.add("cheatcode","Selection","5th",() => { marabu.cheatcode.set_rate(5); },"5");
    this.controller.add("cheatcode","Selection","6th",() => { marabu.cheatcode.set_rate(6); },"6");
    this.controller.add("cheatcode","Selection","7th",() => { marabu.cheatcode.set_rate(7); },"7");
    this.controller.add("cheatcode","Selection","8th",() => { marabu.cheatcode.set_rate(8); },"8");
    this.controller.add("cheatcode","Selection","Offset +1",() => { marabu.cheatcode.set_offset(1); },"Right");
    this.controller.add("cheatcode","Selection","Offset -1",() => { marabu.cheatcode.set_offset(-1) },"Left");
    this.controller.add("cheatcode","Selection","Length +1",() => { marabu.cheatcode.set_length(1); },"Down");
    this.controller.add("cheatcode","Selection","Length -1",() => { marabu.cheatcode.set_length(-1) },"Up");
    this.controller.add("cheatcode","Keyboard","C",() => { marabu.cheatcode.ins(0); },"A");
    this.controller.add("cheatcode","Keyboard","C#",() => { marabu.cheatcode.ins(1); },"W");
    this.controller.add("cheatcode","Keyboard","D",() => { marabu.cheatcode.ins(2); },"S");
    this.controller.add("cheatcode","Keyboard","D#",() => { marabu.cheatcode.ins(3); },"E");
    this.controller.add("cheatcode","Keyboard","E",() => { marabu.cheatcode.ins(4); },"D");
    this.controller.add("cheatcode","Keyboard","F",() => { marabu.cheatcode.ins(5); },"F");
    this.controller.add("cheatcode","Keyboard","F#",() => { marabu.cheatcode.ins(6); },"T");
    this.controller.add("cheatcode","Keyboard","G",() => { marabu.cheatcode.ins(7); },"G");
    this.controller.add("cheatcode","Keyboard","G#",() => { marabu.cheatcode.ins(8); },"Y");
    this.controller.add("cheatcode","Keyboard","A",() => { marabu.cheatcode.ins(9); },"H");
    this.controller.add("cheatcode","Keyboard","A#",() => { marabu.cheatcode.ins(10); },"U");
    this.controller.add("cheatcode","Keyboard","B",() => { marabu.cheatcode.ins(11); },"J");

    this.controller.add("loop","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");
    this.controller.add("loop","Edit","Clear",() => { marabu.loop.cut(); },"X");
    this.controller.add("loop","Edit","Copy",() => { marabu.loop.copy(); },"C");
    this.controller.add("loop","Edit","Paste",() => { marabu.loop.paste(); },"V");
    this.controller.add("loop","Edit","Delete",() => { marabu.loop.erase(); },"Backspace");
    this.controller.add("loop","Select","Solo",() => { marabu.loop.solo(); },"/");
    this.controller.add("loop","Select","1 Row",() => { marabu.loop.set_height(0); },"1");
    this.controller.add("loop","Select","2 Rows",() => { marabu.loop.set_height(1); },"2");
    this.controller.add("loop","Select","3 Rows",() => { marabu.loop.set_height(2); },"3");
    this.controller.add("loop","Select","4 Rows",() => { marabu.loop.set_height(3); },"4");
    this.controller.add("loop","Select","5 Rows",() => { marabu.loop.set_height(4); },"5");
    this.controller.add("loop","Select","6 Rows",() => { marabu.loop.set_height(5); },"6");
    this.controller.add("loop","Select","7 Rows",() => { marabu.loop.set_height(6); },"7");
    this.controller.add("loop","Select","8 Rows",() => { marabu.loop.set_height(7); },"8");
    this.controller.add("loop","Select","Inc",() => { marabu.loop.mod(1); },"Down");
    this.controller.add("loop","Select","Dec",() => { marabu.loop.mod(-1); },"Up");
    this.controller.add("loop","Mode","Play",() => { marabu.loop.play(); },"Enter");
    this.controller.add("loop","Mode","Stop",() => { marabu.loop.stop(); },"Esc");
    this.controller.add("loop","Mode","render",() => { marabu.loop.render(); },"CmdOrCtrl+R");
    

    this.controller.add("arp","*","Quit",() => { app.exit(); },"CmdOrCtrl+Q");
    this.controller.add("arp","Mode","Pause/Stop",() => { marabu.arp.stop(); },"Esc");
    this.controller.add("arp","Keyboard","C",() => { marabu.arp.ins(0); },"A");
    this.controller.add("arp","Keyboard","C#",() => { marabu.arp.ins(1); },"W");
    this.controller.add("arp","Keyboard","D",() => { marabu.arp.ins(2); },"S");
    this.controller.add("arp","Keyboard","D#",() => { marabu.arp.ins(3); },"E");
    this.controller.add("arp","Keyboard","E",() => { marabu.arp.ins(4); },"D");
    this.controller.add("arp","Keyboard","F",() => { marabu.arp.ins(5); },"F");
    this.controller.add("arp","Keyboard","F#",() => { marabu.arp.ins(6); },"T");
    this.controller.add("arp","Keyboard","G",() => { marabu.arp.ins(7); },"G");
    this.controller.add("arp","Keyboard","G#",() => { marabu.arp.ins(8); },"Y");
    this.controller.add("arp","Keyboard","A",() => { marabu.arp.ins(9); },"H");
    this.controller.add("arp","Keyboard","A#",() => { marabu.arp.ins(10); },"U");
    this.controller.add("arp","Keyboard","B",() => { marabu.arp.ins(11); },"J");
    this.controller.add("arp","Keyboard","Skip",() => { marabu.arp.ins(-99); },"Space");

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

  this.undo = function()
  {
    this.song.replace_song(this.history.prev());
    this.update();
  }

  this.redo = function()
  {
    this.song.replace_song(this.history.next());
    this.update();
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

  this.select_row = function(row)
  {
    this.selection.row = row;
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
    this.history.push(this.song.song());
    this.update();
  }

  this.move_control_value = function(mod,relative)
  {
    var control = this.instrument.control_target(this.selection.control);
    control.mod(mod,relative);
    this.history.push(this.song.song());
    control.save();
  }

  this.move_control_min = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    control.value = control.min;
    this.history.push(this.song.song());
    control.save();
    control.update();
  }

  this.move_control_max = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    control.value = control.max;
    this.history.push(this.song.song());
    control.save();
    control.update();
  }

  this.add_control_value = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    var control_storage = this.instrument.get_storage(control.family+"_"+control.id);
    var control_value = control.value;

    this.song.inject_effect_at(this.selection.instrument,this.selection.track,this.selection.row,control_storage+1,control_value);
    this.history.push(this.song.song());
    this.update();
  }

  this.remove_control_value = function()
  {
    var control = this.instrument.control_target(this.selection.control);
    var control_storage = this.instrument.get_storage(control.family+"_"+control.id);
    var control_value = control.value;

    this.song.erase_effect_at(this.selection.instrument,this.selection.track,this.selection.row);
    this.history.push(this.song.song());
    this.update();
  }

  this.set_note = function(val)
  {
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row,val-87);
    
    if(val == 0){
      this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row+32,val-87);
    }
    this.history.push(this.song.song());
    this.update();
  }

  this.move_note_value = function(mod)
  {
    var note = marabu.song.note_at(this.selection.instrument,this.selection.track,this.selection.row);

    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row,note+mod-87);
    this.history.push(this.song.song());
    this.update();
  }

  this.play_note = function(note,right_hand = true)
  {
    var note_value = note + (this.selection.octave * 12);
    this.song.play_note(note_value);
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row+(right_hand ? 0 : 32),note_value);
    this.history.push(this.song.song());
    this.update();
  }

  // Methods

  this.is_playing = false;

  this.play = function()
  {
    if(this.selection.row > 0 || this.is_playing){ this.stop(); return; }
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

  this.new = function()
  {
    this.history.clear();
    this.path = null;
    this.song = new Song();
    this.song.init();
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
    this.history.clear();
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
    this.history.clear();
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

    dialog.showSaveDialog({filters:[{name:'Marabu',extensions:['mar']}]},(fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(`${fileName.substr(-4,4) != ".mar" ? fileName+".mar" : fileName}`, str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
        marabu.path = fileName;
        var el = document.getElementById("fxr31");
        if(el){ el.className = "b_inv f_inv"; el.innerHTML = "--OK";  }
      });
    }); 
  }

  this.load_file = function(track)
  {
    marabu.song.replace_song(track);
    this.history.clear();
    marabu.update();
  }

  this.export_instrument = function()
  {
    var instr = this.song.instrument();
    var instr_obj = {};
    instr_obj.name = instr.name;
    instr_obj.i = instr.i;
    var str = JSON.stringify(instr_obj);

    dialog.showSaveDialog({filters:[{name:"Instrument",extensions:['ins']}]},(fileName) => {
      if (fileName === undefined){ return; }
      fs.writeFile(`${fileName.substr(-4,4) != ".ins" ? fileName+".ins" : fileName}`, str, (err) => {
        if(err){ alert("An error ocurred creating the file "+ err.message); return; }
      });
    }); 
  }

  this.load_instrument = function(instr)
  {
    this.song.song().songData[this.selection.instrument].name = instr.name;
    this.song.song().songData[this.selection.instrument].i = instr.i;
    this.history.push(this.song.song());
    this.update();
  }

  this.render = function(val, is_passive = false)
  {
    this.song.export_wav();
  }

  this.reset = function()
  {
    this.history.clear();
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

    // These shortcuts are faster in repetition than the Electron managers.

    if(marabu.cheatcode.is_active == true){ return; }
    if(marabu.loop.is_active == true){ return; }

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
    if(key == "]") { marabu.move_control_value(1); e.preventDefault(); return; }
    if(key == "[") { marabu.move_control_value(-1); e.preventDefault(); return; }
    if(key == "}") { marabu.move_control_value(10); e.preventDefault(); return; }
    if(key == "{") { marabu.move_control_value(-10); e.preventDefault(); return; }
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
  if(val < 0){ val += 87; }
  var keyboard = ['C','D','E','F','G','A','B'];
  var notes = ['C-', 'C#', 'D-', 'D#', 'E-', 'F-', 'F#', 'G-', 'G#', 'A-', 'A#', 'B-'];
  var octave = Math.floor((val)/12);
  var key = notes[(val) % 12];
  var key_sharp = key.substr(1,1) == "#" ? true : false;
  var key_note = key.substr(0,1);
  var offset = keyboard.indexOf(key_note);
  var distance = (keyboard.length*octave) + offset;
  return {id:val,octave:octave,sharp:key_sharp,note:key_note,offset:offset,distance:distance};
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
  return l[(num-10) % l.length];
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