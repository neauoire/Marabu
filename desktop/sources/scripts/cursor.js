'use strict'

function Cursor (terminal) {
  this.mode = 0
  this.pos = { x: 0, y: 0, t: 0 }
  this.octave = 3

  this.install = function (host = document.body) {
  }

  this.start = function () {
  }

  this.move = function (x = 0, y = 0, track = 0) {
    if (track !== 0) {
      this.pos.t += track
    }
    // Change track
    else if (this.pos.y === 15 && y > 0) {
      this.pos.y = 0
      this.pos.t += 1
    } else if (this.pos.y === 0 && y < 0 && this.pos.t >= 1) {
      this.pos.y = 15
      this.pos.t += -1
    } else {
      this.pos.x += x
      this.pos.y += y
    }

    this.pos = { x: clamp(this.pos.x, 0, 15), y: clamp(this.pos.y, 0, 15), t: clamp(this.pos.t, 0, 15) }
    terminal.update()
  }

  this.inject = function (note, octave = this.octave) {
    terminal.track.write(this.pos.x, 0, this.pos.y, `${octave}${note}`)
    terminal.update()
  }

  this.octaveMod = function (mod) {
    this.octave = clamp(this.octave + mod, 0, 8)
  }

  this.loopMod = function (mod) {
    const loop = terminal.track.get(this.pos.x, this.pos.x)
    terminal.track.set(this.pos.x, this.pos.y, loop + mod)
    terminal.update()
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor
