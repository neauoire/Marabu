# Marabu

Marabu is a free and open-source music tracker built from [Soundbox](https://github.com/mbitsnbites/soundbox).

<img src='https://raw.githubusercontent.com/hundredrabbits/Marabu/master/PREVIEW.jpg' width="600"/>

## Guide

If this is your first time using a tracker, don't worry this quick introduction will cover the basics of writing a little track, and exporting it to an audio file. 

The interface is divided into 3 columns, the *sequencer*, the *pattern editor* and the *instrument*. By default, the application launches with an active pattern, in the first instrument. There is a maximum of 16 instruments that can play at the same time. 

To move the **pattern cursor**, use the `arrowUp`, and `arrowDown`, keys. Pressing the keyboard keys a,s,d,f,g,h & j will record a note in the first row of the selected row. Pressing the `ArrowDown` and `ArrowUp` keys, will move the *cursor* up/down in the sequencer. Allowing you to fill `pattern #1` with notes. Pressing `space` will play the pattern, pressing `esc` will stop and pressing `del`/`backspace` will erase a note. By default, a new Marabu track has the pattern #1 loaded into the first instrument.

To change the **sequencer patterns**, use the arrow keys while `holding alt`. To add notes to a second instrument, move to the second column and press `alt ArrowRight`, this will set the first row of the second instrument to 1, and allow you to record notes. Press `alt ArrowDown` to move to the second row, and press `alt ArrowRight` again twice, to extend the track to 2 rows, and begin adding notes to the second row of the second instrument.

To change the **instrument controls**, use the arrow keys while `holding shift`. To save your song, press `ctrl s`, to render an audio file(.wav) press `ctrl r`.

## Controls

## default Mode

### File
- New: `CmdOrCtrl+N`
- Open: `CmdOrCtrl+O`
- Save: `CmdOrCtrl+S`
- Save As: `CmdOrCtrl+Shift+S`
- Render: `CmdOrCtrl+R`
- Export Ins: `CmdOrCtrl+I`

### Edit
- Inc BPM: `>`
- Dec BPM: `<`
- Delete: `Backspace`
- Undo: `CmdOrCtrl+Z`
- Redo: `CmdOrCtrl+Shift+Z`

### Track
- Next Inst: `Right`
- Prev Inst: `Left`
- Next Row: `Down`
- Prev Row: `Up`
- Next Track: `CmdOrCtrl+Down`
- Prev Track: `CmdOrCtrl+Up`
- Next Pattern: `CmdOrCtrl+Right`
- Prev Pattern: `CmdOrCtrl+Left`

### Play
- Track: `Space`
- Range: `Enter`
- Stop: `Esc`

### Mode
- Cheatcode: `CmdOrCtrl+K`
- Loop: `CmdOrCtrl+L`
- Arp: `CmdOrCtrl+M`
- Composer: `M`

### Keyboard
- Inc Octave: `X`
- Dec Octave: `Z`
- C: `A`
- C#: `W`
- D: `S`
- D#: `E`
- E: `D`
- F: `F`
- F#: `T`
- G: `G`
- G#: `Y`
- A: `H`
- A#: `U`
- B: `J`
- (Right)C: `Shift+A`
- (Right)C#: `Shift+W`
- (Right)D: `Shift+S`
- (Right)D#: `Shift+E`
- (Right)E: `Shift+D`
- (Right)F: `Shift+F`
- (Right)F#: `Shift+T`
- (Right)G: `Shift+G`
- (Right)G#: `Shift+Y`
- (Right)A: `Shift+H`
- (Right)A#: `Shift+U`
- (Right)B: `Shift+J`

### Instrument
- Next Control: `Shift+Up`
- Prev Control: `Shift+Down`
- Inc Control +10: `Shift+Right`
- Dec Control -10: `Shift+Left`
- Inc Control 1: `}`
- Dec Control -1: `{`
- Inc Control 10(alt): `]`
- Dec Control -10(alt): `[`
- Keyframe: `/`


## cheatcode Mode

### Mode
- Stop: `Esc`
- Copy: `C`
- Paste: `V`
- Erase: `Backspace`

### Effect
- Inc Note +12: `]`
- Dec Note -12: `[`
- Inc Note +1: `}`
- Dec Note -1: `{`

### Selection
- All: `1`
- 2nd: `2`
- 3rd: `3`
- 4th: `4`
- 5th: `5`
- 6th: `6`
- 7th: `7`
- 8th: `8`
- Offset +1: `Right`
- Offset -1: `Left`
- Length +1: `Down`
- Length -1: `Up`

### Keyboard
- C: `A`
- C#: `W`
- D: `S`
- D#: `E`
- E: `D`
- F: `F`
- F#: `T`
- G: `G`
- G#: `Y`
- A: `H`
- A#: `U`
- B: `J`

## loop Mode

### Edit
- Clear: `X`
- Copy: `C`
- Paste: `V`
- Delete: `Backspace`

### Mode
- Play: `Enter`
- Stop: `Esc`
- render: `CmdOrCtrl+R`

### Selection
- Solo: `/`
- 1 Row: `1`
- 2 Rows: `2`
- 3 Rows: `3`
- 4 Rows: `4`
- 5 Rows: `5`
- 6 Rows: `6`
- 7 Rows: `7`
- 8 Rows: `8`

## arp Mode

### Mode
- Pause/Stop: `Esc`

### Keyboard
- C: `A`
- C#: `W`
- D: `S`
- D#: `E`
- E: `D`
- F: `F`
- F#: `T`
- G: `G`
- G#: `Y`
- A: `H`
- A#: `U`
- B: `J`

<img src='https://cdn.rawgit.com/hundredrabbits/Marabu/master/LAYOUT.svg?v=1' width="600"/>

## Extras

- Download additional [themes](https://github.com/hundredrabbits/Themes).
- Support this project through [Patreon](https://patreon.com/100).
- See the [License](LICENSE.md) file for license rights and limitations (MIT).
