function Instrument_Controller()
{
  this.el = document.getElementById("instrument_controller");  
  this.status_el = document.getElementById("instrument_controller_status");
  this.is_selected = false;
  this.instrument_id = 0;

  this.select = function(id,col,row)
  {
    GUI.deselect_all();

  }

  this.deselect = function()
  {
    this.el.setAttribute("class","instrument");
    this.status_el.innerHTML = "";
    this.is_selected = false;
  }

  this.select_instrument = function(instrument_id)
  {
    this.instrument_id = instrument_id;

    this.status_el.innerHTML = this.instrument_id;
  }
}