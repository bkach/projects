var analyser, microphone, frequencyData, waveForm;
var context = new AudioContext();
var gotUserMedia = false;

navigator.getUserMedia  = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia;

var audio = document.querySelector('audio');
var audioSourceIds = [];

MediaStreamTrack.getSources(function(sourceInfos){
  var audioSource = null;
  for (var i = 0; i <= sourceInfos.length-1; i++){
    var sourceInfo = sourceInfos[i];
    if ( sourceInfo.kind === 'audio' ) { 
      audioSourceIds.push(sourceInfo.id);
    }
  }
});

var constraints = {
  audio: {
    optional: [{sourceId: audioSourceIds[2]}]
  }
};

if (navigator.getUserMedia) {
  navigator.getUserMedia({audio: true}, gotAudio, function(){ console.log("Waiting...") });
}

function gotAudio(stream){
    microphone = context.createMediaStreamSource(stream);
    analyser = context.createAnalyser();
    microphone.connect(analyser);
    frequencyData = new Uint8Array(analyser.frequencyBinCount);
    waveForm = new Uint8Array(analyser.frequencyBinCount);
    gotUserMedia = true;
    console.log("Got user media");
}

function renderFrame() {
    analyser.getByteFrequencyData(frequencyData);
    analyser.getByteTimeDomainData(waveForm);
}

function avg(arr){
  var sum = 0;
  for(var i = 0; i < arr.length; i++){
    sum += arr[i];
  }
  return sum / arr.length;
}

function sum(arr){
  var sum = 0;
  for(var i = 0; i < arr.length; i++){
    sum += arr[i];
  }
  return sum
}

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

function animationLoop(){
  requestAnimFrame(animationLoop);
  if ( gotUserMedia )
    renderFrame();
}

animationLoop();
