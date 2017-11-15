function UI_Slider(data)
{
  var app = marabu;
  var self = this;

  this.family = null;
  this.id = data.id;
  this.name = data.name;
  this.min = data.min;
  this.max = data.max;
  
  this.control = 0;
  this.center = data.center;

  this.value = this.min;

  this.el = document.createElement("div");
  this.name_el = document.createElement("t");
  this.value_el = document.createElement("t");
  this.slide_el = document.createElement("div");

  this.install = function(parent)
  {
    this.el.className = "slider";

    // Name Span
    this.name_el.className = "name";
    this.name_el.innerHTML = this.name;
    this.name_el.style.width = "30px";
    this.name_el.style.display = "inline-block";

    // Slide Div
    this.slide_el.className = "pointer";
    this.slide_el.style.height = "15px";
    this.slide_el.style.width = "45px";
    this.slide_el.style.display = "inline-block";
    this.slide_el.style.verticalAlign = "top";

    // Value Input
    this.value_el.className = "w2";
    this.value_el.style.marginLeft = "10px";
    this.value_el.textContent = "--";

    this.el.appendChild(this.name_el);
    this.el.appendChild(this.slide_el);
    this.el.appendChild(this.value_el);

    this.el.addEventListener("mousedown", this.mouse_down, false);

    parent.appendChild(this.el);
  }

  this.mod = function(v,relative = false)
  {
    if(relative && this.max > 128){ v *= 10; }
    if(this.max <= 64 && (v > 1 || v < 1) && Math.abs(v) != 1){ v = v/10;}
    this.value += parseInt(v);
    this.value = clamp(this.value,this.min,this.max);
    this.update();    
  }

  this.override = function(v)
  {
    if(v == null){ console.log("Missing control value",this.family+"."+this.id); return;}

    this.value = parseInt(v);
    this.value = clamp(this.value,this.min,this.max);
    this.update();
  }

  this.save = function()
  {
    var storage_id = marabu.instrument.get_storage(this.family+"_"+this.id);
    marabu.song.inject_control(marabu.selection.instrument,storage_id,this.value);
  }

  this.update = function()
  {
    this.el.className = app.selection.control == this.control ? "slider bl" : "slider";
    this.name_el.className = app.selection.control == this.control ? "fh" : "fm";

    var val = parseInt(this.value) - parseInt(this.min);
    var over = parseFloat(this.max) - parseInt(this.min);
    var perc = val/parseFloat(over);

    this.slide_el.innerHTML = this.center ? "<svg class='fh' style='width:45px;height:15px; stroke-dasharray:1,1; fill:none; stroke-width:1px; stroke-linecap:butt;'><line x1='0' y1='7.5' x2='45' y2='7.5' class='fl'/><line style='stroke-dasharray:0' x1='"+parseInt(parseInt(perc * 45) - 0.5)+"' y1='5.5' x2='"+parseInt(parseInt(perc * 45) - 0.5)+"' y2='9.5' class='fh'/></svg>" : "<svg class='fh' style='width:45px;height:15px; stroke-dasharray:1,1; fill:none; stroke-width:1px; stroke-linecap:butt;'><line x1='0' y1='7.5' x2='45' y2='7.5' class='fl'/><line x1='0' y1='7.5' x2='"+parseInt(perc * 45)+"' y2='7.5' class='fh'/></svg>";
    this.value_el.textContent = this.center ? this.value - Math.floor(this.max/2) : this.value;
    this.value_el.className = "fm ";

    if(this.value == this.min){ this.value_el.className = "fl "; }
    else if(this.value == this.max){ this.value_el.className = "fh "; }
  }

  this.mouse_down = function(e)
  {
    app.selection.control = self.control;
    app.update();
  }
}
