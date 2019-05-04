'use strict'

const Cursor = require('./cursor')
const Sequencer = require('./sequencer')
const Commander = require('./commander')

function Terminal () {
  this.cursor = new Cursor(this)
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

  this.update = function () {
    this.sequencer.update()
    this.commander.update()
  }

  // Controls

  this.onArrowUp = function (mod = false, skip = false, drag = false) {
    const leap = skip ? 2 : 1
    this.cursor.move(0, -leap)
  }

  this.onArrowDown = function (mod = false, skip = false, drag = false) {
    const leap = skip ? 2 : 1
    this.cursor.move(0, leap)
  }

  this.onArrowLeft = function (mod = false, skip = false, drag = false) {
    const leap = skip ? 2 : 1
    this.cursor.move(-leap, 0)
  }

  this.onArrowRight = function (mod = false, skip = false, drag = false) {
    const leap = skip ? 2 : 1
    this.cursor.move(leap, 0)
  }

  this.onKeyDown = function (event) {
    if (event.keyCode === 38) { this.onArrowUp(event.shiftKey, (event.metaKey || event.ctrlKey), event.altKey); return }
    if (event.keyCode === 40) { this.onArrowDown(event.shiftKey, (event.metaKey || event.ctrlKey), event.altKey); return }
    if (event.keyCode === 37) { this.onArrowLeft(event.shiftKey, (event.metaKey || event.ctrlKey), event.altKey); return }
    if (event.keyCode === 39) { this.onArrowRight(event.shiftKey, (event.metaKey || event.ctrlKey), event.altKey) }
  }

  document.onkeydown = (event) => { this.onKeyDown(event) }
}

module.exports = Terminal
