'use strict'

function Sequencer (terminal) {
  this.el = document.createElement('div')
  this.el.id = 'sequencer'

  this.install = function (host = document.body) {
    console.info('Sequencer', 'Installing..')
    host.appendChild(this.el)
  }

  this.start = function () {
    console.info('Sequencer', 'Starting..')
    this.update()
  }

  this.update = function () {
    this.el.innerHTML = this.drawChannels()
  }

  this.drawChannels = function () {
    let html = ''
    for (var channel = 0; channel < 16; channel++) {
      html += `<div class='channel ${channel === terminal.cursor.pos.x ? 'selected' : ''}'>${channel.toString(16).toUpperCase()}${this.drawNotes(channel)}</div>`
    }
    return html
  }

  this.drawNotes = function (channel) {
    let html = ''
    for (var cell = 0; cell < 16; cell++) {
      const loop = 0
      const note = terminal.track.read(channel, loop, cell)
      html += `<span class='note ${cell === terminal.cursor.pos.y ? 'selected' : ''}'><span class='track ${cell === terminal.cursor.pos.t ? 'selected' : ''}'>${loop}</span>${note ? note : cell % 4 === 0 ? '--' : '..'}</span>`
    }
    return html
  }
}

module.exports = Sequencer
