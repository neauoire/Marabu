function UI_Choice(data)
{
  this.family = null;
  this.id = data.id;
  this.name = data.name;
  this.choices = data.choices;

  this.control = 0;

  this.el = document.createElement("div");
  this.name_el = document.createElement("t");
  this.value_el = document.createElement("t");

  this.index = 0;

  var target = this;

  this.install = function(parent)
  {
    this.el.style.padding = "0px 2.5px";
    // Name Span
    this.name_el.className = "name";
    this.name_el.innerHTML = this.name;
    this.name_el.style.width = "30px";
    this.name_el.style.display = "inline-block";

    this.value_el.textContent = this.min+"/"+this.max;
    this.value_el.className = "fh";

    this.el.appendChild(this.name_el);
    this.el.appendChild(this.value_el);

    this.el.addEventListener("mousedown", this.mouse_down, false);

    parent.appendChild(this.el);
  }

  this.mod = function(v)
  {
    this.index += v > 0 ? 1 : -1;
    this.index = this.index % this.choices.length;
    this.index = this.index < 0 ? this.choices.length-1 : this.index;
    this.update();
  }

  this.override = function(v)
  {
    if(v == null){ console.log("Missing control value",this.family+"."+this.id); return;}

    var v = v % this.choices.length;
    this.index = v;
    this.update();
  }

  this.save = function()
  {
    var storage_id = marabu.instrument.get_storage(this.family+"_"+this.id);
    marabu.song.inject_control(marabu.selection.instrument,storage_id,this.index % this.choices.length);
  }

  this.update = function()
  {
    var target = this.choices[this.index % this.choices.length];
    this.value_el.textContent = target;
    
    this.el.className = marabu.selection.control == this.control ? "bl" : "";
    this.name_el.className = marabu.selection.control == this.control ? "fh" : "fm";
  }

  this.mouse_down = function(e)
  {
    marabu.selection.control = target.control;
    marabu.update();
  }
}