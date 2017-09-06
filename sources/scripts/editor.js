function Editor(t,b)
{
  var target = this;

  this.edit_mode = false;
  this.selection = {x:0,y:0,e:-1};
  this.pattern = {id:0,beat:4,length:(t*b),signature:[t,b],effect:-1};

  this.signature_el = document.getElementById("signature");

  this.start = function()
  {
    console.log("Started Editor");

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
  }

  this.pattern_mouse_down = function(e)
  {
    var i = parseInt(e.target.id.slice(1,3));
    var r = parseInt(e.target.id.slice(4));

    marabu.selection.instrument = i;
    marabu.selection.row = r;
    marabu.update();
  }

  this.effect_mouse_down = function(e)
  {
    var row = parseInt(e.target.id.slice(3,5));
    console.log("?????")
  }

  this.update = function()
  {
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
        cell.textContent = left_string+right_string;

        if(effect_cmd){ cell.className = "bi fi "; }
        else if(i == marabu.selection.instrument && r == marabu.selection.row){ cell.className = "fh"; }
        else if(left_note || right_note){ cell.className = "fm"; }
        else if(pattern > 0 && r % 4 == 0){ cell.className = "fm";}
        else{ cell.className = ""; }

        //Effect
        if(i == marabu.selection.instrument){
          effect_el.textContent = effect_cmd > 0 ? (to_hex(effect_cmd,2) + "" + to_hex(effect_val,2)) : "0000";
          effect_el.className = r % 4 == 0 ? "fm" : "fl";
        }
      }
    }
  }
}
