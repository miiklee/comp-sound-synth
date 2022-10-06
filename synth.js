document.addEventListener("DOMContentLoaded", function(event) {
    

    //map keyboard keys to frequencies
    const keyboardFrequencyMap = {
        '90': 261.625565300598634,  //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
        '73': 1046.50,  //I - C
        '57': 1108.73,  //9 - C#
        '79': 1174.66, //O - D
        '48': 1244.51, //0 - D#
        '80': 1318.51, //P - E
    }
    
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false);
    //attack in playNote, release in keyDown, sustain established by length of time key held for, decay is 0
    activeOscillators = {}
    activeGains = {}
    var activeNotes = 0.0
    var currGain = 1.0


    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const globalGain = audioCtx.createGain(); //this will control the volume of all notes
    globalGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    globalGain.connect(audioCtx.destination);

    
    function keyDown(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && !activeOscillators[key]) {
            var synthType = document.getElementById('synthesis').value
            activeNotes = activeNotes + 1.0;
            currGain =(1.0/activeNotes);
            sparseKeys = Object.keys(activeGains) //access only filled array elements
            if (activeNotes > 1.0){ //decrease amplitude of all existing notes to make room for new one
                for (let i = 0; i < sparseKeys.length; i++){
                    if(synthType == "add"){
                        activeGains[sparseKeys[i]].gain.setTargetAtTime(currGain/4, audioCtx.currentTime, 1);
                    }
                    else if(synthType == "am"){
                        activeGains[sparseKeys[i]].gain.setTargetAtTime(currGain/2, audioCtx.currentTime, 1);
                    }
                    
                }
            }
            playNote(key, currGain, synthType);
        }
    }

    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeOscillators[key]) {
            activeGains[key].gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7) //envelope release
            activeOscillators[key].stop(audioCtx.currentTime + 1); //actually stop oscillator
            additiveEnd(key);
            delete activeOscillators[key];
            delete activeGains[key];
            activeNotes = activeNotes - 1.0;
        }
    }

    var partials = {};

    function additiveEnd(key){
        if (partials[key]){
            for (let i = 0; i < partials[key].length; i++){
                partials[key][i].stop(audioCtx.currentTime + 1);
            }
            delete partials[key];
        }
    }

    function additive(waveform, gainNode, currGain, key, osc){
        //additive synthesis for a variable number of partials
        var part1 = audioCtx.createOscillator();
        var part2 = audioCtx.createOscillator();
        var part3 = audioCtx.createOscillator();
    
        part1.frequency.value = 400;
        part2.frequency.value = 800;
        part3.frequency.value = 1200;

        part1.type = waveform;
        part2.type = waveform;
        part3.type = waveform;

        part1.connect(gainNode); //new gain node for each note to control the adsr of that note
        part2.connect(gainNode);
        part2.connect(gainNode);
        partials[key] = [part1, part2, part3]
        
        part1.start()
        part2.start()
        part3.start()

        osc.connect(gainNode).connect(globalGain); //new gain node for each note to control the adsr of that note
        osc.start();
        gainNode.gain.setTargetAtTime(currGain/4, audioCtx.currentTime, .2) //envelope attack
    }


   function am(waveform, gainNode, currGain, key, osc){
        mf = audioCtx.createOscillator()
        mf.frequency.value = 101 //why not
        mf.type = waveform

        const mod = audioCtx.createGain()
        const depth = audioCtx.createGain()

        depth.gain.value = 0.5
        mod.gain.value = 1.0 - depth.gain.value

        mf.connect(depth).connect(mod.gain);
        osc.connect(mod);
        mod.connect(gainNode).connect(globalGain);

        partials[key] = [mf]
        osc.start();
        mf.start()
        gainNode.gain.setTargetAtTime(currGain/2, audioCtx.currentTime, .2) //envelope attack

    }

    function playNote(key, currGain, synthType) {
        const osc = audioCtx.createOscillator();
        osc.frequency.setValueAtTime(keyboardFrequencyMap[key], audioCtx.currentTime);
        var waveform = document.getElementById('waveform').value;
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0
        osc.type = waveform; //choose your favorite waveform
        activeOscillators[key] = osc
        activeGains[key] = gainNode

        if (synthType == "add"){
            additive(waveform, gainNode, currGain, key, osc)
        }
        else if (synthType == "am"){
            am(waveform, gainNode, currGain, key, osc)
        }else{ //default to fm, why? idk, vibes
            fm(waveform)
        }
        

    }



})




        