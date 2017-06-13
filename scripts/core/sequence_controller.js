function Sequence_Controller()
{
  this.el = document.getElementById("sequence_controller");
  this.status_el = document.getElementById("sequence_controller_status");
  this.is_selected = false;

  this.instrument_id = -1;

  this.select = function(o,col,row)
  {
    GUI.deselect_all();

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
}