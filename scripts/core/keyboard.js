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

    switch (event.key || event.keyCode || event.which)
    {
      case "ArrowUp": this.host.key_arrow_up(); break;
      case "ArrowDown": this.host.key_arrow_down(); break;
      case "ArrowLeft": this.host.key_arrow_left(); break;
      case "ArrowRight": this.host.key_arrow_right(); break;

      case "Escape" || 27:  this.host.key_escape(); break;
      case "Backspace" || 8:  this.host.key_delete(); break;

      // Pattern Mods
      case "]": this.host.key_square_bracket_right(); break;
      case "[": this.host.key_square_bracket_left(); break;
      case "}": this.host.key_curly_bracket_right(); break;
      case "{": this.host.key_curly_bracket_left(); break;

      // Pattern Copy/Paste
      case "c": this.host.key_letter_c(); break;
      case "v": this.host.key_letter_v(); break;

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

    this.host.input(event.keyCode,event.key);

  }
}
