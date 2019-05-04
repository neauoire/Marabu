'use strict'

function Track (terminal) {
  this.data = []

  this.new = function () {
    this.clear()
  }

  this.get = function (channel, loop) {
    return this.data[channel].loops[loop]
  }

  this.set = function (channel, loop, val) {
    this.data[channel].loops[loop] = clamp(val, 0, 15)
  }

  this.write = function (channel, loop, cell, val) {
    if (this.data[channel] === null) { console.warn(`Unknown channel ${channel}`); return }
    if (this.data[channel].tracks[loop] === null) { console.warn(`Unknown loop ${loop}`); return }
    if (this.data[channel].tracks[loop][cell] === null) { console.warn(`Unknown cell ${cell}`); return }
    console.log('Track', `${channel}/${loop} ${cell} -> ${val}`)
    this.data[channel].tracks[loop][cell] = val
  }

  this.read = function (channel, loop, cell) {
    if (this.data[channel] === null) { console.warn(`Unknown channel ${channel}`); return }
    if (this.data[channel].tracks[loop] === null) { console.warn(`Unknown loop ${loop}`); return }
    if (this.data[channel].tracks[loop][cell] === null) { console.warn(`Unknown cell ${cell}`); return }
    return this.data[channel].tracks[loop][cell]
  }

  this.clear = function () {
    const channels = []
    for (let c = 0; c < 16; c++) {
      channels[c] = { loops: [], tracks: [] }
      for (let t = 0; t < 16; t++) {
        channels[c].loops.push(0)
        channels[c].tracks.push(['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''])
      }
    }
    this.data = channels
  }

  this.stack = function () {
    const a = []
    for (const channel in this.data) {
      const loop = this.get(channel, terminal.cursor.pos.t)
      const data = this.read(channel, loop, terminal.cursor.pos.y)
      const octave = data.substr(0, 1)
      const note = data.substr(1, 1)
      a.push(`${channel}${octave}${note}`)
    }
    return a
  }

  function clamp (v, min, max) { return v < min ? min : v > max ? max : v }
}

module.exports = Track
