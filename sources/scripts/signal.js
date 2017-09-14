function Signal_Processor()
{
  this.knobs = {distortion:null,pinking:null,compressor:null,drive:null};

  this.compressor_average = 0;

  this.operate = function(input)
  {
    var output = input;

    output = this.effect_distortion(output,this.knobs.distortion);
    output = this.effect_pinking(output,this.knobs.pinking);
    output = this.effect_compressor(output,this.knobs.compressor);
    output = this.effect_drive(output,this.knobs.drive);

    return output;
  }

  var b0, b1, b2, b3, b4, b5, b6; b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;

  this.effect_pinking = function(input,val)
  {
    b0 = 0.99886 * b0 + input * 0.0555179;
    b1 = 0.99332 * b1 + input * 0.0750759;
    b2 = 0.96900 * b2 + input * 0.1538520;
    b3 = 0.86650 * b3 + input * 0.3104856;
    b4 = 0.55000 * b4 + input * 0.5329522;
    b5 = -0.7616 * b5 - input * 0.0168980;
    var output = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + input * 0.5362) * 0.1;
    b6 = input * 0.115926;

    return (output * val) + (input * (1 - val));
  }

  this.effect_compressor = function(input,val)
  {
    var output = input;
    if(input < this.compressor_average){
      output *= 1 + val;
    }
    else if(input > this.compressor_average){
      output *= 1 - val;
    }
    return output;
  }

  this.effect_distortion = function(input,val)
  {
    if(!val){ return input; }

    var output = input;
    output *= val;
    output = output < 1 ? output > -1 ? osc_sin(output*.25) : -1 : 1;
    output /= val;
    return output;
  }

  this.effect_drive = function(input,val)
  {
    var output = input;
    return output * val;
  }
}