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
    this.status_el.innerHTML = GUI.instrument().name ? GUI.instrument().name : "?";
    this.is_selected = false;
  }

  this.select_instrument = function(instrument_id)
  {
    this.instrument_id = instrument_id;

    this.status_el.innerHTML = this.instrument_id;
  }

  this.export_instrument = function()
  {
    var instr_str = GUI.instrument().i.slice(0,28).toString();
    var str = "{\"name\":\"Untitled\",\"i\":["+instr_str+"]}";
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

  this.load_kit = function(kit_data)
  {

  }
}