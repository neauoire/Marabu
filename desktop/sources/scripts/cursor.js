'use strict'

function Cursor (terminal) {
  this.pos = { x: 0, y: 0 }

  this.install = function (host = document.body) {
  }

  this.start = function () {
  }

  this.move = function (x = 0, y = 0) {
    this.pos = { x: clamp(this.pos.x + x, 0, 16), y: clamp(this.pos.y + y, 0, 16) }
    terminal.update()
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor
