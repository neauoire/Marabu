function Instrument()
{
  var target = this;

  this.sliders = {};
  this.choices = {};
  this.toggles = {};

  this.start = function()
  {
    console.log("Started Instrument");

    this.setup_sliders([
      {id: "env_att", name: "ATK", min: 0, max: 255, control:0 },
      {id: "env_sust", name: "SUS", min: 0, max: 255, control:1 },
      {id: "env_rel", name: "REL", min: 0, max: 255, control:2 },

      {id: "osc1_vol", name: "VOL", min: 0, max: 255, percent: true, control:5 },
      {id: "osc1_semi", name: "FRQ", min: 92, max: 164, control:6 },

      {id: "osc2_vol", name: "VOL", min: 0, max: 255, percent: true, control:9 },
      {id: "osc2_semi", name: "FRQ", min: 92, max: 164, control:10 },
      {id: "osc2_det", name: "DET", min: 0, max: 255, percent: true, nonLinear: true, control:11 },

      {id: "lfo_amt", name: "AMT", min: 0, max: 255, control:13 },
      {id: "lfo_freq", name: "FRQ", min: 0, max: 254, control:14 },
      {id: "lfo_fxfreq", name: "MOD", min: 0, max: 255, control:15 },

      {id: "fx_freq", name: "FRQ", min: 0, max: 255, nonLinear: true, control:17 },
      {id: "fx_res", name: "RES", min: 0, max: 254, control:18 },
      {id: "fx_dly_amt", name: "DLY", min: 0, max: 255, control:19 },
      {id: "fx_dly_time", name: "SPD", min: 0, max: 16, control:20 },
      {id: "fx_pan_amt", name: "PAN", min: 0, max: 255, control:21 },
      {id: "fx_pan_freq", name: "FRQ", min: 0, max: 16, control:22 },

      {id: "noise_vol", name: "NOI", min: 0, max: 255, control:23 },
      {id: "fx_bit", name: "BIT", min: 0, max: 255, control:24 },
      {id: "fx_dist", name: "DIS", min: 0, max: 255, nonLinear: true, control:25 },
      {id: "fx_pin", name: "PIN", min: 0, max: 255, control:26 },
      {id: "fx_compressor", name: "CMP", min: 0, max: 255, control:27 },
      {id: "fx_drive", name: "DRV", min: 0, max: 255, control:28 },
    ]);

    this.setup_choices([
      {id: "osc1_wave_select", name: "OSC", choices: ["SIN","SQR","SAW","TRI"], control:3},
      {id: "osc2_wave_select", name: "OSC", choices: ["SIN","SQR","SAW","TRI"], control:7},
      {id: "lfo_wave_select", name: "LFO", choices: ["SIN","SQR","SAW","TRI"], control:12},
      {id: "fx_filter_select", name: "EFX", choices: [null,"HP","LP","BP"], control:16},
    ])

    this.setup_toggles([
      {id: "osc1_xenv", name: "MOD", control:4},
      {id: "osc2_xenv", name: "MOD", control:8},
    ]);
  }

  this.setup_sliders = function(sliders)
  {
    for(id in sliders){
      var s = sliders[id];
      var slider = new UI_Slider(s.id,s.name,s.min,s.max,s.control);
      this.sliders[new String(s.id)] = slider;
      slider.install();
    }
  }

  this.setup_choices = function(choices)
  {
    for(id in choices){
      var c = choices[id];
      var choice = new UI_Choice(c.id,c.name,c.choices,c.control);
      this.choices[new String(c.id)] = choice;
      choice.install();
    }
  }

  this.setup_toggles = function(toggles)
  {
    for(id in toggles){
      var t = toggles[id];
      var toggle = new UI_Toggle(t.id,t.name,t.control);
      this.toggles[new String(t.id)] = toggle;
      toggle.install();
    }    
  }

  this.get_storage = function(id)
  {
    if      (id == "osc1_vol")    { return 1; }
    else if (id == "osc1_semi")   { return 2; }
    else if (id == "osc1_xenv")   { return 3; }
    else if (id == "osc1_wave_select") { return 0; }

    else if (id == "osc2_vol")    { return 5; }
    else if (id == "osc2_semi")   { return 6; }
    else if (id == "osc2_det")    { return 7; }
    else if (id == "osc2_xenv")   { return 8; }
    else if (id == "fx_bit")      { return 9; }
    else if (id == "osc2_wave_select") { return 4; }

    else if (id == "env_att")     { return 10; }
    else if (id == "env_sust")    { return 11; }
    else if (id == "env_rel")     { return 12; }

    else if (id == "noise_vol")      { return 13; }
    else if (id == "fx_compressor")      { return 14; }

    // else if (id == "arp_note1")   { return 13; }
    // else if (id == "arp_note2")   { return 13; }
    // else if (id == "arp_speed")   { return 14; }

    else if (id == "lfo_amt")     { return 16; }
    else if (id == "lfo_freq")    { return 17; }
    else if (id == "lfo_fxfreq") { return 18; }
    else if (id == "lfo_wave_select") { return 15; }

    else if (id == "fx_filter_select")   { return 19; }
    else if (id == "fx_freq")     { return 20; }
    else if (id == "fx_res")      { return 21; }
    else if (id == "fx_dist")     { return 22; }
    else if (id == "fx_drive")    { return 23; }
    else if (id == "fx_pan_amt")  { return 24; }
    else if (id == "fx_pan_freq") { return 25; }
    else if (id == "fx_dly_amt")  { return 26; }
    else if (id == "fx_dly_time") { return 27; }
    else if (id == "fx_pin")      { return 28; }
    return -1;
  }

  this.control_target = function(control_id)
  {
    for(id in this.sliders){
      if(this.sliders[id].control == control_id){ return this.sliders[id]; }
    }
    for(id in this.choices){
      if(this.choices[id].control == control_id){ return this.choices[id]; }
    }
    for(id in this.toggles){
      if(this.toggles[id].control == control_id){ return this.toggles[id]; }
    }
    return null;
  }

  this.update = function()
  {
    for(slider_id in this.sliders){
      var slider = this.sliders[slider_id];
      var value = marabu.song.instrument().i[this.get_storage(slider_id)];
      slider.override(value);
      slider.update();
    }

    for(choice_id in this.choices){
      var choice = this.choices[choice_id];
      var value = marabu.song.instrument().i[this.get_storage(choice_id)];
      choice.override(value);
    }

    for(toggle_id in this.toggles){
      var toggle = this.toggles[toggle_id];
      var value = marabu.song.instrument().i[this.get_storage(toggle_id)];
      toggle.override(value);
    }
    marabu.song.mJammer_update();
  }

  this.build = function()
  {
    var html = "";
    html += "  <div id='instrument'>";
    html += "    <div class='env' style='width:180px; margin-bottom:15px'>";
    html += "      <div id='env_att'></div>";
    html += "      <div id='env_sust'></div>";
    html += "      <div id='env_rel'></div>";
    html += "    </div>";
    html += "    <div class='osc' style='width:180px; margin-bottom:15px'><t id='osc1_wave_select'></t><t id='osc1_xenv'>X</t>";
    html += "      <div id='osc1_vol'></div>";
    html += "      <div id='osc1_semi'></div>";
    html += "    </div>";
    html += "    <div class='osc' style='width:180px; margin-bottom:15px'><t id='osc2_wave_select'></t><t id='osc2_xenv'>?</t>";
    html += "      <div id='osc2_vol'></div>";
    html += "      <div id='osc2_semi'></div>";
    html += "      <div id='osc2_det'></div>";
    html += "    </div>";
    html += "    <div class='lfo' style='width:180px; margin-bottom:15px'>";
    html += "      <h1>";
    html += "        <t id='lfo_wave_select'></t>";
    html += "      </h1>";
    html += "      <div id='lfo_amt'></div>";
    html += "      <div id='lfo_freq'></div>";
    html += "      <div id='lfo_fxfreq'></div>";
    html += "    </div>";
    html += "    <div class='efx' style='width:180px; margin-bottom:15px'><t id='fx_filter_select'></t>";
    html += "      <div id='fx_freq'></div>";
    html += "      <div id='fx_res'></div>";
    html += "      <div id='fx_dly_amt'></div>";
    html += "      <div id='fx_dly_time'></div>";
    html += "      <div id='fx_pan_amt'></div>";
    html += "      <div id='fx_pan_freq'></div>";
    html += "    </div>";
    html += "    <div class='efx' style='width:180px; margin-bottom:15px'>";
    html += "      <div id='noise_vol'></div>";
    html += "      <div id='fx_bit'></div>";
    html += "      <div id='fx_dist'></div>";
    html += "      <div id='fx_pin'></div>";
    html += "      <div id='fx_compressor'></div>";
    html += "      <div id='fx_drive'></div>";
    html += "    </div>";
    html += "  </div>";
    return html;
  }
}
