# Marabu

Marabu is a simple open-source music tracker built from Soundbox.

<img src='https://raw.githubusercontent.com/hundredrabbits/Marabu/master/PREVIEW.jpg' width="600"/>

### Controls

#### General

- `ctrl space` Play.
- `esc` Stop.

#### Sequencer

- `alt ArrowDown` Next Sequence.
- `alt ArrowUp` Previous Sequence.
- `+` Next Pattern.
- `-` Previous Pattern.

#### Editor

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

#### Instrument

- `]` Increment Control Value +10.
- `[` Decrement Control Value -10.
- `}` Increment Control Value +1.
- `{` Decrement Control Value -1.
- `x` Next Octave.
- `z` Previous Octave.
- `2` Next Control.
- `1` Previous Control.

#### Keyboard

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

#### Cheatcodes

Press `ctrl k` to activate cheatmode. This mode awaits 4 numbers, for example `ctrl k(4214)` will autofill the current pattern, for the selected instrument, at every 4 bars, with an offset of 2, with an increment in note value of 1, for a loop of length 4.

- `rate`
- `offset`
- `increment`
- `loop length`

### Development

There are currently no means to change the `bpm`, to do so, update the `bpm` value from the exported `.mar` file to an int between 50 and 450.

## License

See the [LICENSE](LICENSE.md) file for license rights and limitations (CC).
