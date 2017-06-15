function Pattern_Controller()
{
  Controller.call(this);
  
  this.name = "Pattern";
  this.el = document.getElementById("pattern_controller");  
  this.status_el = document.getElementById("pattern_controller_status");
  this.is_selected = false;
  this.is_mod_selected = false;
  this.pattern_id = -1;
  this.rpp_el = document.getElementById("rpp");
  this.rpp_el.addEventListener('input', rpp_update, false);

  this.mod_selection = {x1:0,y1:0,x2:0,y2:0};
  this.selection = {x1:0,y1:0,x2:0,y2:0};

  function rpp_update()
  {
    if(GUI.pattern_controller.rpp_el.value == ""){ return; }
    var new_rpp = parseInt(GUI.pattern_controller.rpp_el.value);
    if(new_rpp < 4){ new_rpp = 4; }
    if(new_rpp > 16){ new_rpp = 16; }
    GUI.update_rpp(new_rpp);
  }

  this.select = function(from_x = null,from_y = null,to_x = null,to_y = null)
  {
    if(this.pattern_id == -1){ GUI.update_status("<span class='error'>No pattern selected!</span>"); return; }

    GUI.deselect_all();

    if(from_x != null){ this.selection.x1 = from_x;}
    if(from_y != null){ this.selection.y1 = from_y;}
    if(to_x != null){ this.selection.x2 = to_x;}
    if(to_y != null){ this.selection.y2 = to_y;}

    GUI.select_pattern_cell(this.selection.x1,this.selection.y1);
    this.el.setAttribute("class","pattern edit");
    this.is_selected = true;
    this.update();
  }

  this.deselect = function()
  {
    this.el.setAttribute("class","pattern");
    this.status_el.innerHTML = "";
    this.is_selected = false;
    this.rpp_el.blur();
  }

  this.select_pattern = function(pattern_id)
  {
    this.pattern_id = pattern_id;

    if(this.pattern_id == -1){
      this.el.setAttribute("class","pattern inactive");
    }
    else{
      this.status_el.innerHTML = this.pattern_id;
    }
  }

  this.edit_pattern = function(pattern_id,col = 0,row = 0)
  {
    if(pattern_id < 0){ return; }

    GUI.deselect_all();

    this.pattern_id = pattern_id;
    this.el.setAttribute("class","pattern edit");
    this.status_el.innerHTML = this.pattern_id+" "+col+":"+row;
    this.is_selected = true;
    GUI.update_status("Editing Pattern "+this.pattern_id);
  }

  this.update = function()
  {
    this.status_el.innerHTML = this.selection.x1+":"+this.selection.y1+" ";

    if(this.selection.x2 == null || this.selection.y2 == null){ return; }
    if(this.selection.x2 == this.selection.x1 && this.selection.y2 == this.selection.y1){ return; }
    
    this.status_el.innerHTML += this.selection.x2+":"+this.selection.y2;
  }

  // MOD

  this.select_mod = function(y1 = null,y2 = null)
  {
    GUI.deselect_all(); 
    this.is_mod_selected = true;
    this.mod_selection.y1 = y1;
    GUI.select_mod_row(y1); 
  }

  this.deselect_mod = function()
  {
    this.is_mod_selected = false;
    GUI.select_mod_row(null); 
  }

  /* ===================================
  @  Keyboard
  ====================================*/

  // Controls
  this.key_letter_c = function(){ GUI.pattern_copy(GUI.pattern_controller.selection.x1,GUI.pattern_controller.selection.y1,GUI.pattern_controller.selection.x2,GUI.pattern_controller.selection.y2); }
  this.key_letter_v = function(){ GUI.pattern_paste(GUI.pattern_controller.selection.x1,GUI.pattern_controller.selection.y1,GUI.pattern_controller.selection.x2,GUI.pattern_controller.selection.y2); }
  // Brackets
  this.key_square_bracket_right = function(){ GUI.pattern_octave_up(GUI.pattern_controller.selection.x1,GUI.pattern_controller.selection.y1,GUI.pattern_controller.selection.x2,GUI.pattern_controller.selection.y2); }
  this.key_square_bracket_left  = function(){ GUI.pattern_octave_down(GUI.pattern_controller.selection.x1,GUI.pattern_controller.selection.y1,GUI.pattern_controller.selection.x2,GUI.pattern_controller.selection.y2); }
  this.key_curly_bracket_right  = function(){ GUI.pattern_note_up(GUI.pattern_controller.selection.x1,GUI.pattern_controller.selection.y1,GUI.pattern_controller.selection.x2,GUI.pattern_controller.selection.y2); }
  this.key_curly_bracket_left   = function(){ GUI.pattern_note_down(GUI.pattern_controller.selection.x1,GUI.pattern_controller.selection.y1,GUI.pattern_controller.selection.x2,GUI.pattern_controller.selection.y2); }
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

  // Arrows
  this.key_arrow_up    = function()
  {
    if(this.selection.y1 < 1){ return; }
    GUI.select_pattern_cell(this.selection.x1,this.selection.y1-1);
    this.selection.y1 -= 1;
    this.select(null,this.selection.x1,this.selection.y1);
  }

  this.key_arrow_down  = function()
  {
    GUI.select_pattern_cell(this.selection.x1,this.selection.y1+1);
    this.selection.y1 += 1;
    this.select(null,this.selection.x1,this.selection.y1);
  }

  this.key_arrow_left  = function()
  { 
    if(this.selection.x1 < 1){ return; }
    GUI.select_pattern_cell(this.selection.x1-1,this.selection.y1);
    this.selection.x1 -= 1;
    this.select(null,this.selection.x1,this.selection.y1);
  }

  this.key_arrow_right = function()
  {
    if(this.selection.x1 > 2){ return; }
    GUI.select_pattern_cell(this.selection.x1+1,this.selection.y1);
    this.selection.x1 += 1;
    this.select(null,this.selection.x1,this.selection.y1);
  }

  this.key_escape = function()
  {
    GUI.stop_audio();
    GUI.pattern_controller.deselect_mod();
    GUI.deselect_all();
  }

  this.key_delete = function()
  {
    GUI.erase_pattern_positions(this.selection.x1,this.selection.y1,this.selection.x2,this.selection.y2);
    GUI.erase_mod_positions(this.mod_selection.y1,this.mod_selection.y2);
    this.deselect();
  }
}