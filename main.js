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

function onLoadForAudio() {

    // grab our canvas
	//canvasContext = document.getElementById( "meter" ).getContext("2d");
	
    // monkeypatch Web Audio
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
    // grab an audio context
    audioContext = new AudioContext();

	if(isLive != 0){  // audio failiks, 1- mikrofon
		// Attempt to get audio input
		try {
			// monkeypatch getUserMedia
			navigator.getUserMedia = 
				navigator.getUserMedia ||
				navigator.webkitGetUserMedia ||
				navigator.mozGetUserMedia;

			// ask for an audio input
			navigator.getUserMedia(
			{
				"audio": {
					"mandatory": {
						"googEchoCancellation": "false",
						"googAutoGainControl": "false",
						"googNoiseSuppression": "false",
						"googHighpassFilter": "false"
					},
					"optional": []
				},
			}, gotStream, didntGetStream);
		} catch (e) {
			alert('getUserMedia threw exception :' + e);
		}
	}else{
		mediaStreamSource2 = audioContext.createMediaElementSource(audio_player);
		connectAudio();
	}
}


function didntGetStream() {
    alert('Stream generation failed.');
}



function gotStream(stream) {
    // Create an AudioNode from the stream.
	mediaStreamSource = audioContext.createMediaStreamSource(stream);
	mediaStreamSource2 = audioContext.createMediaElementSource(audio_player); // kui tahta 2 sisendit
	connectAudio();
}
function connectAudio(){
	// Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    // analyser
	initAnalyser(audioContext);
	if(mediaStreamSource){ // mikrofon
		mediaStreamSource.connect(meter);
		mediaStreamSource.connect(analyser);
	}
	if(mediaStreamSource2){ // helifail
		mediaStreamSource2.connect(meter);
		mediaStreamSource2.connect(meter);
		mediaStreamSource2.connect(audioContext.destination);
	}
	
	
    // kick off the visual updating
    drawLoop();
}


// erinevad konstandid audio vaatlemiseks;
var oldVolume = 0;
//var lastLimit = 0;
//var limitPassed = 0;
var limitPassed = [0,0,0,0] ; // 4 taset, 1, kui ületatud
var limitFactor = [1.5,2,2.5, 3]; // kordajad - võrreldes keskmise helitasemega (meter.averageRms)
var lastLimit = [0,0,0,0];
var oldCentroid;
var centroidThreshold = 3000;
var isVowel = 0; 
var centroidThresholdPassed=0

function drawLoop( time ) {
	//document.getElementById("averagerms").value=meter.averageRms;
	analyseFreqencies();
	document.getElementById("averagefreq").value=averagePeakFreq;
	
	if (centroid>=centroidThreshold && oldCentroid<centroidThreshold) { // kui ületab piiri, so mõrasündmus
		console.log("CENTROID LIMIT");
		centroidThresholdPassed=0
	}
	oldCentroid = centroid;
	
	if (centroid<centroidThreshold && centroid>1300 && meter.averageRms>0.05) {
		//console.log("VOWEL");
		isVowel=1;
	} else {	
		isVowel = 0;
	}
	
	avarageVolume = meter.averageRms;
	for (var i=0; i<limitPassed.length; i++) {
		var threshold = meter.averageRms * limitFactor[i]; // TODO: ? kas lisada tundlikkuse parameeter või slaider?
		if (isLive) {
			threshold = Math.sqrt(threshold); // vähenda, kui on fail
		}
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