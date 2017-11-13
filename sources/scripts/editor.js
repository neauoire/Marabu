function Editor(t,b)
{
  var target = this;

  this.edit_mode = false;
  this.pattern = {id:0,beat:4,length:(t*b),signature:[t,b],effect:-1};
  this.composer = false;

  this.start = function()
  {
    console.log("Started Editor");

    // Table
    var table = document.getElementById("pattern-table");
    var tr, td;
    for(var r = 0; r < 32; r++) {
      tr = document.createElement("tr");
      tr.id = "ppr"+r;
      tr.style.lineHeight = "15px";
      tr.className = r % this.pattern.signature[1] == 0 ? " fm" : "";
      // Notes
      for (i = 0; i < marabu.channels; i++) {
        td = document.createElement("td");
        td.id = "i"+(i < 10 ? "0"+i : i)+"r"+r;
        td.style.padding = "0 2.5px";
        td.textContent = "----";
        td.addEventListener("mousedown", this.pattern_mouse_down, false);
        tr.appendChild(td);
      }
      // Effects
      var th = document.createElement("th");
      th.id = "fxr" + r;
      th.textContent = "0000";
      th.addEventListener("mousedown", this.effect_mouse_down, false);
      tr.appendChild(th);
      // End
      table.appendChild(tr);
    }

    // Composer

    var notes = ['C', 'c', 'D', 'd', 'E', 'F', 'f', 'G', 'g', 'A', 'a', 'B'];

    var table = document.getElementById("composer-table");
    var tr, td, th;
    for(var r = 0; r < 15; r++) {
      tr = document.createElement("tr");
      // Notes
      for (i = 0; i < 32; i++) {
        td = document.createElement("td");
        td.textContent = i % 4 == 0 ? ">-" : "--"
        td.className = "fl"
        td.id = "cpm_"+i+"_"+r;
        td.addEventListener("mousedown", this.composer_mouse_down, false);
        tr.appendChild(td);
        if(i == 31){
          td.textContent = notes[r % notes.length]+""+(parseInt(r /12) + 4);
        }
      }
      // End
      table.appendChild(tr);
    }
  }

  this.build = function()
  {
    return "<div id='editor'><table class='tracks' id='composer-table'></table><table class='tracks' id='pattern-table'></table></div>";
  }

  this.pattern_mouse_down = function(e)
  {
    var i = parseInt(e.target.id.slice(1,3));
    var r = parseInt(e.target.id.slice(4));

    marabu.selection.instrument = i;
    marabu.selection.row = r;
    marabu.sequencer.follower.stop();
    marabu.update();
  }

  this.effect_mouse_down = function(e)
  {
    var row = parseInt(e.target.id.slice(3,5));
    marabu.selection.row = row;
    marabu.sequencer.follower.stop();
    marabu.update();
  }

  this.composer_mouse_down = function(e)
  {
    var row = parseInt(e.target.id.split("_")[1]);
    var note = parseInt(e.target.id.split("_")[2]);
    var note_val = 24 - note - 11;

    marabu.selection.row = row;
    marabu.sequencer.follower.stop();
    marabu.play_note(note_val);
    marabu.update();
  }

  this.toggle_composer = function()
  {
    marabu.editor.composer = marabu.editor.composer ? false : true;

    this.editor_el = document.getElementById("editor");
    this.editor_el.className = marabu.editor.composer ? "composer" : "";
  }

  // Parser

  this.cell_data = function(i,t,r,pattern = null, note = null)
  {
    // Basics
    var left_val = marabu.song.note_at(i,t,r);
    var right_val = marabu.song.note_at(i,t,r+32);
    var values = {left:left_val,right:right_val};

    var left_note = left_val > 0 ? parse_note(left_val) : null;
    var right_note = right_val > 0 ? parse_note(right_val) : null;
    var notes = {left:left_note,right:right_note};

    var cmd = marabu.song.effect_at(i,t,r);
    var val = marabu.song.effect_at(i,t,r+32);
    var effect = {cmd:cmd,val:val}

    // Strings
    var left_str = pattern && pattern > 0 && r % 4 == 0 ? ">-" : "--";
    var right_str = effect.cmd ? to_hex(effect.cmd,2) : "--";
    left_str = notes.left ? ((notes.left.sharp ? notes.left.note.toLowerCase() : notes.left.note)+""+notes.left.octave) : left_str;
    right_str = notes.right ? ((notes.right.sharp ? notes.right.note.toLowerCase() : notes.right.note)+""+notes.right.octave) : right_str;
    var strings = {left:left_str,right:right_str,any:left_str};

    // Class
    var classes = {fg:"fl",bg:""};
    if(marabu.cheatcode.is_active && i == marabu.selection.instrument && marabu.cheatcode.selection[r] || effect.cmd){ classes.bg = "b_inv f_inv";  }
    else if(r == marabu.selection.row){classes.bg = "bl";}
    if(marabu.cheatcode.is_active && i == marabu.selection.instrument && marabu.cheatcode.selection[r] || effect.cmd){ classes.fg = "f_inv";  }
    else if(i == marabu.selection.instrument && r == marabu.selection.row){ classes.fg = "fh"; }
    else if(values.left || values.right){ classes.fg = "fm"; }
    else if(pattern > 0 && r % 4 == 0){ classes.fg = "fm";}

    // Compositor
    if(note){
      if(values.left == note || values.right == note){
        strings.any = values.left == note ? strings.left : strings.right
        classes.fg = r == marabu.selection.row ? "fh" : "fm"
      }
      else{
        strings.any = r % 4 == 0 ? ">-" : "--";
        classes.fg = r % 4 == 0 ? "fm" : "fl"
      }
    }

    return {notes:notes,effect:effect,values:values,strings:strings,classes:classes};
  }

  // Update
  
  this.update = function()
  {
    // Editor
    for(var i = 0; i < marabu.channels; i++){
      var pattern = marabu.song.pattern_at(i,marabu.selection.track);
      for(var r = 0; r < 32; r++){
        var cell = document.getElementById("i"+(i < 10 ? '0'+i : i)+"r"+r);
        var c = marabu.editor.cell_data(i,marabu.selection.track,r,pattern);
        cell.className = c.classes.fg+" "+c.classes.bg;
        cell.textContent = c.strings.left+c.strings.right;
      }
    }

    // Composer
    for(var r = 0; r < 32; r++){
      for(var n = 0; n < 15; n++){
        var cell = document.getElementById("cpm_"+r+"_"+n);
        var offset = (marabu.selection.octave * 12);
        var note = -(n - offset - 87) + 13;
        var c = marabu.editor.cell_data(marabu.selection.instrument,marabu.selection.track,r,pattern,note);
        cell.textContent = c.strings.any;
        cell.className = c.classes.fg+" "+c.classes.bg;
      }
    }

    // Effects
    for(var r = 0; r < 32; r++){
      var cell = document.getElementById("fxr"+r);
      var effect_cmd = marabu.song.effect_at(marabu.selection.instrument,marabu.selection.track,r);
      var effect_val = marabu.song.effect_at(marabu.selection.instrument,marabu.selection.track,r+32)
      cell.textContent = effect_cmd > 0 ? (to_hex(effect_cmd,2) + "" + to_hex(effect_val,2)) : "0000";
      cell.className = effect_cmd > 0 ? "fh" : (r % 4 == 0 ? "fm" : "fl");
    }
  }
}
