import { useCallback, useEffect, useRef, useState } from "react";

import { Client } from "@gradio/client";

import { NO_AUTO_FILL } from "./consts";

import type { Language } from "./types";
import type { ChangeEvent } from "react";

let waitau: Client | undefined;
let hakka: Client | undefined;

async function getClient(language: Language) {
	switch (language) {
		case "waitau":
			return waitau ||= await Client.connect("Naozumi0512/WR");
		case "hakka":
			return hakka ||= await Client.connect("Naozumi0512/Hakka");
	}
}

export default function AudioPlayer({ syllables, language }: { syllables: string[]; language: Language }) {
	const [isReady, setIsReady] = useState(false);
	const [isPlaying, setIsPlaying] = useState<boolean | null>(false);
	const [progress, setProgress] = useState(0);
	const animationId = useRef(0);
	const audio = useRef(new Audio());

	const playAudio = useCallback(async () => {
		if (isPlaying || !isReady) return;
		await audio.current.play();
		setIsPlaying(true);
	}, [isPlaying, isReady]);

	const pauseAudio = useCallback(() => {
		setIsPlaying(false);
		audio.current.pause();
	}, []);

	const stopAudio = useCallback(() => {
		pauseAudio();
		setProgress(0);
	}, [pauseAudio]);

	useEffect(() => {
		async function fetchAudio() {
			const response = await (await getClient(language)).predict("/tts_fn", {
				text: syllables.join(" "),
				reference_audio: null,
				style_text: null,
				x: null,
			});
			const url = (response.data as { url: string }[] | undefined)?.[1]?.url;
			if (url) {
				audio.current.src = url;
				await audio.current.play();
				audio.current.pause();
				audio.current.currentTime = progress * audio.current.duration;
				setIsReady(true);
			}
		}
		pauseAudio();
		setIsReady(false);
		void fetchAudio();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [syllables, language, pauseAudio]);

	useEffect(() => {
		function updateSeekBar() {
			if (isReady && isPlaying) setProgress(audio.current.currentTime / audio.current.duration);
			animationId.current = requestAnimationFrame(updateSeekBar);
		}
		if (isReady && isPlaying) updateSeekBar();
		return () => cancelAnimationFrame(animationId.current);
	}, [isReady, isPlaying]);

	useEffect(() => {
		const element = audio.current;
		element.addEventListener("ended", stopAudio);
		return () => {
			element.removeEventListener("ended", stopAudio);
		};
	}, [stopAudio]);

	const seekBarDown = useCallback(() => {
		if (!isPlaying) return;
		pauseAudio();
		setIsPlaying(null);
	}, [isPlaying, pauseAudio]);

	const seekBarMove = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		setProgress(+event.target.value);
	}, []);

	const seekBarUp = useCallback((event: ChangeEvent<HTMLInputElement>) => {
		audio.current.currentTime = +event.target.value * audio.current.duration;
		if (isPlaying === null) void playAudio();
	}, [isPlaying, playAudio]);

	return <div className="flex items-center mt-2 relative">
		<button
			type="button"
			className="btn btn-warning btn-square text-xl font-symbol"
			onClick={isPlaying === false ? playAudio : pauseAudio}
			aria-label={isPlaying === false ? "播放" : "暫停"}>
			{isPlaying === false ? "▶︎" : "⏸︎"}
		</button>
		<input
			type="range"
			className="range range-warning range-sm grow mx-4"
			min={0}
			max={1}
			value={progress}
			step="any"
			{...NO_AUTO_FILL}
			onMouseDown={seekBarDown}
			onTouchStart={seekBarDown}
			onChange={seekBarMove}
			onMouseUp={seekBarUp}
			onTouchEnd={seekBarUp}
			onTouchCancel={seekBarUp} />
		<button
			type="button"
			className="btn btn-warning btn-square text-xl font-symbol"
			onClick={stopAudio}
			aria-label="停止">
			⏹︎
		</button>
		{!isReady && <div className="absolute inset-0 flex items-center justify-center bg-base-content bg-opacity-10 rounded-lg">
			<span className="loading loading-spinner loading-lg" />
		</div>}
	</div>;
}
