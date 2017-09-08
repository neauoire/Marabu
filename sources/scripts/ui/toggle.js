function UI_Toggle(id,name = "UNK",control = null)
{
  var app = marabu;
  var self = this;

  this.id = id;
  this.name = name;
  this.el = document.getElementById(id);
  this.value = 0;
  this.control = control;
  this.el.style.cursor = "pointer";

  var target = this;

  this.install = function()
  {
    this.el.style.padding = "0px 2.5px";

    this.el.innerHTML = this.name;
  }

  this.mod = function(v)
  {
    this.value = v > 0 ? 1 : 0;
    this.update();
  }

  this.save = function()
  {
    var control_storage = app.instrument.get_storage(this.id);
    
    app.song.inject_control(app.selection.instrument,control_storage,this.value);
  }

  this.update = function()
  {
    this.el.className = "";
    this.el.className += this.value == 1 ? "fh" : "fl";
    this.el.className += app.selection.control == this.control ? " bl" : "";
  }

  this.override = function(value)
  {
    this.value = value;
    this.update();
  }

  this.mouse_down = function()
  {
    app.selection.control = self.control;
    app.update();
  }

  this.el.addEventListener("mousedown", this.mouse_down, false);
}