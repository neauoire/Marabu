'use strict'

function Cursor (terminal) {
  this.track = 0
  this.pos = { x: 0, y: 0 }

  this.install = function (host = document.body) {
  }

  this.start = function () {
  }

  this.move = function (x = 0, y = 0) {
    // Change track
    if(this.pos.y === 15 && y > 0){
      this.pos = { x: this.pos.x, y: 0 }  
      this.track = clamp(this.track + 1,0,15)
    }
    else if(this.pos.y === 0 && y < 0 && this.track >= 1){
      this.pos = { x: this.pos.x, y: 15 }  
      this.track = clamp(this.track - 1,0,15)
    }
    else{
      this.pos = { x: clamp(this.pos.x + x, 0, 15), y: clamp(this.pos.y + y, 0, 15) }  
    }
    terminal.update()
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor
