function UI_Slider(data)
{
  var app = marabu;
  var self = this;

  this.family = null;
  this.id = data.id;
  this.storage = 0;

  this.name = data.name;
  this.min = data.min;
  this.max = data.max;

  this.control = 0;
  this.center = data.center;
  this.percent = data.percent;

  this.value = this.min;

  this.el = document.createElement("div");
  this.name_el = document.createElement("t");
  this.value_el = document.createElement("t");
  this.slide_el = document.createElement("div"); this.slide_el.className = "slide";

  this.install = function(parent)
  {
    this.el.className = `control slider ${this.center ? 'center' : ''}`;

    // Name Span
    this.name_el.className = "name";
    this.name_el.innerHTML = this.name;

    // Value Input
    this.value_el.className = "value";
    this.value_el.textContent = "--";

    this.el.appendChild(this.name_el);
    this.el.appendChild(this.slide_el);
    this.el.appendChild(this.value_el);

    this.el.addEventListener("mousedown", this.mouse_down, false);

    parent.appendChild(this.el);
    this.storage = marabu.instrument.get_storage(this.family+"_"+this.id);
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
    marabu.song.inject_control(marabu.selection.instrument,this.storage,this.value);
  }

  this.update = function()
  {
    var val = parseInt(this.value) - parseInt(this.min);
    var over = parseFloat(this.max) - parseInt(this.min);
    var perc = val/parseFloat(over);
    var val_mod = this.center ? this.value - Math.floor(this.max/2) : this.value
    var keyframe = this.last_keyframe();

    var c = ""
    c = 'slider control '
    c += app.selection.control == this.control ? 'selected ' : '';
    c += keyframe ? 'keyframed ' : '';
    c += this.value == this.min ? 'min ' : ''
    c += this.value == this.max ? 'max ' : ''

    this.el.className = c;
    this.value_el.textContent = app.selection.control != this.control && keyframe ? '$'+keyframe : (keyframe ? '$' : '')+val_mod;
    this.update_display(perc);
  }

  this.last_keyframe = function()
  {
    var i = app.selection.instrument;
    var t = app.selection.track;
    var f = this.storage;
    while(t >= 0){
      var r = app.selection.track == t ? app.selection.row : 32;
      while(r >= 0){
        var cmd = app.song.effect_at(i,t,r)
        if(cmd == f+1){
          return app.song.effect_value_at(i,t,r);
        }
        r -= 1;
      }
      t -= 1;
    }
    return null;
  }

  this.update_display = function(perc)
  {
    var html = ""
    var c = 0;
    while(c < perc*80){
      html += "-"
      c += 10;
    }
    html = `<t class='fg'>${html}</t>`
    while(c < 80){
      html += "-"
      c += 10
    }
    this.slide_el.innerHTML = `${html}`
  }

  this.mouse_down = function(e)
  {
    app.selection.control = self.control;
    app.update();
  }
}
