# Marabu

Marabu is a simple open-source music tracker built from Soundbox.

<img src='https://raw.githubusercontent.com/hundredrabbits/Marabu/master/PREVIEW.jpg' width="600"/>

## Controls

### General

- `space` Play.
- `esc` Stop.
- `ctrl shift del` Reset.

- `ctrl n` New.
- `ctrl s` Save.
- `ctrl S` Save as.
- `ctrl o` Open.
- `ctrl i` Export instrument.
- `ctrl t` Export theme.

### Sequencer

- `alt ArrowDown` Next Sequence.
- `alt ArrowUp` Previous Sequence.
- `+` Next Pattern.
- `-` Previous Pattern.

#### Loop(Special)

- `ctrl l` Loopmode, see below.

### Editor

- `ArrowRight` Next Instrument.
- `ArrowLeft` Previous Instrument.
- `ArrowDown` Next Row.
- `ArrowUp` Previous Row.
- `/` Add a Control Keyframe.
- `Backspace` Erase Note in Row.
- `)` Increment Note Value +12.
- `(` Decrement Note Value -12.
- `0` Increment Note Value +1.
- `9` Decrement Note Value -1.

#### Editor(Special)

- `ctrl k` Cheatmode, see below.

### Instrument

- `shift ArrowDown` Next Control.
- `shift ArrowUp` Previous Control.
- `]` Increment Control Value +10.
- `[` Decrement Control Value -10.
- `}` Increment Control Value +1.
- `{` Decrement Control Value -1.
- `x` Next Octave.
- `z` Previous Octave.

### Keyboard

Hold `shift`, while pressing a note, to make chords.

- `a` Play/Record C.
- `s` Play/Record D.
- `d` Play/Record E.
- `f` Play/Record F.
- `g` Play/Record G.
- `h` Play/Record A.
- `j` Play/Record B.
- `w` Play/Record C#.
- `e` Play/Record D#.
- `t` Play/Record F#.
- `y` Play/Record G#.
- `u` Play/Record A#.

## Cheatmode

Press `ctrl k` to activate cheatmode. Press `esc` to exit cheatmode.

### Selection

The cheatmode will catch 3 keys, corresponding to int/hex of `rate`, `length` & `offset` of the selection. The `/` key indicates that it does not loop through the whole pattern.

- `4` Every 4th note.
- `42` Every 4th note, and the following one.
- `422` Every 4th note, and the following one, starting from the second.
- `/` Only the first note.
- `/ 44` Only the 5th, 6th, 7th and 8th first notes.

### Copy/Paste

- `c` To copy the entire pattern.
- `v` To paste copied notes.
- `4 c` To copy every 4th note.
- `4 c` To copy every 4th note.

### Insert Multiple

- `8 as` This will add C5 and D5 to the 1st and 9th note.

### Erase Multiple

- `backspace` To clear a whole column.
- `4 backspace` To clear every 4th bar.
- `42 backspace` To clear every 4th bar, starting at the second bar.

### Modify Multiple

- `+` Increment each note of the pattern.
- `-` Decrement each note of the pattern.

### Use case

To copy the first 16 bars, into the 16 following bars and play the following note.

- `/ F c` Copy the first 16 bars.
- `/ F F v` Paste the first 16 bars from the the 16th bar.

## Loopmode

Press `ctrl l` to activate loopmode. 

- `enter` Will loop current active pattern(only active instrument).
- `00f enter` Will loop current active track(all instruments).
- `2244 enter` Will loop instrument 2 to 4, from track 2 to 4.

## Themes

You can customize the look of your tracks by editing the .mar file and replacing the attributes' colors.

```
theme: { 
  background:"#fff", 
  f_high:"#f00", 
  f_med:"#0f0", 
  f_low:"#00f", 
  f_inv:"#00f", 
  f_special:"#00f", 
  b_high:"#ff0", 
  b_med:"#f0f",
  b_low:"#0ff",
  b_inv:"#00f", 
  b_special:"#00f", 
}
```

## TODOs

- Selective play(pattern) `ctrl l`
- Selective play(instrument) `ctrl L`

## Development

There are currently no means to change the `bpm`, to do so, update the `bpm` value from the exported `.mar` file to an int between 50 and 450. Use `npm start` to develop locally.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (CC).
