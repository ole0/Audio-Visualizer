var canvas = document.getElementById("oscilloscope");
var canvasCtx = canvas.getContext("2d");

function updateSize() {
    canvasCtx.canvas.width  = window.innerWidth;
    canvasCtx.canvas.height = window.innerHeight;
}

window.audioCtx = window.AudioContext|| window.webkitAudioContext;
audioCtx = new AudioContext();

// Create the source.
var source = audioCtx.createBufferSource();
// Create the gain node.
var gain = audioCtx.createGain();
// Connect source to filter, filter to destination.
source.connect(gain);
gain.connect(audioCtx.destination);

console.log("na")

var audioCtx, analyser, bufferLength, dataArray, filter;

document.onkeydown = function () {
    updateSize()
    var delayInMilliseconds = 2000; //1 second
    setTimeout(function() {
        updateSize()
    }, delayInMilliseconds);
};

document.getElementById('oscilloscope').addEventListener("click", function() {

    console.log("hier")
    updateSize()
    var el = document.documentElement,
      rfs = el.requestFullscreen
        || el.webkitRequestFullScreen
        || el.mozRequestFullScreen
        || el.msRequestFullscreen 
    ;
    updateSize()
    rfs.call(el);

    var delayInMilliseconds = 1000; //1 second
    setTimeout(function() {
        updateSize()
    }, delayInMilliseconds);
    
});

window.onload = function() {

    uploadForm();

}


function destroyInput() {
    var button = document.getElementById('audioUpload')
    var label = document.getElementById('audioUploadLabel')
    label.parentNode.removeChild(label)
    button.parentNode.removeChild(button)
}

function uploadForm() {

    document.getElementById('audioUpload').onchange = function(){
        var reader = new FileReader;
        reader.onload = function(e){
            var arrayBuffer = reader.result;
            initAudio(arrayBuffer)
        }
        reader.readAsArrayBuffer(this.files[0]);
    }
}



function initAudio(audioData) {

    window.audioCtx = window.AudioContext|| window.webkitAudioContext;
    audioCtx = new AudioContext();
    analyser = audioCtx.createAnalyser()
    filter = audioCtx.createBiquadFilter()
    filter.type = 'highpass'
    filter.frequency.value = '1000'

    // load the audio file
    source = audioCtx.createBufferSource();
    audioCtx.decodeAudioData(audioData, function(buffer) {
        source.buffer = buffer;
        source.connect(filter);
        source.connect(audioCtx.destination)
        filter.connect(analyser)
        source.loop = true;
        source.start(0);
        analyser.fftSize = 1024;
        bufferLength = analyser.frequencyBinCount
        dataArray = new Uint8Array(bufferLength);
        analyser.getByteTimeDomainData(dataArray);
    });

    destroyInput()

    draw()

    updateSize()
}



// draw an oscilloscope of the current audio source

function draw() {

    drawVisual = requestAnimationFrame(draw);
    dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvasCtx.canvas.width, canvasCtx.canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(255, 255, 255)';

    var sliceWidth = canvasCtx.canvas.width * 1.0 / bufferLength;
    var x = 0;

    canvasCtx.beginPath();
    for(var i = 0; i < bufferLength; i++) {
    let v = dataArray[i]/128.0,
        y = 0.1 * v * canvasCtx.canvas.height/0.2;

    if(i === 0)
        canvasCtx.moveTo(x, y);
    else
        canvasCtx.lineTo(x, y);

    x += sliceWidth;
    }

    canvasCtx.lineTo(canvas.width, canvas.height/2);
    canvasCtx.stroke();
};