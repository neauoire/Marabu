function Instrument()
{
  var target = this;

  this.el = null;

  this.start = function()
  {
    this.el = document.getElementById("instrument");

    this.controls = {
      envelope : {
        type      : new UI_Choice({name: "ENV", choices: ["LINEAR","EXP"] }),
        attack    : new UI_Slider({name: "ATK", min: 0,  max: 255 }),
        sustain   : new UI_Slider({name: "SUS", min: 0,  max: 255 }),
        release   : new UI_Slider({name: "REL", min: 0,  max: 255 }),
        curve     : new UI_Slider({name: "POW", min: 12, max: 255 })  
      },
      osc: {
        shape     : new UI_Choice({name: "OSC", choices: ["SIN","SINSQR","SINSAW","SINTRI","SQR","SQRSIN","SQRSAW","SQRTRI","SAW","SAWSIN","SAWSQR","SAWTRI","TRI","TRISIN","TRISQR","TRISAW","NOISE","PULSE","REVSAW"]}),
        frequency : new UI_Slider({name: "FRQ", min: 92,  max: 164 }),
        mix       : new UI_Slider({name: "MIX", min: 0,  max: 255, center:true }),
        detune    : new UI_Slider({name: "DET", min: 0,  max: 255 })
      },
      lfo : {
        shape     : new UI_Choice({name: "LFO", choices: ["SIN","SQR","SAW","TRI","NOISE","REVSAW","PULSE"] }),
        frequency : new UI_Slider({name: "FRQ", min: 2,  max: 12 }),
        amount    : new UI_Slider({name: "AMT", min: 0,  max: 255 })
      },
      filter : {
        shape     : new UI_Choice({name: "FLT", choices: ["LP","HP","LP","BP"] }),
        frequency : new UI_Slider({name: "FRQ", min: 0,  max: 255 }),
        resonance : new UI_Slider({name: "RES", min: 0,  max: 254 })
      },
      delay : {
        rate      : new UI_Choice({name: "DLY", choices: ["OFF","1/2","1/3","1/4","1/6","1/8","1/12","1/16"] }),
        amount    : new UI_Slider({name: "AMT", min: 0,  max: 255 })
      },
      effect : {
        noise      : new UI_Slider({name: "NOI", min: 0,  max: 255 }),
        bit        : new UI_Slider({name: "BIT", min: 0,  max: 255 }),
        distortion : new UI_Slider({name: "DIS", min: 0,  max: 64 }),
        pinking    : new UI_Slider({name: "PIN", min: 0,  max: 255 }),
        compressor : new UI_Slider({name: "CMP", min: 0,  max: 255 }),
        drive      : new UI_Slider({name: "DRV", min: 0,  max: 255 }),
        pan        : new UI_Slider({name: "PAN", min: 0,  max: 255, center:true })
      },
      uv : {
        monitor    : new UI_Uv()
      }
    };

    this.install();
  }

  this.install = function()
  {
    var selection_id = 0;
    for(family_id in this.controls){
      var family_el = document.createElement("div");
      family_el.id = family_id;
      family_el.className = "family";
      for(control_id in this.controls[family_id]){
        var ctrl = this.controls[family_id][control_id];
        ctrl.family = family_id;
        ctrl.id = control_id;
        ctrl.control = selection_id;
        ctrl.install(family_el);
        selection_id += 1;
      }
      this.el.appendChild(family_el);
    }
  }

  this.control_target = function(target_control)
  {
    for(family_id in this.controls){
      for(control_id in this.controls[family_id]){
        if(this.controls[family_id][control_id].control == target_control){ return this.controls[family_id][control_id]; }
      }
    }
  }

  this.update = function()
  {
    for(family_id in this.controls){
      for(control_id in this.controls[family_id]){
        var ctrl = this.controls[family_id][control_id];
        var ctrl_storage = this.get_storage(family_id+"_"+control_id);
        var value = marabu.song.control_at(marabu.selection.instrument,ctrl_storage);
        ctrl.override(value);
      }
    }
    marabu.song.mJammer_update();
  }

  this.get_storage = function(id)
  {
    // Env
    switch (id){
      case 'envelope_type'    : return 3
      case 'envelope_attack'  : return 10
      case 'envelope_sustain' : return 11
      case 'envelope_release' : return 12
      case 'envelope_curve'   : return 18
    
      case 'osc_shape'        : return 0
      case 'osc_frequency'    : return 2
      case 'osc_mix'          : return 1
      case 'osc_detune'       : return 7
    
      case 'lfo_shape'        : return 15
      case 'lfo_frequency'    : return 17
      case 'lfo_amount'       : return 16
    
      case 'filter_shape'     : return 19
      case 'filter_frequency' : return 20
      case 'filter_resonance' : return 21
    
      case 'delay_rate'       : return 27
      case 'delay_amount'     : return 26
  
      case 'effect_noise'       : return 13
      case 'effect_bit'     : return 9
      case 'effect_distortion'     : return 22
      case 'effect_pinking'     : return 28
      case 'effect_compressor'     : return 14
      case 'effect_drive'     : return 23
      case 'effect_pan'     : return 24

      case 'uv_monitor'     : return null
    }

    console.log("Unknown",id);
    return -1;
  }

  this.build = function()
  {
    var html = "";
    html += "  <div id='instrument'>";

    html += "  </div>";
    return html;
  }
}
