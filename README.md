# Marabu

Marabu is a web based music tracker(sequencer) tool, based on soundbox, under development. It needs to run through localhost, it only works on Chrome. The repository comes with a script that fires Marabu from within Localhost:8033.

```
cd Marabu
python -m SimpleHTTPServer 8033
http://localhost:8033/
```

## Save/Loading Instruments
Press .instrument and save the content of the file into a .instrument file. You can drag the file on the window to load that instrument.

## Saving/Loading Projects
Press .binary to create a binary file of your project, drag it on the project to load.

## Shortcuts
Pressing `escape` will leave the edit mode. Pressing `space` will play the active pattern.

### Pattern
```
] Selection Octave Up
[ Selection Octave Down
} Selection Note Up
{ Selection Note Down
c Selection copy
v Selection paste
```

### Keyboard
```
a Note C
s Note D
d Note E
f Note F
g Note G
h Note A
j Note B
w Note C#
e Note D#
t Note F#
y Note G#
u Note A#
z Octave Down
x Octave Up
```