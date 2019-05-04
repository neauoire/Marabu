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
      const isSelected = channel === terminal.cursor.pos.x
      html += `<div class='channel ${isSelected ? 'selected' : ''}'><span class='name'>${isSelected ? '@' : channel.toString(16).toUpperCase()}</span>${this.drawNotes(channel)}</div>`
    }
    return html
  }

  this.drawNotes = function (channel) {
    let html = ''
    for (var cell = 0; cell < 16; cell++) {
      const loop = 0
      const note = terminal.track.read(channel, loop, cell)
      const isEmpty = !note
      const isSelected = cell === terminal.cursor.pos.y && channel === terminal.cursor.pos.x
      const content = isEmpty && isSelected ? '>-' : note || ((cell % 4 === 0) ? '--' : '..')
      html += `<span class='note ${!note ? 'empty' : ''} ${cell === terminal.cursor.pos.y ? 'selected' : ''}'><span class='track ${cell === terminal.cursor.pos.t ? 'selected' : ''}'>${loop}</span>${content}</span>`
    }
    return html
  }
}

module.exports = Sequencer
