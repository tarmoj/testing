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
		mediaStreamSource = audioContext.createMediaElementSource(audio_player);
		connectAudio();
	}
}


function didntGetStream() {
    alert('Stream generation failed.');
}

var mediaStreamSource = null;

function gotStream(stream) {
    // Create an AudioNode from the stream.
	mediaStreamSource = audioContext.createMediaStreamSource(stream);
	connectAudio();
}
function connectAudio(){
	// Create a new volume meter and connect it.
    meter = createAudioMeter(audioContext);
    mediaStreamSource.connect(meter);
	mediaStreamSource.connect(audioContext.destination);

    // kick off the visual updating
    drawLoop();
}

function drawLoop( time ) {
    //console.log(meter.averageRms);
	//document.getElementById("averagerms").value=meter.averageRms;
	avarageVolume = meter.averageRms;
    rafID = window.requestAnimationFrame( drawLoop ); // is this necessary?
}
