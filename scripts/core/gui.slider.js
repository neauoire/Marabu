function Slider(id,name = "UNK",min = 0,max = 255)
{
  this.id = id;
  this.name = name;
  this.min = min;
  this.max = max;

  this.el = document.getElementById(id);
  this.name_el = null;
  this.value_el = null;
  this.slide_el = null;
  this.handle_el = null;

  this.is_active = false;

  this.install = function()
  {
    this.el.setAttribute("class","slider");

    // Name Span
    this.name_el = document.createElement("span");
    this.name_el.setAttribute("class","name");
    this.name_el.innerHTML = this.name;
    this.el.appendChild(this.name_el);

    // Value Input
    this.value_el = document.createElement("input");
    this.value_el.setAttribute("class","value");
    this.value_el.value = this.min+"/"+this.max;
    this.el.appendChild(this.value_el);

    // Slide Div
    this.slide_el = document.createElement("div");
    this.slide_el.setAttribute("class","slide");
    this.slide_el.style.marginLeft = 0;
    this.el.appendChild(this.slide_el);

    // Progress Div
    this.progress_el = document.createElement("div");
    this.progress_el.setAttribute("class","progress");
    this.progress_el.style.width = 100;
    this.el.appendChild(this.progress_el);

    // Handle Div
    this.handle_el = document.createElement("div");
    this.handle_el.setAttribute("class","handle");
    this.handle_el.style.marginLeft = 0;
    this.slide_el.appendChild(this.handle_el);

    this.slide_el.addEventListener("mousedown", mouse_down, false);
    this.slide_el.addEventListener("mouseup", mouse_up, false);
    this.slide_el.addEventListener("mousemove", mouse_move, false);
    this.value_el.addEventListener('input', value_update, false);

    this.value_el.addEventListener("mousedown", select, false);

    console.log("Installed",this.id);
  }

  this.override = function(v)
  {
    this.value = parseInt(v);

    var mar_left = ((this.value/parseFloat(this.max)) * 120)+"px"
    this.handle_el.style.marginLeft = mar_left;
    this.progress_el.style.width = mar_left;
    this.value_el.value = this.value;
    this.update();
  }

  this.save = function()
  {
    GUI.update_instrument(GUI.get_storage(this.id),this.value,this.id);
  }

  this.activate = function()
  {
    this.is_active = true;
    this.el.setAttribute("class","slider active");
  }

  this.deactivate = function()
  {
    this.is_active = false;
    this.el.setAttribute("class","slider");
  }

  this.update = function()
  {
    if(parseInt(this.value_el.value) == this.min){ this.value_el.style.color = "#333"; }
    else if(parseInt(this.value_el.value) == this.max){ this.value_el.style.color = "#72dec2"; }
    else{ this.value_el.style.color = "#fff"; }

    GUI.update_status("Updated <b>"+this.id+"</b> to "+this.value+"/"+this.max);
  }

  function select(e)
  {
    e.target.select();
    e.preventDefault();
  }

  function value_update(e)
  {
    var id = this.parentNode.id;
    var target_obj = GUI.sliders[id];
    var target_val = parseInt(target_obj.value_el.value)

    if(target_val > target_obj.max){target_val = target_obj.max; }
    if(target_val < target_obj.min){target_val = target_obj.min; }

    target_obj.value = parseInt(target_val);

    var mar_left = ((target_obj.value/parseFloat(target_obj.max)) * 120)+"px"
    target_obj.handle_el.style.marginLeft = mar_left;
    target_obj.progress_el.style.width = mar_left;
    target_obj.update();
  }

  function mouse_update(target_obj,offset)
  {
    var target_pos = offset-15;
    target_pos = target_pos < 0 ? 0 : target_pos;
    target_pos = target_pos > 115 ? 120 : target_pos;
    target_obj.handle_el.style.marginLeft = target_pos+"px";
    target_obj.progress_el.style.width = target_pos+"px";

    var ratio = target_pos/120.0;
    var range = parseInt(target_obj.max) - parseInt(target_obj.min);
    target_obj.value = target_obj.min + parseInt(ratio * range);

    target_obj.value_el.value = target_obj.value;
    target_obj.update();
    target_obj.save();
  }

  function mouse_down(e)
  {
    var id = this.parentNode.id;
    var target_obj = GUI.sliders[id];

    mouse_update(target_obj,e.layerX);
    target_obj.activate();
  }

  function mouse_up(e)
  {
    var id = this.parentNode.id;
    var target_obj = GUI.sliders[id];

    mouse_update(target_obj,e.layerX);
    target_obj.deactivate();
  }

  function mouse_move(e)
  {
    var id = this.parentNode.id;
    var target_obj = GUI.sliders[id];
    if(!target_obj.is_active){ return; }
    mouse_update(target_obj,e.layerX);
  }
}