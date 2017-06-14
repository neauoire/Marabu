function Keyboard()
{
  this.host = null;

  this.shift_held = false;
  this.alt_held = false;

  document.onkeyup = function myFunction(){ keyboard.listen_onkeyup(event); };
  document.onkeydown = function myFunction(){ keyboard.listen_onkeydown(event); };

  this.listen_onkeydown = function(event)
  {
    if(event.shiftKey == true){
      this.shift_held = true;
    }
    if(event.altKey == true){
      this.alt_held = true;
    }
  }

  this.listen_onkeyup = function(event)
  {
    this.shift_held = false;
    this.alt_held = false;

    event.preventDefault();

    if(GUI.sequence_controller.is_selected){
      this.host = GUI.sequence_controller;
    }
    else if(GUI.pattern_controller.is_selected){
      this.host = GUI.pattern_controller;
    }
    else{
      this.host = GUI.instrument_controller;
    }

    this.host.input(event.keyCode,event.key);

    switch (event.key || event.keyCode || event.which)
    {
      case "ArrowUp": this.host.key_arrow_up(); break;
      case "ArrowDown": this.host.key_arrow_down(); break;
      case "ArrowLeft": this.host.key_arrow_left(); break;
      case "ArrowRight": this.host.key_arrow_right(); break;

      case "Escape" || 27:  this.key_escape(); break;

      // Pattern Mods
      case "]": this.host.key_square_bracket_right(); break;
      case "[": this.host.key_square_bracket_left(); break;
      case "}": this.host.key_curly_bracket_right(); break;
      case "{": this.host.key_curly_bracket_left(); break;

      // Pattern Copy/Paste
      case "c": this.host.host.key_letter_c(); break;
      case "v": this.host.host.key_letter_v(); break;

      // Keyboard Up/Down
      case "z": this.host.key_letter_z(); break;
      case "x": this.host.key_letter_x(); break;

      // Keyboard Notes
      case "0": this.host.key_letter_0(); break;
      case "1": this.host.key_letter_1(); break;
      case "2": this.host.key_letter_2(); break;
      case "3": this.host.key_letter_3(); break;
      case "4": this.host.key_letter_4(); break;
      case "5": this.host.key_letter_5(); break;
      case "6": this.host.key_letter_6(); break;
      case "7": this.host.key_letter_7(); break;
      case "8": this.host.key_letter_8(); break;
      case "9": this.host.key_letter_9(); break;

      // Keyboard Notes
      case "a": this.host.key_letter_a(); break;
      case "s": this.host.key_letter_s(); break;
      case "d": this.host.key_letter_d(); break;
      case "f": this.host.key_letter_f(); break;
      case "g": this.host.key_letter_g(); break;
      case "h": this.host.key_letter_h(); break;
      case "j": this.host.key_letter_j(); break;

      // Keyboard Notes(Sharp)
      case "w": this.host.key_letter_w(); break;
      case "e": this.host.key_letter_e(); break;
      case "t": this.host.key_letter_t(); break;
      case "y": this.host.key_letter_y(); break;
      case "u": this.host.key_letter_u(); break;
    }
  };

  // Keybaord Notes
  this.key_letter_a = function(){ GUI.keyboard_play(0); }
  this.key_letter_s = function(){ GUI.keyboard_play(2); }
  this.key_letter_d = function(){ GUI.keyboard_play(4); }
  this.key_letter_f = function(){ GUI.keyboard_play(5); }
  this.key_letter_g = function(){ GUI.keyboard_play(7); }
  this.key_letter_h = function(){ GUI.keyboard_play(9); }
  this.key_letter_j = function(){ GUI.keyboard_play(11); }
  // Keyboard Notes sharp
  this.key_letter_w = function(){ GUI.keyboard_play(1); }
  this.key_letter_e = function(){ GUI.keyboard_play(3); }
  this.key_letter_t = function(){ GUI.keyboard_play(6); }
  this.key_letter_y = function(){ GUI.keyboard_play(8); }
  this.key_letter_u = function(){ GUI.keyboard_play(10); }

  // Keyboard Octave

  this.key_letter_z = function()
  {
    GUI.keyboard_octave_down();    
  }

  this.key_letter_x = function()
  {
    GUI.keyboard_octave_up();    
  }

  // Controls

  this.key_square_bracket_left = function()
  {
    if(GUI.pattern_controller.is_selected){
      GUI.pattern_octave_down();
    }
  }

  this.key_square_bracket_right = function()
  {
    if(GUI.pattern_controller.is_selected){
      GUI.pattern_octave_up();    
    }
  }

  this.key_curly_bracket_left = function()
  {
    if(GUI.pattern_controller.is_selected){
      GUI.pattern_note_down();
    }
  }

  this.key_curly_bracket_right = function()
  {
    if(GUI.pattern_controller.is_selected){
      GUI.pattern_note_up();    
    }
  }

  this.key_letter_c = function()
  {
    if(GUI.pattern_controller.is_selected){
      GUI.pattern_copy();  
    }
  }

  this.key_letter_v = function()
  {
    if(GUI.pattern_controller.is_selected){
      GUI.pattern_paste();  
    }
  }

  this.key_tab = function()
  {
  }

  this.key_enter = function()
  {
  }

  this.key_space = function()
  {
  }

  this.key_arrow_up = function()
  {
  }

  this.key_arrow_down = function()
  {
  }

  this.key_arrow_left = function()
  {
  }

  this.key_arrow_right = function()
  {
  }

  this.key_colon = function()
  {
  }

  this.key_escape = function()
  {
    GUI.stop_audio();
    GUI.pattern_controller.deselect_mod();
    GUI.deselect_all();
  }

  this.key_delete = function()
  {
  }
}
