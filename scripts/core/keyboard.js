function Keyboard()
{
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

    switch (event.key || event.keyCode || event.which) {
      case "Enter": this.key_enter(); break;
      case "ArrowUp": this.key_arrow_up(); break;
      case "ArrowDown": this.key_arrow_down(); break;
      case "ArrowLeft": this.key_arrow_left(); break;
      case "ArrowRight": this.key_arrow_right(); break;
      case ":": this.key_colon(); break;
      case "Escape": this.key_escape(); break;
      case 13:  this.key_enter();  break;
      case 186: if(event.shiftKey){this.key_colon();}  break;
      case 27:  this.key_escape(); break;
      case 219:  this.key_square_bracket_right(); break;
      case 221:  this.key_square_bracket_left(); break;
      case 38:  this.key_arrow_up(); break;
      case 40:  this.key_arrow_down(); break;
      case 8: this.key_delete(); break;

      case "]": this.key_square_bracket_right(); break;
      case "[": this.key_square_bracket_left(); break;
      case "}": this.key_curly_bracket_right(); break;
      case "{": this.key_curly_bracket_left(); break;
      case "c": this.key_letter_c(); break;
      case "v": this.key_letter_v(); break;

    }

    console.log(event)
  };

  // Controls

  this.key_square_bracket_left = function()
  {
    GUI.pattern_octave_down();
  }

  this.key_square_bracket_right = function()
  {
    GUI.pattern_octave_up();    
  }

  this.key_curly_bracket_left = function()
  {
    GUI.pattern_note_down();
  }

  this.key_curly_bracket_right = function()
  {
    GUI.pattern_note_up();    
  }

  this.key_letter_c = function()
  {
    GUI.pattern_copy();   
  }
  this.key_letter_v = function()
  {
    GUI.pattern_paste();   
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
  }

  this.key_delete = function()
  {
  }
}
