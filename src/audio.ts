import type { Language, Voice } from "./types";

async function fetchAudio(audioContext: AudioContext, audioPath: string) {
	try {
		const response = await fetch(audioPath);
		const arrayBuffer = await response.arrayBuffer();
		const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

		const bufferSource = audioContext.createBufferSource();
		bufferSource.buffer = audioBuffer;
		return bufferSource;
	}
	catch {
		return createEmptyBufferSource(audioContext);
	}
}

function createEmptyBufferSource(audioContext: AudioContext) {
	const bufferSource = audioContext.createBufferSource();
	bufferSource.buffer = audioContext.createBuffer(1, Math.ceil(audioContext.sampleRate * 0.2), audioContext.sampleRate);
	return bufferSource;
}

function concatenateAudioSources(audioContext: AudioContext, sources: AudioBufferSourceNode[]) {
	const totalLength = sources.reduce((length, { buffer }) => length + buffer!.length, 0);
	const outputBuffer = audioContext.createBuffer(1, totalLength, audioContext.sampleRate);
	const outputChannelData = outputBuffer.getChannelData(0);

	let outputOffset = 0;
	for (const { buffer } of sources) {
		outputChannelData.set(buffer!.getChannelData(0), outputOffset);
		outputOffset += buffer!.length;
	}
	return outputBuffer;
}

export default async function getAudio(audioContext: AudioContext, language: Language, voice: Voice, syllables: string[]) {
	const audioSources = await Promise.all(
		syllables.map(
			syllable => syllable.length > 1 ? fetchAudio(audioContext, syllable) : createEmptyBufferSource(audioContext),
		),
	);
	return concatenateAudioSources(
		audioContext,
		audioSources.filter(({ buffer }) => buffer),
	);
}
