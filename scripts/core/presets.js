/* -*- mode: javascript; tab-width: 2; indent-tabs-mode: nil; -*-
*
* Copyright (c) 2011-2013 Marcus Geelnard
*
* This file is part of SoundBox.
*
* SoundBox is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* SoundBox is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with SoundBox.  If not, see <http://www.gnu.org/licenses/>.
*
*/

// Instrument presets
gInstrumentPresets = [
  {
    name: "> Leads"
  },
  {
    name: "Softy",
    i: [
          2, // OSC1_WAVEFORM
          100, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          3, // OSC2_WAVEFORM
          201, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          5, // ENV_ATTACK
          6, // ENV_SUSTAIN
          58, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          195, // LFO_AMT
          6, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          135, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          147, // FX_PAN_AMT
          6, // FX_PAN_FREQ
          121, // FX_DELAY_AMT
          6 // FX_DELAY_TIME    
  ]
  },
  {
    name: "Classic 8-bit",
    i: [
          1, // OSC1_WAVEFORM
          192, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          1, // OSC2_WAVEFORM
          191, // OSC2_VOL
          116, // OSC2_SEMI
          9, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          6, // ENV_ATTACK
          22, // ENV_SUSTAIN
          34, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          69, // LFO_AMT
          3, // LFO_FREQ
          1, // LFO_FX_FREQ
          1, // FX_FILTER
          23, // FX_FREQ
          167, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          77, // FX_PAN_AMT
          6, // FX_PAN_FREQ
          25, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "Square",
    i: [
          1, // OSC1_WAVEFORM
          255, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          1, // OSC2_WAVEFORM
          154, // OSC2_VOL
          128, // OSC2_SEMI
          9, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          7, // ENV_ATTACK
          5, // ENV_SUSTAIN
          52, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          255, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          47, // FX_PAN_AMT
          3, // FX_PAN_FREQ
          146, // FX_DELAY_AMT
          2 // FX_DELAY_TIME
    ]
  },
  {
    name: "Bell",
    i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          152, // OSC1_SEMI
          0, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          152, // OSC2_SEMI
          12, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          2, // ENV_ATTACK
          0, // ENV_SUSTAIN
          60, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          255, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          47, // FX_PAN_AMT
          3, // FX_PAN_FREQ
          157, // FX_DELAY_AMT
          2 // FX_DELAY_TIME
    ]
  },
  {
    name: "Filter Bass 1",
    i: [
          2, // OSC1_WAVEFORM
          100, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          3, // OSC2_WAVEFORM
          201, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          0, // ENV_ATTACK
          6, // ENV_SUSTAIN
          29, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          195, // LFO_AMT
          4, // LFO_FREQ
          1, // LFO_FX_FREQ
          3, // FX_FILTER
          50, // FX_FREQ
          184, // FX_RESONANCE
          119, // FX_DIST
          244, // FX_DRIVE
          147, // FX_PAN_AMT
          6, // FX_PAN_FREQ
          84, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "> Pads"
  },
  {
    name: "Base string",
    i: [
          2, // OSC1_WAVEFORM
          192, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          2, // OSC2_WAVEFORM
          192, // OSC2_VOL
          140, // OSC2_SEMI
          18, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          158, // ENV_ATTACK
          119, // ENV_SUSTAIN
          158, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          5, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          0, // FX_PAN_AMT
          0, // FX_PAN_FREQ
          24, // FX_DELAY_AMT
          8 // FX_DELAY_TIME
    ]
  },
  {
    name: "Base string (dist)",
    i: [
          2, // OSC1_WAVEFORM
          192, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          2, // OSC2_WAVEFORM
          192, // OSC2_VOL
          140, // OSC2_SEMI
          18, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          107, // ENV_ATTACK
          115, // ENV_SUSTAIN
          138, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          136, // LFO_AMT
          5, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          8, // FX_FREQ
          92, // FX_RESONANCE
          21, // FX_DIST
          32, // FX_DRIVE
          148, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          85, // FX_DELAY_AMT
          8 // FX_DELAY_TIME
    ]
  },
  {
    name: "Evil brass",
    i: [
          3, // OSC1_WAVEFORM
          146, // OSC1_VOL
          140, // OSC1_SEMI
          0, // OSC1_XENV
          1, // OSC2_WAVEFORM
          224, // OSC2_VOL
          128, // OSC2_SEMI
          3, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          92, // ENV_ATTACK
          0, // ENV_SUSTAIN
          95, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          3, // LFO_WAVEFORM
          179, // LFO_AMT
          5, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          124, // FX_FREQ
          135, // FX_RESONANCE
          11, // FX_DIST
          32, // FX_DRIVE
          150, // FX_PAN_AMT
          3, // FX_PAN_FREQ
          157, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "> Drums"
  },
  {
    name: "Bass drum 1",
    i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          116, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          116, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          0, // NOISE_VOL
          4, // ENV_ATTACK
          6, // ENV_SUSTAIN
          35, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          14, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          0, // FX_PAN_AMT
          0, // FX_PAN_FREQ
          0, // FX_DELAY_AMT
          0 // FX_DELAY_TIME
    ]
  },
  {
    name: "Bass drum 2",
    i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          117, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          110, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          0, // NOISE_VOL
          4, // ENV_ATTACK
          6, // ENV_SUSTAIN
          35, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          14, // FX_FREQ
          0, // FX_RESONANCE
          1, // FX_DIST
          39, // FX_DRIVE
          76, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          0, // FX_DELAY_AMT
          0 // FX_DELAY_TIME
    ]
  },
  {
    name: "Bass drum 3",
    i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          116, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          116, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          14, // NOISE_VOL
          4, // ENV_ATTACK
          6, // ENV_SUSTAIN
          45, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          136, // FX_FREQ
          15, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          0, // FX_PAN_AMT
          0, // FX_PAN_FREQ
          66, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "Base tom",
    i: [
          0, // OSC1_WAVEFORM
          192, // OSC1_VOL
          104, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          80, // OSC2_VOL
          99, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          0, // NOISE_VOL
          4, // ENV_ATTACK
          0, // ENV_SUSTAIN
          66, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          3, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          1, // FX_FILTER
          0, // FX_FREQ
          1, // FX_RESONANCE
          2, // FX_DIST
          32, // FX_DRIVE
          37, // FX_PAN_AMT
          4, // FX_PAN_FREQ
          0, // FX_DELAY_AMT
          0 // FX_DELAY_TIME
    ]
  },
  {
    name: "Snare 1",
    i: [
          0, // OSC1_WAVEFORM
          160, // OSC1_VOL
          128, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          160, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          210, // NOISE_VOL
          4, // ENV_ATTACK
          7, // ENV_SUSTAIN
          41, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          60, // LFO_AMT
          4, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          255, // FX_FREQ
          0, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          61, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          32, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "Snare 2",
    i: [
          0, // OSC1_WAVEFORM
          221, // OSC1_VOL
          128, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          210, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          255, // NOISE_VOL
          4, // ENV_ATTACK
          6, // ENV_SUSTAIN
          62, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          64, // LFO_AMT
          7, // LFO_FREQ
          1, // LFO_FX_FREQ
          3, // FX_FILTER
          255, // FX_FREQ
          15, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          20, // FX_PAN_AMT
          0, // FX_PAN_FREQ
          24, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "Snare 3",
    i: [
          3, // OSC1_WAVEFORM
          0, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          3, // OSC2_WAVEFORM
          68, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          218, // NOISE_VOL
          4, // ENV_ATTACK
          4, // ENV_SUSTAIN
          40, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          1, // LFO_WAVEFORM
          55, // LFO_AMT
          4, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          67, // FX_FREQ
          115, // FX_RESONANCE
          124, // FX_DIST
          190, // FX_DRIVE
          67, // FX_PAN_AMT
          6, // FX_PAN_FREQ
          39, // FX_DELAY_AMT
          1 // FX_DELAY_TIME
    ]
  },
  {
    name: "Hihat 1",
    i: [
          0, // OSC1_WAVEFORM
          0, // OSC1_VOL
          140, // OSC1_SEMI
          0, // OSC1_XENV
          0, // OSC2_WAVEFORM
          0, // OSC2_VOL
          140, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          60, // NOISE_VOL
          4, // ENV_ATTACK
          10, // ENV_SUSTAIN
          34, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          187, // LFO_AMT
          5, // LFO_FREQ
          0, // LFO_FX_FREQ
          1, // FX_FILTER
          239, // FX_FREQ
          135, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          108, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          16, // FX_DELAY_AMT
          4 // FX_DELAY_TIME
    ]
  },
  {
    name: "Hihat 2",
    i: [
          2, // OSC1_WAVEFORM
          40, // OSC1_VOL
          140, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          0, // OSC2_VOL
          140, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          255, // NOISE_VOL
          5, // ENV_ATTACK
          0, // ENV_SUSTAIN
          48, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          3, // FX_FILTER
          161, // FX_FREQ
          192, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          0, // FX_PAN_AMT
          0, // FX_PAN_FREQ
          71, // FX_DELAY_AMT
          1 // FX_DELAY_TIME
    ]
  },
  {
    name: "Open hihat",
    i: [
          0, // OSC1_WAVEFORM
          0, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          0, // OSC2_WAVEFORM
          0, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          125, // NOISE_VOL
          0, // ENV_ATTACK
          1, // ENV_SUSTAIN
          59, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          1, // FX_FILTER
          193, // FX_FREQ
          171, // FX_RESONANCE
          0, // FX_DIST
          29, // FX_DRIVE
          39, // FX_PAN_AMT
          3, // FX_PAN_FREQ
          88, // FX_DELAY_AMT
          3 // FX_DELAY_TIME
    ]
  },
  {
    name: "Smash",
    i: [
          0, // OSC1_WAVEFORM
          214, // OSC1_VOL
          104, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          204, // OSC2_VOL
          104, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          229, // NOISE_VOL
          4, // ENV_ATTACK
          40, // ENV_SUSTAIN
          21, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          231, // LFO_AMT
          6, // LFO_FREQ
          1, // LFO_FX_FREQ
          3, // FX_FILTER
          183, // FX_FREQ
          15, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          232, // FX_PAN_AMT
          4, // FX_PAN_FREQ
          74, // FX_DELAY_AMT
          6 // FX_DELAY_TIME
    ]
  },
  {
    name: "Pipe hit",
    i: [
          3, // OSC1_WAVEFORM
          255, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          140, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          127, // NOISE_VOL
          2, // ENV_ATTACK
          2, // ENV_SUSTAIN
          23, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          96, // LFO_AMT
          3, // LFO_FREQ
          1, // LFO_FX_FREQ
          3, // FX_FILTER
          94, // FX_FREQ
          79, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          84, // FX_PAN_AMT
          2, // FX_PAN_FREQ
          12, // FX_DELAY_AMT
          4 // FX_DELAY_TIME
    ]
  },
  {
    name: "> Effects"
  },
  {
    name: "Wind",
    i: [
          0, // OSC1_WAVEFORM
          0, // OSC1_VOL
          140, // OSC1_SEMI
          0, // OSC1_XENV
          0, // OSC2_WAVEFORM
          0, // OSC2_VOL
          140, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          255, // NOISE_VOL
          158, // ENV_ATTACK
          158, // ENV_SUSTAIN
          158, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          51, // LFO_AMT
          2, // LFO_FREQ
          1, // LFO_FX_FREQ
          2, // FX_FILTER
          58, // FX_FREQ
          239, // FX_RESONANCE
          0, // FX_DIST
          32, // FX_DRIVE
          88, // FX_PAN_AMT
          1, // FX_PAN_FREQ
          157, // FX_DELAY_AMT
          2 // FX_DELAY_TIME
    ]
  },
  {
    name: "Long beat",
    i: [
          0, // OSC1_WAVEFORM
          255, // OSC1_VOL
          106, // OSC1_SEMI
          1, // OSC1_XENV
          0, // OSC2_WAVEFORM
          255, // OSC2_VOL
          106, // OSC2_SEMI
          0, // OSC2_DETUNE
          1, // OSC2_XENV
          0, // NOISE_VOL
          5, // ENV_ATTACK
          7, // ENV_SUSTAIN
          164, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          0, // LFO_WAVEFORM
          0, // LFO_AMT
          0, // LFO_FREQ
          0, // LFO_FX_FREQ
          2, // FX_FILTER
          255, // FX_FREQ
          0, // FX_RESONANCE
          2, // FX_DIST
          32, // FX_DRIVE
          83, // FX_PAN_AMT
          5, // FX_PAN_FREQ
          25, // FX_DELAY_AMT
          1 // FX_DELAY_TIME
    ]
  },
  {
    name: "Siren",
    i: [
          1, // OSC1_WAVEFORM
          0, // OSC1_VOL
          128, // OSC1_SEMI
          0, // OSC1_XENV
          1, // OSC2_WAVEFORM
          0, // OSC2_VOL
          128, // OSC2_SEMI
          0, // OSC2_DETUNE
          0, // OSC2_XENV
          255, // NOISE_VOL
          158, // ENV_ATTACK
          100, // ENV_SUSTAIN
          158, // ENV_RELEASE
          0, // ARP_CHORD
          0, // ARP_SPEED
          3, // LFO_WAVEFORM
          67, // LFO_AMT
          4, // LFO_FREQ
          1, // LFO_FX_FREQ
          3, // FX_FILTER
          57, // FX_FREQ
          254, // FX_RESONANCE
          85, // FX_DIST
          171, // FX_DRIVE
          88, // FX_PAN_AMT
          1, // FX_PAN_FREQ
          157, // FX_DELAY_AMT
          2 // FX_DELAY_TIME
    ]
  }
];

