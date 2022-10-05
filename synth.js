
/*
osc frequency of 0.1 to 20 kHz
osc stability >25%
LFO rate 0.05Hz to 200Hz
LFO waveform of triangle or square
A: 1ms - 10 seconds
D: 4ms - >35 seconds
S: 0 - 100% of contour peak

*/





function additive(){
    //additive synthesis for a variable number of partials
    for (int i = 0; i < partials.length; i++){
        partials[i] = audioCtx.createOscillator();
        partials[i].frequency.value = 440*i;
        partials[i].type = document.getElementById('waveform').value;
        partials[i].start();
    }

}

function am(){
    //amplitude modulation synthesis
}
function fm(){
    //frequency modulation synthesis
}

const osc = audioCtx.createOscillator();

        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        osc.type = document.getElementById('waveform').value; //choose your favorite waveform
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0
        osc.connect(gainNode).connect(globalGain); //new gain node for each node to control the adsr of that note
        activeOscillators[key] = osc
        activeGains[key] = gainNode
        osc.start();
        gainNode.gain.setTargetAtTime(currGain, audioCtx.currentTime, .2) //envelope attack
        funTime()