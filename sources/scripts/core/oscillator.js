var Oscillator = function()
{
  function clamp(v, min, max) { return v < min ? min : v > max ? max : v; }
  
  this.sin = function (value)
  {
    return Math.sin(value * 2 * Math.PI);
  };

  this.abs = function(value)
  {
    return 0.5 + Math.sin(value * 2 * Math.PI);
  }

  this.pulse = function (value)
  {
    return clamp(0.05/(Math.sin(2 * Math.PI * value) * Math.tan(2 * Math.PI * value)),-1.0,1.0);
  }

  this.saw = function(value)
  {
    return 2 * (value % 1) - 1;
  }

  this.rev = function(value)
  {
    return 1 - (2 * (value % 1));
  }

  this.square = function(value)
  {
    return (value % 1) < 0.5 ? 1 : -1;
  }

  this.noise = function(value)
  {
    return (2 * Math.random() - 1);
  }

  this.tri = function(value)
  {
    var v2 = (value % 1) * 4;
    if (v2 < 2) return v2 - 1;
    return 3 - v2;
  }

  // generates waveform from custom text
  // e.g.: 'sin(x)'
  this.custom = function(value, expression)
  {
    var ret = eval('var x=value;' + expression);
    ret = ret > 1.0 ? 1.0 : ret;
    ret = ret < -1.0 ? -1.0 : ret;
    return ret;
  }

  // TODO: complete sin2 - clear idea what I want, but... maths.
  // this.osc_sin2 = function (value) {
  //   return Math.sin(2 * Math.PI * value) * Math.sin(4 * Math.PI * value);
  // }
}