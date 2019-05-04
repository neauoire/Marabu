'use strict'

function Commander () {
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

  this.update = function () {
    this.el.innerHTML = this.drawCommands()
  }

  this.drawCommands = function () {
    let html = `<div class='name'>CMD</div>`
    for (var i = 0; i < 16; i++) {
      html += `<div class='command empty'>----</div>`
    }
    return html
  }
}

module.exports = Commander
