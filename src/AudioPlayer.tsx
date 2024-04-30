import { useEffect, useRef, useState } from "react";
import getAudio from "./audio";

import type { ChangeEvent } from "react";
import type { Language } from "./types";

export default function AudioPlayer({ syllables, language }: { syllables: string[]; language: Language }) {
	const [context] = useState(() => new AudioContext());
	const [buffer, setBuffer] = useState<AudioBuffer | undefined>();
	const [shouldUpdate, setshouldUpdate] = useState<boolean | null>(true);
	const [sourceNode, setSourceNode] = useState<AudioBufferSourceNode | undefined>();
	const [isPlaying, setIsPlaying] = useState<boolean | null>(false);
	const [startTime, setStartTime] = useState(0);
	const [progress, setProgress] = useState(0);
	const animationId = useRef(0);

	useEffect(() => setshouldUpdate(true), [syllables]);
	useEffect(() => {
		if (!isPlaying || !buffer) return;
		function updateSeekBar() {
			if (isPlaying && buffer) {
				const _progress = (context.currentTime - startTime) / buffer.duration;
				setProgress(_progress);
				if (_progress >= 1) stopAudio();
			}
			animationId.current = requestAnimationFrame(updateSeekBar);
		}
		updateSeekBar();
		return () => cancelAnimationFrame(animationId.current);
	}, [isPlaying, buffer]);

	async function playAudio() {
		if (isPlaying || shouldUpdate === null) return;
		let _buffer = buffer;
		if (!_buffer || shouldUpdate) {
			setshouldUpdate(null);
			const context = new AudioContext();
			_buffer = await getAudio(context, syllables, language);
			context.addEventListener("statechange", pauseAudio);
			setBuffer(_buffer);
			setshouldUpdate(false);
		}
		const sourceNode = context.createBufferSource();
		sourceNode.buffer = _buffer;
		sourceNode.playbackRate.value = 1.15;

		const _progress = progress * _buffer.duration;
		sourceNode.connect(context.destination);
		sourceNode.start(0, _progress);
		setSourceNode(sourceNode);
		setIsPlaying(true);
		setStartTime(context.currentTime - _progress);
	}
	function pauseAudio() {
		setIsPlaying(false);
		if (!sourceNode) return;
		sourceNode.stop();
		sourceNode.disconnect();
		setSourceNode(undefined);
	}
	function stopAudio() {
		pauseAudio();
		setProgress(0);
		setStartTime(context.currentTime);
	}
	function seekBarDown() {
		if (!isPlaying) return;
		pauseAudio();
		setIsPlaying(null);
	}
	function seekBarMove(event: ChangeEvent<HTMLInputElement>) {
		const _progress = +event.target.value;
		setProgress(_progress);
		if (buffer) setStartTime(context.currentTime - _progress * buffer.duration);
	}
	function seekBarUp() {
		if (isPlaying === null) playAudio();
	}
	return (
		<div className="flex items-center mt-2">
			<button type="button" className="btn btn-warning btn-square text-lg font-mono" onClick={isPlaying !== false ? pauseAudio : playAudio}>
				{isPlaying !== false ? "⏸︎" : "▶︎"}
			</button>
			<input
				type="range"
				className="range range-warning range-sm grow mx-4"
				min={0}
				max={1}
				value={progress}
				step={"any"}
				onMouseDown={seekBarDown}
				onTouchStart={seekBarDown}
				onChange={seekBarMove}
				onMouseUp={seekBarUp}
				onTouchEnd={seekBarUp}
				onTouchCancel={seekBarUp}
			/>
			<button type="button" className="btn btn-warning btn-square text-lg font-mono" onClick={stopAudio}>
				⏹︎
			</button>
		</div>
	);
}
