# Marabu

Marabu is a web based music tracker(sequencer) tool, based on soundbox, under development. It needs to run through localhost, it only works on Chrome. The repository comes with a script that fires Marabu from within Localhost:8033.

```
cd Marabu
python -m SimpleHTTPServer 8033
http://localhost:8033/
```

## Active Task
- Exporting instrument files
- Loading instrument files
- Input fields for slider values

## Saving/Loading
Press .binary to create a binary file of your project, drag it on the project to load.

## Shortcuts
### Sequencer
```
#
```

### Pattern
```
] Selection Octave Up
[ Selection Octave Down
} Selection Note Up
{ Selection Note Down
c Selection copy
v Selection paste
  Play
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