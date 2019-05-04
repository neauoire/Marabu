'use strict'

function Cursor (terminal) {
  this.mode = 0
  this.pos = { x: 0, y: 0, t: 0 }
  this.octave = 3

  this.isPlaying = false
  this.timer = null
  this.speed = 120

  this.install = function (host = document.body) {
  }

  this.start = function () {
  }

  this.reset = function () {
    if (this.mode !== 0) { this.mode = 0 } else if (this.pos.y === 0) { this.pos.t = 0 } else { this.pos.y = 0 }
    this.mode = 0
    terminal.update()
  }

  this.goto = function (x = this.pos.x, y = this.pos.y) {
    this.pos = { x: clamp(x, 0, 15), y: clamp(y, 0, 15), t: clamp(this.pos.t, 0, 15) }
  }

  this.inject = function (note, octave = this.octave) {
    terminal.track.write(this.pos.x, this.getLoop(), this.pos.y, `${octave}${note}`)
    terminal.update()
  }

  this.erase = function () {
    terminal.track.write(this.pos.x, 0, this.pos.y, '')
    terminal.update()
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

  // Playing

  this.togglePlay = function () {
    if (this.isPlaying === true) {
      this.stop()
    } else {
      this.play()
    }
  }

  this.play = function () {
    this.isPlaying = true
    this.setTimer(this.speed)
    terminal.udp.play(`bpm${this.speed}`)
  }

  this.stop = function () {
    this.isPlaying = false
    this.clearTimer()
    terminal.update()
  }

  this.run = function () {
    terminal.udp.clear()
    terminal.udp.stack = terminal.track.stack()
    terminal.udp.run()
    this.move(0, 1)
  }

  // Timers

  this.clearTimer = function () {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }

  this.setTimer = function (bpm) {
    console.log('Clock', `Setting new ${bpm} timer..`)
    this.clearTimer()
    this.timer = setInterval(() => { this.run() }, (60000 / bpm) / 4)
  }

  // tools

  this.octaveMod = function (mod) {
    this.octave = clamp(this.octave + mod, 0, 8)
  }

  this.getLoop = function () {
    return terminal.track.getLoop(this.pos.x, this.pos.t)
  }

  this.loopMod = function (mod) {
    this.pos.y = this.pos.t
    terminal.track.setLoop(this.pos.x, this.pos.y, terminal.track.getLoop(this.pos.x, this.pos.y) + mod)
    terminal.update()
  }

  this.speedMod = function (mod) {
    this.speed += mod
    terminal.update()
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Cursor
