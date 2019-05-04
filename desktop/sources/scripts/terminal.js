'use strict'

const Sequencer = require('./sequencer')
const Commander = require('./commander')

function Terminal () {
  this.sequencer = new Sequencer(this)
  this.commander = new Commander(this)

  this.el = document.createElement('div')
  this.el.id = 'terminal'

  this.install = function (host = document.body) {
    console.info('Terminal', 'Installing..')
    this.sequencer.install(this.el)
    this.commander.install(this.el)
    host.appendChild(this.el)
  }

  this.start = function () {
    console.info('Terminal', 'Starting..')
    this.sequencer.start()
    this.commander.start()
  }
}

module.exports = Terminal
