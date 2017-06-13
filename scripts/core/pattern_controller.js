function Pattern_Controller()
{
  this.el = document.getElementById("pattern_controller");  
  this.status_el = document.getElementById("pattern_controller_status");
  this.is_selected = false;

  this.select = function(id,col,row)
  {
    GUI.deselect_all();
    
    if(id < 0){ return; }

    this.el.setAttribute("class","pattern edit");
    this.status_el.innerHTML = id+" "+col+":"+row;
    this.is_selected = true;
    GUI.update_status("Editing Pattern");
  }

  this.deselect = function()
  {
    this.el.setAttribute("class","pattern");
    this.status_el.innerHTML = "";
    this.is_selected = false;
  }
}