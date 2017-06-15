function Instrument_Controller()
{
  Controller.call(this);

  this.name = "Instrument";
  this.el = document.getElementById("instrument_controller");  
  this.status_el = document.getElementById("instrument_controller_status");
  this.is_selected = false;
  this.instrument_id = 1;
  this.instrument_name_el = document.getElementById("instrument_name");
  this.instrument_name_el.addEventListener('input', instrument_name_update, false);

  function instrument_name_update()
  {
    if(GUI.instrument_controller.instrument_name_el.value == ""){ return; }
    var new_name = GUI.instrument_controller.instrument_name_el.value;
    GUI.update_instrument_name(new_name);
  }

  this.select_instrument = function(id)
  {
    if(id == this.instrument_id){ return; }

    this.instrument_id = id;
    this.status_el.innerHTML = this.instrument_id;
    this.instrument_name_el.value = GUI.instrument().name ? GUI.instrument().name : "";
    GUI.update_instr();
    GUI.update_status("Selected instrument "+this.instrument_id)
  }

  this.export_instrument = function()
  {
    var instr_str = GUI.instrument().i.slice(0,28).toString();
    var str = "{\"name\":\""+(GUI.instrument().name ? GUI.instrument().name : "")+"\",\"i\":["+instr_str+"]}";
    window.open("data:text/javascript;base64," + btoa(str));
    return false;
  }

  this.export_kit = function()
  {
    var instruments = GUI.instruments();
    var kit_hash = {};
    kit_hash[instruments[0].name ? instruments[0].name : "Instrument 0"] = instruments[0].i.slice(0,28);
    kit_hash[instruments[1].name ? instruments[1].name : "Instrument 1"] = instruments[1].i.slice(0,28);
    kit_hash[instruments[2].name ? instruments[2].name : "Instrument 2"] = instruments[2].i.slice(0,28);
    kit_hash[instruments[3].name ? instruments[3].name : "Instrument 3"] = instruments[3].i.slice(0,28);
    kit_hash[instruments[4].name ? instruments[4].name : "Instrument 4"] = instruments[4].i.slice(0,28);
    kit_hash[instruments[5].name ? instruments[5].name : "Instrument 5"] = instruments[5].i.slice(0,28);
    kit_hash[instruments[6].name ? instruments[6].name : "Instrument 6"] = instruments[6].i.slice(0,28);
    kit_hash[instruments[7].name ? instruments[7].name : "Instrument 7"] = instruments[7].i.slice(0,28);
    var str = JSON.stringify(kit_hash);
    window.open("data:text/javascript;base64," + btoa(str));
    return false;
  }

  /* ===================================
  @  Keyboard
  ====================================*/

  // Keyboard Notes
  this.key_letter_a = function(){ GUI.keyboard_play(0);  }
  this.key_letter_s = function(){ GUI.keyboard_play(2);  }
  this.key_letter_d = function(){ GUI.keyboard_play(4);  }
  this.key_letter_f = function(){ GUI.keyboard_play(5);  }
  this.key_letter_g = function(){ GUI.keyboard_play(7);  }
  this.key_letter_h = function(){ GUI.keyboard_play(9);  }
  this.key_letter_j = function(){ GUI.keyboard_play(11); }
  // Keyboard Notes sharp
  this.key_letter_w = function(){ GUI.keyboard_play(1);  }
  this.key_letter_e = function(){ GUI.keyboard_play(3);  }
  this.key_letter_t = function(){ GUI.keyboard_play(6);  }
  this.key_letter_y = function(){ GUI.keyboard_play(8);  }
  this.key_letter_u = function(){ GUI.keyboard_play(10); }
  // Controls up/down
  this.key_letter_x = function(){ GUI.keyboard_octave_up(); }
  this.key_letter_z = function(){ GUI.keyboard_octave_down(); }

  this.key_escape = function()
  {
    GUI.stop_audio();
    GUI.pattern_controller.deselect_mod();
    GUI.deselect_all();
  }
}