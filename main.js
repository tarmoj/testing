/*
The MIT License (MIT)

Copyright (c) 2014 Chris Wilson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
var audioContext = null;
var meter = null;
var canvasContext = null;
var WIDTH=500;
var HEIGHT=50;
var rafID = null;

var mediaStreamSource = null;
var mediaStreamSource2 = null;

var analyser;  // from anaylse.js

var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

  // First get ahold of getUserMedia, if present
  var getUserMedia = (navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

  // Some browsers just don't implement it - return a rejected promise with an error
  // to keep a consistent interface
  if(!getUserMedia) {
    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
  }

  // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
  return new Promise(function(successCallback, errorCallback) {
    getUserMedia.call(navigator, constraints, successCallback, errorCallback);
  });
		
}

// Older browsers might not implement mediaDevices at all, so we set an empty object first
if(navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if(navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
}


var constraints = { "audio": {
						"mandatory": {
							"googEchoCancellation": "false",
							"googAutoGainControl": "false",
							"googNoiseSuppression": "false",
							"googHighpassFilter": "false"
						},
					"optional": []
					}
				};

function onLoadForAudio() {

    // grab our canvas
	//canvasContext = document.getElementById( "meter" ).getContext("2d");
	
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();
	connectAudio();
	
	// Attempt to get audio input
	try {
		// monkeypatch getUserMedia
		navigator.getUserMedia = 
			navigator.getUserMedia ||
			navigator.webkitGetUserMedia ||
			navigator.mozGetUserMedia;

		// ask for an audio input
		navigator.mediaDevices.getUserMedia(constraints)
		.then(gotStream)
		.catch(function(err) {
			console.log(err.name + ": " + err.message);
		});
		//, gotStream, didntGetStream);
	} catch (e) {
		alert('getUserMedia threw exception :' + e);
	}
}

function didntGetStream(error) {
    alert(error);
	console.log('Error:', error);
}


// kui vaja mikker lahti/külge ühendada mediaStreamSource.disconnect() vt https://developer.mozilla.org/en-US/docs/Web/API/AudioNode/disconnect


function gotStream(stream) {
    // Create an AudioNode from the stream.
	mediaStreamSource = audioContext.createMediaStreamSource(stream);
	initAnalyser(audioContext);
	mediaStreamSource.connect(meter);
	mediaStreamSource.connect(analyser);
	//mediaStreamSource.connect(audioContext.destination);
	mediaStreamSource.disconnect();
	 // kui tahta 2 sisendit

}
function connectAudio(){
	// Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource2 = audioContext.createMediaElementSource(audio_player);
	mediaStreamSource2.connect(meter);
	mediaStreamSource2.connect(audioContext.destination);
	
    // kick off the visual updating
    drawLoop();
}
function discon(isRec){
	// Toggler
	if(isRec ){ // mikrofon
		mediaStreamSource2.disconnect();
		if(mediaStreamSource){
			mediaStreamSource.connect(meter);
			mediaStreamSource.connect(analyser);
		}
	} else { // helifail
		if(mediaStreamSource)
			mediaStreamSource.disconnect();
		mediaStreamSource2.connect(meter);
		mediaStreamSource2.connect(audioContext.destination);
	}
}

// erinevad konstandid audio vaatlemiseks;
var oldVolume = 0;
//var lastLimit = 0;
//var limitPassed = 0;
var limitPassed = [0,0,0,0] ; // 4 taset, 1, kui ületatud
var limitFactor = [1.15,1.25,1.66, 2]; // kordajad - võrreldes keskmise helitasemega (meter.averageRms)
var lastLimit = [0,0,0,0];
var oldCentroid;
var centroidThreshold = 3000;
var isVowel = 0; 
var centroidThresholdPassed=0

function drawLoop( time ) {
	//document.getElementById("averagerms").value=meter.averageRms;
	analyseFreqencies();
	document.getElementById("averagefreq").value=averagePeakFreq;
	var sensitivity = (1-parseFloat(document.getElementById("sensitivity").value))+1;  // sisuliselt kordaja, millega korrutatakse limitFactor veel läbi
	if (isLive) {
		sensitivity *= 1.5; // vähenda, kui on fail
	}
	
	if (centroid>=centroidThreshold && oldCentroid<centroidThreshold) { // kui ületab piiri, so mõrasündmus
		console.log("CENTROID LIMIT");
		centra=centroidThresholdPassed=1;
	}
	oldCentroid = centroid;
	
	if (centroid<centroidThreshold && centroid>1300 && meter.averageRms>0.05) {
		//console.log("VOWEL");
		isSpeaking=isVowel=1;
	} else {	
		isSpeaking=isVowel = 0;
	}
	
	avarageVolume = meter.averageRms;
	for (var i=0; i<limitPassed.length; i++) {
		var threshold = meter.averageRms * limitFactor[i]*sensitivity; // parem oleks kordajana logarimtiline, võibolla lihtsalt ruutjuur vms averageRms-st
		if (meter.volume>=threshold && oldVolume<threshold) {
				//console.log("LIMIT",i, threshold);
				//console.log("Average RMS", this.averageRms, this.thresholdFactor );
				//console.log("suhe: rms/average", rms/this.averageRms);
			var now = window.performance.now();
			if ((now - 500) >= lastLimit[i] ) { // TODO: sea lubatav vahemik minSeparation objekti omaduseks
				passer[i]=limitPassed[i] = 1; // mingi kasutav funktsioon peaks selle ise 0-seadma
				//console.log("React on LIMIT ",i,meter.volume );
				//console.log("now, lastLimit", now, this.lastLimit[i], now-this.lastLimit[i]);
				lastLimit[i] = now;
			}
		}
	}
	passer = limitPassed;
	oldVolume = meter.volume; // volume võibolla halb, the averaging tõttu käib ümber piiri üles alla?
	document.getElementById("averagerms").value=meter.averageRms;	
    rafID = window.requestAnimationFrame( drawLoop ); // schedule next call
}