function Sequence_Controller()
{
  this.el = document.getElementById("sequence_controller");
  this.status_el = document.getElementById("sequence_controller_status");

  this.select = function(col,row)
  {
    GUI.deselect_all();
    this.el.setAttribute("class","sequencer edit");
    this.status_el.innerHTML = col+":"+row;
  }

  this.deselect = function()
  {
    this.el.setAttribute("class","sequencer");
    this.status_el.innerHTML = "";
  }
}