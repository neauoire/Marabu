'use strict'

function Track (terminal) {
  this.tracks = []

  this.new = function () {
    this.clear()
  }

  this.write = function (channel, loop, note, val) {
    console.log('Track', `${channel}/${loop} ${note} -> ${val}`)
  }

  this.read = function (x, y, t) {

  }

  this.clear = function () {
    const channel = []
    for (var c = 0; c < 16; c++) {
      const loop = []
      for (var l = 0; l < 16; l++) {
        loop.push('')
      }
      channel.push(loop)
    }
    this.track = channel
  }
}

module.exports = Track
