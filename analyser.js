// NÄide pärist: http://webaudioapi.com/samples/visualizer/
/*
 * Copyright 2013 Boris Smus. All Rights Reserved.

 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Interesting parameters to tweak!
var SMOOTHING = 0.8;
var FFT_SIZE = 2048;

var freqs;
var freqPointer=0;
var peakBin=-1;
var peakFreq=-1;
var freqBuffer = new Float32Array(32); // et analüüsida siit keskmine tippsagedus

var averagePeakFreq = 0;
var centroid = 0;

// init peaks olema tehtud main.js-s

function initAnalyser(audioContext) {
  analyser = audioContext.createAnalyser();
  //this.analyser.connect(audioContext.destination);
  // ühenda sisend parentis 
  analyser.minDecibels = -90;
  analyser.maxDecibels = -3;
  freqs = new Uint8Array(analyser.frequencyBinCount); // parem Float32
  
}




function analyseFreqencies() {
	
  //this.analyser.smoothingTimeConstant = SMOOTHING;
  //analyser.fftSize = 1024; - see vist vaikimisi
	if (!analyser) {
		return -1;
	}
	// Get the frequency data from the currently playing music
	analyser.getByteFrequencyData(freqs);
	//this.analyser.getByteTimeDomainData(this.times);

	var maxBin = -1, maxValue=-1;
	// käi läbi sageduskastid:
	var binCentroid;
	var ampSum=0, weightSum=0;
	for (var i = 0; i < analyser.frequencyBinCount; i++) { // lisa siia ka tsentroidiarvutus
		var value = freqs[i];
		if (value>maxValue) {
			maxBin = i;
			maxValue = value;
		}
		ampSum += value; weightSum +=  value*getBinFrequency(i);
	}
	centroid = weightSum / ampSum;
	//console.log("Centroid", centroid);
	peakFreq=getBinFrequency(maxBin); // (maxBin* (audioContext.sampleRate/2)/analyser.frequencyBinCount ); 
	if (peakFreq>50 && peakFreq<2000) {
		freqBuffer[freqPointer]=peakFreq; // lisa ainult selle ala sagedused
	}
	var sum = 0;
	for (var j=0; j<freqBuffer.length-1; j++) {
		sum += freqBuffer[j];
	}
	averagePeakFreq = sum/freqBuffer.length;
	freqPointer++;
	if (freqPointer==freqBuffer.length-1) {
		freqPointer=0;
		//console.log("average peakfreq", averagePeakFreq );
	}
	
	//console.log("max tugevus kastis (kast, väärtus, sagedus): ",maxBin, maxValue );
  
}

function getBinFrequency(binNumber) {
	return binNumber * (audioContext.sampleRate/2)/analyser.frequencyBinCount; // nyqvist / bincount * bin number 
}

