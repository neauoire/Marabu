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

  this.value = 0;

  var target = this;

  this.install = function(parent)
  {
    this.el.className = "control choice";
    // Name Span
    this.name_el.className = "name";
    this.name_el.innerHTML = this.name;

    this.value_el.textContent = this.min+"/"+this.max;
    this.value_el.className = "fh";

    this.el.appendChild(this.name_el);
    this.el.appendChild(this.value_el);

    this.el.addEventListener("mousedown", this.mouse_down, false);

    parent.appendChild(this.el);
    this.storage = marabu.instrument.get_storage(this.family+"_"+this.id);
  }

  this.mod = function(v)
  {
    this.value += v > 0 ? 1 : -1;
    this.value = this.value % this.choices.length;
    this.value = this.value < 0 ? this.choices.length-1 : this.value;
    this.update();
  }

  this.override = function(v)
  {
    if(v == null){ console.log("Missing control value",this.family+"."+this.id); return;}

    var v = v % this.choices.length;
    this.value = v;
    this.update();
  }

  this.save = function()
  {
    var storage_id = marabu.instrument.get_storage(this.family+"_"+this.id);
    marabu.song.inject_control(marabu.selection.instrument,storage_id,this.value % this.choices.length);
  }

  this.update = function()
  {
    var target = this.choices[this.value % this.choices.length];
    this.value_el.textContent = target;
    
    this.el.className = marabu.selection.control == this.control ? "control choice bl" : "control choice ";
    this.name_el.className = marabu.selection.control == this.control ? "name fh" : "name fm";

    // Keyframes
    if(this.has_keyframes()){
      this.name_el.className = "name b_inv f_inv";
    }
  }

  this.has_keyframes = function()
  {
    var i = marabu.selection.instrument;
    var t = 0;
    var f = this.storage;
    while(t <= marabu.selection.track){
      var r = 0;
      while(r < 32){
        var cmd = marabu.song.effect_at(i,t,r)
        if(cmd == f+1){
          return marabu.song.effect_value_at(i,t,r);
        }
        r += 1;
      }
      t += 1;
    }
    return null;
  }

  this.mouse_down = function(e)
  {
    marabu.selection.control = target.control;
    marabu.update();
  }
}