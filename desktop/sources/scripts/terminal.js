'use strict'

const Cursor = require('./cursor')
const Track = require('./track')
const Sequencer = require('./sequencer')
const Commander = require('./commander')
const Udp = require('./lib/udp')
const Controller = require('./lib/controller')

function Terminal () {
  this.cursor = new Cursor(this)
  this.sequencer = new Sequencer(this)
  this.commander = new Commander(this)
  this.track = new Track(this)
  this.udp = new Udp(this)
  this.controller = new Controller()

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
    this.track.new()

    this.sequencer.start()
    this.commander.start()

    this.udp.start()
  }

  this.update = function () {
    this.sequencer.update()
    this.commander.update()
  }

  // Controls

  this.onArrowUp = function (mod = false, skip = false, drag = false) {
    if (skip === true) {
      this.cursor.move(0, 0, -1)
    } else {
      this.cursor.move(0, -1)
    }
    this.cursor.stop()
  }

  this.onArrowDown = function (mod = false, skip = false, drag = false) {
    if (skip === true) {
      this.cursor.move(0, 0, 1)
    } else {
      this.cursor.move(0, 1)
    }
    this.cursor.stop()
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
    if (event.keyCode === 39) { this.onArrowRight(event.shiftKey, (event.metaKey || event.ctrlKey), event.altKey); return }

    // Write mode
    if (this.cursor.mode === 0) {
      if (event.keyCode === 65) { this.cursor.inject('C') }
      if (event.keyCode === 83) { this.cursor.inject('D') }
      if (event.keyCode === 68) { this.cursor.inject('E') }
      if (event.keyCode === 70) { this.cursor.inject('F') }
      if (event.keyCode === 71) { this.cursor.inject('G') }
      if (event.keyCode === 72) { this.cursor.inject('A') }
      if (event.keyCode === 74) { this.cursor.inject('B') }

      if (event.keyCode === 87) { this.cursor.inject('c') }
      if (event.keyCode === 69) { this.cursor.inject('d') }
      if (event.keyCode === 84) { this.cursor.inject('f') }
      if (event.keyCode === 89) { this.cursor.inject('g') }
      if (event.keyCode === 85) { this.cursor.inject('a') }

      if (event.keyCode === 88) { this.cursor.octaveMod(1) }
      if (event.keyCode === 90) { this.cursor.octaveMod(-1) }

      if (event.keyCode === 221) { this.cursor.loopMod(1) }
      if (event.keyCode === 219) { this.cursor.loopMod(-1) }

      if (event.keyCode === 27) { this.cursor.reset(); this.cursor.stop() }
      if (event.keyCode === 8) { this.cursor.erase() }
    }

    if (event.keyCode === 32) { this.cursor.togglePlay() }
    // console.log(event.keyCode)
  }

  document.onkeydown = (event) => { this.onKeyDown(event) }
}

module.exports = Terminal
