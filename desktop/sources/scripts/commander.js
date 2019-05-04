'use strict'

function Commander (terminal) {
  this.el = document.createElement('div')
  this.el.id = 'commander'

  this.install = function (host = document.body) {
    console.info('Commander', 'Installing..')
    host.appendChild(this.el)
  }

  this.start = function () {
    console.info('Commander', 'Starting..')
    this.update()
  }

  this.select = function () {
    terminal.cursor.mode = 1
    this.update()
  }

  this.unselect = function () {
    terminal.cursor.mode = 0
    this.update()
  }

  this.update = function () {
    this.el.innerHTML = this.drawCommands()
  }

  this.inject = function (key) {
    if (key === 'Enter') { this.unselect(); return }
    if (key === 'Backspace') { this.erase(); return }
    const content = terminal.track.getCommand(terminal.cursor.pos.t, terminal.cursor.pos.y)
    terminal.track.setCommand(terminal.cursor.pos.t, terminal.cursor.pos.y, content + key)
    terminal.update()
  }

  this.erase = function () {
    const content = terminal.track.getCommand(terminal.cursor.pos.t, terminal.cursor.pos.y)
    terminal.track.setCommand(terminal.cursor.pos.t, terminal.cursor.pos.y, content.substr(0, content.length - 1))
    terminal.update()
  }

  this.drawCommands = function () {
    let html = `<div class='name'>CMD ${terminal.cursor.speed}</div>`
    for (var i = 0; i < 16; i++) {
      const content = terminal.track.getCommand(terminal.cursor.pos.t, i)
      html += `<div class='command empty ${i === terminal.cursor.pos.y && terminal.cursor.mode === 1 ? 'sel' : ''}'>${content || '-'}</div>`
    }
    return html
  }
}

module.exports = Commander
