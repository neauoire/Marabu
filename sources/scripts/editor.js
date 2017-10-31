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

  this.update = function()
  {
    // Editor
    for(var i = 0; i < marabu.channels; i++){
      var pattern = marabu.song.pattern_at(i,marabu.selection.track);
      // Each Row
      for(var r = 0; r < 32; r++){
        var row_el = document.getElementById("ppr"+r);
        var cell = document.getElementById("i"+(i < 10 ? '0'+i : i)+"r"+r);
        var effect_el = document.getElementById("fxr"+r);
        var left_note = marabu.song.note_at(i,marabu.selection.track,r);
        var right_note = marabu.song.note_at(i,marabu.selection.track,r+32);
        var effect_cmd = marabu.song.effect_at(i,marabu.selection.track,r);
        var effect_val = marabu.song.effect_at(i,marabu.selection.track,r+32);

        var left_string = pattern > 0 && r % 4 == 0 ? ">-" : "--";
        var right_string = effect_cmd ? to_hex(effect_cmd,2) : "--";

        if(left_note > 0){
          var n = parse_note(left_note); 
          left_string = (n.sharp ? n.note.toLowerCase() : n.note)+""+n.octave;
        }
        if(right_note > 0){
          var n = parse_note(right_note);
          right_string = (n.sharp ? n.note.toLowerCase() : n.note)+""+n.octave;
        }

        row_el.className = r == marabu.selection.row ? "bl" : "";
        cell.textContent = r == 1 && left_note == 0 && right_note == 0 && marabu.song.instrument(i).name ? marabu.song.instrument(i).name : left_string+right_string;

        if(effect_cmd){ cell.className = "b_inv f_inv "; }
        else if(i == marabu.selection.instrument && r == marabu.selection.row){ cell.className = "fh"; }
        else if(left_note || right_note){ cell.className = "fm"; }
        else if(pattern > 0 && r % 4 == 0){ cell.className = "fm";}
        else{ cell.className = "fl"; }

        // Cheatcode Preview
        if(marabu.cheatcode.is_active && i == marabu.selection.instrument && marabu.cheatcode.selection[r]){ 
          cell.className = "b_inv f_inv";  
        }

        //Effect
        if(i == marabu.selection.instrument){
          effect_el.textContent = effect_cmd > 0 ? (to_hex(effect_cmd,2) + "" + to_hex(effect_val,2)) : "0000";
          effect_el.className = effect_cmd > 0 ? "fh" : (r % 4 == 0 ? "fm" : "fl");
        }

        //Composer
        if(i == marabu.selection.instrument){
          // Clear
          for(var n = 0; n < 15; n++){
            var cmp_el = document.getElementById("cpm_"+r+"_"+n);
            cmp_el.textContent = r % 4 == 0 ? ">-" : "--";
            cmp_el.className = n == 1 || n == 13 ? "fm" : "fl";
            cmp_el.className = r == marabu.selection.row ?  cmp_el.className+" bl" : cmp_el.className;
          }

          var note_offset = (marabu.selection.octave * 12) - 4;
          
          if(left_note > 0){
            var left_note_y = 17 - (left_note - note_offset - 87);
            if(left_note_y < 0 || left_note_y > 17){ continue; }
            var left_note_el = document.getElementById("cpm_"+r+"_"+left_note_y);
            left_note_el.textContent = left_string;
            if(i == marabu.selection.instrument && r == marabu.selection.row){ left_note_el.className = "fh"; }
            else if(left_note || right_note){ left_note_el.className = "fm"; }
            else if(pattern > 0 && r % 4 == 0){ left_note_el.className = "fm";}
          }

          if(right_note > 0){
            var right_note_y = 17 - (right_note - note_offset - 87);
            if(right_note_y < 0 || right_note_y > 17){ continue; }
            var right_note_el = document.getElementById("cpm_"+r+"_"+right_note_y);
            right_note_el.textContent = right_string;
            if(i == marabu.selection.instrument && r == marabu.selection.row){ right_note_el.className = "fh"; }
            else if(left_note || right_note){ right_note_el.className = "fm"; }
            else if(pattern > 0 && r % 4 == 0){ right_note_el.className = "fm";}
          }          
        }
      }
    }
  }
}
