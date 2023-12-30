import type { Language } from "./types";

const AUDIO_PATH = "https://chaaklau.github.io/hkilang-tts-prototype/audio";
const HAKKA_TONE_MAP: Record<string, string> = {
	"1": "13",
	"2": "11",
	"3": "31",
	"4": "55",
	"5": "32",
	"6": "55",
	"x": "35",
};
const ROM_FILENAME_MAP: Record<string, string> = {
	ü: "v",
	ä: "a'",
	ö: "o'",
	æ: "ae",
};

function trimSilence(audioContext: AudioContext, audioBuffer: AudioBuffer) {
	const threshold = 0.1; // Adjust this threshold as needed
	const channelData = audioBuffer.getChannelData(0); // Assuming mono audio

	let start = 0;
	let end = channelData.length - 1;

	// Find the start index where audio exceeds the threshold
	for (let i = 0; i < channelData.length; i++) {
		if (Math.abs(channelData[i]) > threshold) {
			start = i;
			break;
		}
	}

	// Find the end index where audio exceeds the threshold
	for (let i = channelData.length - 1; i >= 0; i--) {
		if (Math.abs(channelData[i]) > threshold) {
			end = i;
			break;
		}
	}

	// Create a new audio buffer with trimmed data
	const newBuffer = audioContext.createBuffer(audioBuffer.numberOfChannels, end - start + 1, audioBuffer.sampleRate);

	for (let channel = 0; channel < audioBuffer.numberOfChannels; channel++) {
		const sourceData = audioBuffer.getChannelData(channel);
		const newData = newBuffer.getChannelData(channel);
		for (let i = start; i <= end; i++) {
			newData[i - start] = sourceData[i];
		}
	}

	return newBuffer;
}

// Function to fetch audio and trim silence
async function fetchAndTrimAudio(audioContext: AudioContext, audioPath: string) {
	try {
		const response = await fetch(audioPath);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

		const bufferSource = audioContext.createBufferSource();
		bufferSource.buffer = trimSilence(audioContext, audioBuffer);
		return bufferSource;
	} catch {
		return createEmptyBufferSource(audioContext);
	}
}

function createEmptyBufferSource(audioContext: AudioContext) {
	const bufferSource = audioContext.createBufferSource();
	bufferSource.buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.5), audioContext.sampleRate);
	return bufferSource;
}

// Function to concatenate audio sources
function concatenateAudioSources(audioContext: AudioContext, sources: AudioBufferSourceNode[]) {
	const totalLength = sources.reduce((totalLength, source) => totalLength + source.buffer!.length, 0);
	const outputBuffer = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
	const outputChannelData = outputBuffer.getChannelData(0);

	let outputOffset = 0;
	sources.forEach(source => {
		const sourceChannelData = source.buffer!.getChannelData(0);

		// Copy source audio data to output buffer
		outputChannelData.set(sourceChannelData, outputOffset);
		outputOffset += source.buffer!.length;
	});

	return outputBuffer;
}

function getFileArray(rom: string[], lang: Language) {
	if (lang === "hakka") {
		// Handle tone sandhi rules here.
		rom = rom.slice();
		for (let i = 0; i < rom.length; ++i) {
			if (rom[i]) {
				if (rom[i].slice(-1) === "1" && rom[i + 1] && ["2", "3", "5"].includes(rom[i + 1].slice(-1))) {
					rom[i] = rom[i].slice(0, -1) + "x";
				}
				rom[i] = rom[i].slice(0, -1) + HAKKA_TONE_MAP[rom[i].slice(-1)];
			}
		}
	}
	// generate path
	return rom.map(syll => syll && `${AUDIO_PATH}/${lang[0]}/${Array.from(syll, c => ROM_FILENAME_MAP[c] || c).join("")}.mp3`);
}

export default async function getAudio(audioContext: AudioContext, rom: string[], lang: Language) {
	const audioSources = await Promise.all(
		getFileArray(rom, lang).map(audioPath =>
			audioPath ? fetchAndTrimAudio(audioContext, audioPath) : createEmptyBufferSource(audioContext)
		)
	);
	return concatenateAudioSources(
		audioContext,
		audioSources.filter(source => source && source.buffer)
	);
}
