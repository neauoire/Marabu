function Signal_Processor()
{
  this.knobs = {distortion:null,pinking:null,compressor:null,drive:null,bit_phaser:null,bit_step:null,pan:null};

  this.step_last = 0;
  this.phase = 0;
  this.average = 0;

  this.operate = function(input)
  {
    var output = input;

    output = this.effect_bitcrusher(output);

    output = this.effect_distortion(output,this.knobs.distortion);
    output = this.effect_pinking(output,this.knobs.pinking);
    output = this.effect_compressor(output,this.knobs.compressor);
    output = this.effect_drive(output,this.knobs.drive);

    this.average = ((this.average * ((this.knobs.compressor) * 1000)) + output)/(((this.knobs.compressor) * 1000)+1);

    // Pan
    var left = output * (1 - this.knobs.pan);
    var right = output * (this.knobs.pan);

    return {left:left,right:right};
  }

  this.effect_bitcrusher = function(input)
  {
    var output = input;

    this.phase += this.knobs.bit_phaser; // Between 0.1 and 1
    var step = Math.pow(1/2, this.knobs.bit_step); // between 1 and 16

    if(this.phase >= 1.0) {
      this.phase -= 1.0;
      this.step_last = step * Math.floor(output / step + 0.5);
    }

    output = this.knobs.bit_step < 16 ? this.step_last : output;

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
    if(input < this.average){
      output *= 1 + val;
    }
    else if(input > this.average){
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

  // Tools

  this.delay_conv = function(val)
  {
    return [0,32,24,16,12,8,6,4][val];
  }

  this.osc_to_waveform = function(index)
  {
    if(index == 0 ){ return [0,0]; } // SIN
    if(index == 1 ){ return [0,1]; } // SINSQR
    if(index == 2 ){ return [0,2]; } // SINSAW
    if(index == 3 ){ return [0,3]; } // SINTRI
    if(index == 4 ){ return [1,1]; } // SQR
    if(index == 5 ){ return [1,0]; } // SQRSIN
    if(index == 6 ){ return [1,2]; } // SQRSAW
    if(index == 7 ){ return [1,3]; } // SQRTRI
    if(index == 8 ){ return [2,2]; } // SAW
    if(index == 9 ){ return [2,0]; } // SAWSIN
    if(index == 10){ return [2,1]; } // SAWSQR
    if(index == 11){ return [2,3]; } // SAWTRI
    if(index == 12){ return [3,3]; } // TRI
    if(index == 13){ return [3,0]; } // TRISIN
    if(index == 14){ return [3,1]; } // TRISQR
    if(index == 15){ return [3,2]; } // TRISAW
  }
}