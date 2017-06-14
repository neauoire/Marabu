function Sequence_Controller()
{
  Controller.call(this);

  this.name = "Sequencer";
  this.el = document.getElementById("sequence_controller");
  this.status_el = document.getElementById("sequence_controller_status");
  this.is_selected = false;

  this.instrument_id = -1;
  this.selection = {x1:0,y1:0};

  this.select = function(o,col,row)
  {
    // GUI.deselect_all();

    this.selection.x1 = col;
    this.selection.y1 = row;

    // Select pattern
    var pattern_id = -1;
    if(o.innerHTML != ""){ pattern_id = o.innerHTML; }
    GUI.pattern_controller.select_pattern(pattern_id)

    var instrument_id = col;
    GUI.instrument_controller.select_instrument(instrument_id);

    this.el.setAttribute("class","sequencer edit");
    this.status_el.innerHTML = col+":"+row;
    this.is_selected = true;
    GUI.update_status("Editing Sequence");
  }

  this.deselect = function()
  {
    this.el.setAttribute("class","sequencer");
    this.status_el.innerHTML = "";
    this.is_selected = false;
  }

  /* ===================================
  @  Keyboard
  ====================================*/

  this.input = function(keyCode,keyVal)
  {
    // 0 - 9
    if (keyCode >= 48 && keyCode <= 57)
    {
      GUI.update_sequencer_position(keyCode - 47);
      GUI.pattern_controller.edit_pattern(keyCode - 48);
      GUI.update_pattern_mod();
      GUI.update_pattern();
    }
    // HEX Letters
    else if (keyCode >= 64 && keyCode <= 70)
    {
      GUI.update_sequencer_position(keyCode - 54);
      GUI.pattern_controller.edit_pattern(keyCode - 55);
      GUI.update_pattern_mod();
      GUI.update_pattern();
    }
  }

  // Arrows
  this.key_arrow_up    = function()
  {
    if(this.selection.y1 < 1){ return; }
    GUI.select_sequencer_cell(this.selection.x1,this.selection.y1-1);
    this.selection.y1 -= 1;
  }

  this.key_arrow_down  = function()
  {
    GUI.select_sequencer_cell(this.selection.x1,this.selection.y1+1);
    this.selection.y1 += 1;
  }

  this.key_arrow_left  = function()
  { 
    if(this.selection.x1 < 1){ return; }
    GUI.select_sequencer_cell(this.selection.x1-1,this.selection.y1);
    this.selection.x1 -= 1;
  }

  this.key_arrow_right = function()
  {
    if(this.selection.x1 > 6){ return; }
    GUI.select_sequencer_cell(this.selection.x1+1,this.selection.y1);
    this.selection.x1 += 1;
  }

  this.key_escape = function()
  {
    GUI.stop_audio();
    GUI.pattern_controller.deselect_mod();
    GUI.deselect_all();
  }

}