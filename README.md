## Electronic Synthesizer -- Start of Minimoog VST 
### made with webaudio API for Barnard COMS 3430, Computational Sound with Prof Mark Santolucito. 


With each click of a key, a new note is produced and the color of the text changes to the next in order. Once one extreme
is reached the colors reverse direction and continue back the way the came--click multiple notes at once and you will jump
forward multiple colors.

There are 3 main oscillators, all of whom can have their waveforms changed independently. The first one's frequency is linked to the key playing,
whereas the other 2 oscillators have variable frequency.

There is a consistent ADSR envelope for all oscillators, but that envelope is shaped by user input characteristics--based on those available on the
original minimoog from the 70s.

A fourth oscillator, LFO, is always implemented for each notes, but the waveform is toggleable in corespondance with the minimoog, and the frequency
can range from 0 to 20Hz as input by the user.

This project builds on (my digital keyboard)[https://github.com/miiklee/comp-sound-keyboard]
