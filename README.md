# Marabu

Marabu is a simple open-source music tracker built from Soundbox.

<img src='https://raw.githubusercontent.com/hundredrabbits/Marabu/master/PREVIEW.jpg' width="600"/>

## Controls

### General

- `ctrl space` Play.
- `esc` Stop.

### Sequencer

- `alt ArrowDown` Next Sequence.
- `alt ArrowUp` Previous Sequence.
- `+` Next Pattern.
- `-` Previous Pattern.

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

### Instrument

- `alt ArrowDown` Next Control.
- `alt ArrowUp` Previous Control.
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

## Cheatcode

Press `ctrl k` to activate cheatmode. 

### Insert Multiple

- `4214 enter` This mode awaits 4 numbers, `rate`, `offset`, `increment` and `loop length`, for example `4214 enter` will autofill the current pattern, for the selected instrument, at every 4 bars, with an offset of 2, with an increment in note value of 1, for a loop of length 4. Press `esc` to leave Cheatmode.

### Erase Multiple

- `backspace` To clear a whole column.
- `4 backspace` To clear every 4th bar.
- `42 backspace` To clear every 4th bar, starting at the second bar.

### Modify Multiple

- `401 ctrl+enter` Increment every 4th bar, by 1.

## Themes

You can customize the look of your tracks by editing the .mar file and replacing the attributes' colors.

```theme: { 
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
}```

## TODOs

- Selective play(pattern) `ctrl l`
- Selective play(instrument) `ctrl L`
- Tune instruments with eachother
- Extend track length

## Development

There are currently no means to change the `bpm`, to do so, update the `bpm` value from the exported `.mar` file to an int between 50 and 450.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (CC).
