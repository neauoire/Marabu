'use strict'

function Track (terminal) {
  this.data = []

  this.new = function () {
    this.clear()
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
    if (this.data[channel].tracks[loop][cell] === null) { console.warn(`Unknown cell ${cell}`,this.data[channel].tracks[loop][cell]); return }
    return this.data[channel].tracks[loop][cell]
  }

  this.clear = function () {
    const channels = []
    for (let c = 0; c < 16; c++) {
      channels[c] = { loops: [], tracks: [] }
      for (let t = 0; t < 16; t++) {
        channels[c].loops.push(0)
        channels[c].tracks.push(['','','','','','','','','','','','','','','',''])
      }
    }
    this.data = channels
  }
}

module.exports = Track
