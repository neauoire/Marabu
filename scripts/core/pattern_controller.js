function Pattern_Controller()
{
  this.el = document.getElementById("pattern_controller");  
  this.status_el = document.getElementById("pattern_controller_status");

  this.select = function(col,row)
  {
    GUI.deselect_all();
    this.el.setAttribute("class","pattern edit");
    this.status_el.innerHTML = col+":"+row;
  }

  this.deselect = function()
  {
    this.el.setAttribute("class","pattern");
    this.status_el.innerHTML = "";
  }
}