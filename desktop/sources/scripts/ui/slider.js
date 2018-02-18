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
  this.slide_el = document.createElement("div");    this.slide_el.className = "slide";
  this.slide_bg_el = document.createElement("div"); this.slide_bg_el.className = "bg";
  this.slide_fg_el = document.createElement("div"); this.slide_fg_el.className = "fg";
  this.center_el = document.createElement("div"); this.center_el.className = "center";

  this.install = function(parent)
  {
    this.el.className = `control slider ${this.center ? 'center' : ''}`;

    // Name Span
    this.name_el.className = "name";
    this.name_el.innerHTML = this.name;

    // Value Input
    this.value_el.className = "w2";
    this.value_el.style.marginLeft = "10px";
    this.value_el.textContent = "--";

    this.el.appendChild(this.name_el);
    this.slide_el.appendChild(this.slide_bg_el);
    this.slide_el.appendChild(this.slide_fg_el);
    this.slide_el.appendChild(this.center_el);
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
    this.el.className = app.selection.control == this.control ? `slider  control ${this.center ? 'center' : ''} bl` : `slider control ${this.center ? 'center' : ''}`;
    this.name_el.className = app.selection.control == this.control ? "name fh" : "name fm";

    var val = parseInt(this.value) - parseInt(this.min);
    var over = parseFloat(this.max) - parseInt(this.min);
    var perc = val/parseFloat(over);
    var val_mod = this.center ? this.value - Math.floor(this.max/2) : this.value

    if(this.center){
      this.slide_fg_el.style.left = val_mod < 0 ? `${perc * 100}%` : `50%`;
      this.slide_fg_el.style.width = val_mod < 0 ? `calc(50% - ${perc*100}%)` : `calc(${perc * 100}% - 50%)`;
      this.center_el.style.left = `${perc * 100}%`;
    }
    else{
      this.slide_fg_el.style.width = `${perc * 100}%`;  
    }
    
    this.value_el.textContent = val_mod;
    this.value_el.className = "fm ";

    if(this.value == this.min){ this.value_el.className = "fl "; }
    else if(this.value == this.max){ this.value_el.className = "fh "; }

    // Keyframes
    if(this.has_keyframes()){
      this.name_el.className = "name b_inv f_inv";
    }
  }

  this.has_keyframes = function()
  {
    var i = app.selection.instrument;
    var t = 0;
    var f = this.storage;
    while(t <= app.selection.track){
      var r = 0;
      while(r < 32){
        var cmd = app.song.effect_at(i,t,r)
        if(cmd == f+1){
          return app.song.effect_value_at(i,t,r);
        }
        r += 1;
      }
      t += 1;
    }
    return null;
  }

  this.mouse_down = function(e)
  {
    app.selection.control = self.control;
    app.update();
  }
}
