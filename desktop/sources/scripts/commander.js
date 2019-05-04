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

  this.update = function () {
    this.el.innerHTML = this.drawCommands()
  }

  this.drawCommands = function () {
    let html = `<div class='name'>CMD</div>`
    for (var i = 0; i < 16; i++) {
      html += `<div class='command empty ${i === terminal.cursor.pos.y && terminal.cursor.mode === 1 ? 'sel' : ''}'>----</div>`
    }
    return html
  }
}

module.exports = Commander
