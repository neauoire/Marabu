function Pattern_Controller()
{
  this.el = document.getElementById("pattern_controller");  
  this.status_el = document.getElementById("pattern_controller_status");
  this.is_selected = false;
  this.is_mod_selected = false;
  this.pattern_id = -1;

  this.select = function(id,col,row)
  {
    if(this.pattern_id == -1){ GUI.update_status("<span class='error'>No pattern selected!</span>"); return; }
    GUI.deselect_all();
    
    if(id < 0){ return; }

    this.el.setAttribute("class","pattern edit");
    this.status_el.innerHTML = this.pattern_id+" "+col+":"+row;
    this.is_selected = true;
    GUI.update_status("Editing Pattern");
  }

  this.deselect = function()
  {
    this.el.setAttribute("class","pattern");
    this.status_el.innerHTML = "";
    this.is_selected = false;
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

  // MOD

  this.select_mod = function(o,row)
  {
    GUI.deselect_all(); 
    this.is_mod_selected = true;
    o.setAttribute("class","edit");
  }

  this.deselect_mod = function()
  {
    this.is_mod_selected = false;
    GUI.select_mod_row(null); 
  }

  // 
}