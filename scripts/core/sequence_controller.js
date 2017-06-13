function Sequence_Controller()
{
  this.el = document.getElementById("sequence_controller");
  this.status_el = document.getElementById("sequence_controller_status");
  this.is_selected = false;

  this.select = function(col,row)
  {
    GUI.deselect_all();
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