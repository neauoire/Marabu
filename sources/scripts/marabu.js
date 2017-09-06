function Marabu()
{
  this.el = document.createElement("app");
  this.wrapper_el = document.createElement("yu"); 
  this.wrapper_el.className = "wrapper";

  document.body.appendChild(this.el);
  this.el.appendChild(this.wrapper_el);

  this.song = null;
  this.sequencer = null;
  this.editor = null;
  this.instrument = null;

  this.selection = {instrument:0,track:0,row:0,octave:5,control:0,bpm:120};
  this.location = null;
  this.formats = ["mar"];
  this.channels = 16;

  this.song = new Song();
  this.sequencer = new Sequencer(120);
  this.editor = new Editor(8,4);
  this.instrument = new Instrument();

  this.start = function()
  {
    this.el.style.width = "870px";
    this.el.style.height = "480px";
    this.el.className = "noir";

    this.wrapper_el.innerHTML = this.draw();

    this.wrapper_el.innerHTML += "<div id='sequencer' style='display:block; vertical-align:top; float:left'><table class='tracks' id='sequencer-table'></table></div>";
    this.wrapper_el.innerHTML += "<div id='pattern' style='display:block; vertical-align:top; border-left:1px solid #333; padding-left:15px; margin-left:15px; float:left'><table class='tracks' id='pattern-table'></table></div>";
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

  this.draw = function()
  {
    var html = "";

    html += "<style>";
    html += ".tracks tr td { padding: 0 2.5px; color:#555}";
    html += "#sequencer tr td { padding:0px;}";
    html += "#sequencer tr td:first-child { padding-left:2.5px;}";
    html += "#sequencer tr td:last-child { padding-right:2.5px;}";
    html += ".tracks tr:hover { color:#999}";
    html += ".tracks tr td { position:relative}";
    html += ".tracks td:hover { cursor:pointer}";
    html += ".tracks tr td:hover { cursor:pointer; color:#fff}";
    html += ".tracks td.selected { color:#fff}";
    html += ".tracks tr th { color:#555; font-family: 'input_mono_medium'; padding: 0 2.5px;}";
    html += ".tracks tr th:hover { cursor:pointer; color:#999}";
    html += "</style>";

    return "<yu style='vertical-align:top' class='everything'>"+html+"</yu>";
  }

  this.location_name = function()
  {
    return this.location ? this.location.split("/")[this.location.split("/").length-1].split(".")[0] : "SONG";
  }

  this.status = function()
  {
    var html = "";
    
    var sequences_count = this.song.song().endPattern-1;
    var spm = this.selection.bpm/32; // Sequences per minute
    var seconds = (sequences_count/spm) * 60;
    var time = (seconds/4) >  this.selection.bpm ? parseInt(seconds/4/60)+"min" : (seconds/4)+"sec";
    var file_name = this.location_name();
    var instrument_name = this.song.instrument(this.selection.instrument).name ? this.song.instrument(this.selection.instrument).name : "IN"+this.selection.instrument;

    html += "/ <b>"+file_name.toLowerCase()+"</b>."+instrument_name.toLowerCase()+" > ";

    html += this.selection.octave+"oct ";
    html += sequences_count+"tracks ";
    html += time+" ";
    html += this.selection.bpm+"bpm ";

    html += "<span class='right'>I"+this.selection.instrument+"T"+this.selection.track+"R"+this.selection.row+"O"+this.selection.octave+"C"+this.selection.control+" "+this.window.size.width+"x"+this.window.size.height+"</span>";
    
    return html;
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

  this.play_note = function(note,right_hand)
  {
    var note_value = note + (this.selection.octave * 12);
    this.song.play_note(note_value);
    this.song.inject_note_at(this.selection.instrument,this.selection.track,this.selection.row+(right_hand ? 0 : 32),note_value);
    this.update();
  }




  // Methods


  this.new_song = function()
  {
    var MAX_SONG_ROWS = 32,
        MAX_PATTERNS = 16;

      var song = {}, i, j, k, instr, col;

      // Row length
      song.rowLen = calcSamplesPerRow(120);

      // Last pattern to play
      song.endPattern = 2;

      // Rows per pattern
      song.patternLen = 32;

      // Select the default instrument from the presets
      var defaultInstr = { name: "FORM sin", i: [3,255,128,0,2,23,152,0,0,0,0,72,129,0,0,3,121,57,0,2,180,50,0,31,47,3,55,8] };

      // All 8 instruments
      song.songData = [];
      for (i = 0; i < marabu.channels; i++) {
        instr = {};
        instr.i = [];

        // Copy the default instrument
        for (j = 0; j <= defaultInstr.i.length; ++j) {
          instr.i[j] = defaultInstr.i[j];
        }

        // Sequence
        instr.p = [];
        for (j = 0; j < MAX_SONG_ROWS; j++)
          instr.p[j] = 0;

        // Patterns
        instr.c = [];
        for (j = 0; j < MAX_PATTERNS; j++)
        {
          col = {};
          col.n = [];
          for (k = 0; k < song.patternLen * 4; k++)
            col.n[k] = 0;
          col.f = [];
          for (k = 0; k < song.patternLen * 2; k++)
            col.f[k] = 0;
          instr.c[j] = col;
        }
        song.songData[i] = instr;
      }

      // Default instruments
      song.songData[0].name = "SYN1";
      song.songData[1].name = "SYN2";
      song.songData[2].name = "PAD1";
      song.songData[3].name = "PAD2";

      song.songData[4].name = "Kick";
      song.songData[4].i = [2,0,92,0,0,255,92,23,1,0,14,0,74,0,0,0,89,0,1,1,16,0,21,255,49,6,0,0];
      song.songData[5].name = "Snare";
      song.songData[5].i = [0,221,92,1,0,210,92,0,1,192,4,0,46,0,0,1,97,141,1,3,93,0,4,57,20,0,0,6];
      song.songData[6].name = "Hihat"
      song.songData[6].i = [0,0,140,0,0,0,140,0,0,60,4,10,34,0,0,0,187,5,0,1,239,135,0,170,87,5,0,4];
      song.songData[7].name = "Toms"
      song.songData[7].i = [0,192,104,1,0,80,99,0,0,0,4,0,66,0,0,3,0,0,0,1,0,1,2,32,37,4,0,0];
      
      // Make a first empty pattern
      song.songData[0].p[0] = 1;


      return song;
  };


  this.play = function(val, is_passive = false)
  {
    console.log("Play!")
    this.song.play_song();
  }

  this.stop = function(val, is_passive = false)
  {
    console.log("Stop!")
    this.song.stop_song();
  }

  this.load = function(val, is_passive = false)
  {
    if(is_passive){
      lobby.commander.show_browser();
      lobby.commander.browse_candidates(val,this.formats);
      return;
    }

    this.window.show();
    lobby.commander.hide_browser();
    this.load_file(lobby.commander.select_candidate(val,this.formats));
  }

  this.load_file = function(file_path)
  {
    this.location = file_path;

    var app = this;
    $.ajax({url: '/ide.load',
      type: 'POST', 
      data: { file_path: this.location },
      success: function(data) {
        var new_song = JSON.parse(data);
        app.song.replace_song(new_song);
        lobby.apps.marabu.sequencer.select();
      }
    })
  }

  this.save = function(val, is_passive = false)
  {  
    if(is_passive){
      if(this.location && val.trim() == ""){
        lobby.commander.update_status("Save <b class='ff'>"+this.location+"</b>?");
      }
      else{
        var target_file = lobby.commander.select_candidate(val,this.formats);
        if(target_file){
          lobby.commander.update_status("Overwrite <b class='ff'>"+target_file+"</b>?");
        }
        else{
          lobby.commander.update_status("No file selected!");  
        }
      }
      return;
    } 

    // Traget
    if(!this.location){ 
      var target_file = lobby.commander.select_candidate(val,this.formats);
      if(!target_file){ return; }
      this.location = target_file;
    }

    this.song.update_ranges();
    var str = JSON.stringify(this.song.song());

    $.ajax({url: '/ide.save',
      type: 'POST', 
      data: { file_path: this.location, file_content: str },
      success: function(data) {
        console.log(data);
      }
    })
    
    lobby.commander.notify("Saved.");
    lobby.commander.update_status();
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

  this.set_rpp = function(val, is_passive = false)
  {
    console.log("set_rpp",val)
  }

  this.set_signature = function(val, is_passive = false)
  {
    console.log("set_signature",val)
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

    // Skip if in input
    if(document.activeElement.type == "text"){ return; }
    // Movement
    if(key == "ArrowRight"){ marabu.move_inst(1); return; }
    if(key == "ArrowLeft"){ marabu.move_inst(-1); return; }
    
    if(key == "+")        { marabu.move_pattern(1); return; }
    if(key == "-")        { marabu.move_pattern(-1); return; }
    if(key == "_")        { marabu.move_pattern(-1); return; }
    if(key == "ArrowDown"){ marabu.move_row(1); return; }
    if(key == "ArrowUp")  { marabu.move_row(-1); return; }
    if(key == "x")        { marabu.move_octave(1); return; }
    if(key == "z")        { marabu.move_octave(-1); return; }
    if(key == "k")        { marabu.move_track(1); return; }
    if(key == "o")        { marabu.move_track(-1); return; }
    if(key == "l")        { marabu.move_control(1); return; }
    if(key == "p")        { marabu.move_control(-1); return; }
    if(key == "2")        { marabu.move_control(1); return; }
    if(key == "1")        { marabu.move_control(-1); return; }
    if(key == "]")        { marabu.move_control_value(10); return; }
    if(key == "[")        { marabu.move_control_value(-10); return; }
    if(key == "}")        { marabu.move_control_value(1); return; }
    if(key == "{")        { marabu.move_control_value(-1); return; }

    if(key == "/")        { marabu.save_control_value(); return; }
    if(key == "Backspace"){ marabu.set_note(0); return; }

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

  this.wheel = function(e)
  {
    marabu.move_control_value(e.wheelDeltaY * 0.25)
    e.preventDefault();
  }

  this.el.addEventListener('wheel', this.wheel, false);
  window.addEventListener("keydown", this.when_key, false);
}

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