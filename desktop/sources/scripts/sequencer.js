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
    for (var i = 0; i < 16; i++) {
      html += `<div class='channel ${i === terminal.cursor.pos.x ? 'selected' : ''}'>${i.toString(16).toUpperCase()}${this.drawNotes()}</div>`
    }
    return html
  }

  this.drawNotes = function () {
    let html = ''
    for (var i = 0; i < 16; i++) {
      html += `<span class='note ${i === terminal.cursor.pos.y ? 'selected' : ''}'>0--</span>`
    }
    return html
  }
}

module.exports = Sequencer
