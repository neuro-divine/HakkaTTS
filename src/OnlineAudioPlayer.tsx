import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { MdErrorOutline, MdPause, MdPlayArrow, MdRefresh, MdStop } from "react-icons/md";

import { NO_AUTO_FILL } from "./consts";

import type { Language, ModelLanguageAndVoice, ServerError, Voice } from "./types";
import type { SyntheticEvent } from "react";

const audioCache = new Map<ModelLanguageAndVoice, Map<string, string>>();

export default function OnlineAudioPlayer({ language, voice, syllables }: { language: Language; voice: Voice; syllables: string[] }) {
	const [isReady, setIsReady] = useState(false);
	const [serverError, setServerError] = useState<ServerError | undefined>();
	const [retryCounter, retry] = useReducer((n: number) => n + 1, 0);
	const [isPlaying, setIsPlaying] = useState<boolean | null>(false);
	const [progress, setProgress] = useState(0);
	const animationId = useRef(0);
	const audio = useRef(new Audio());

	const playAudio = useCallback(async () => {
		await audio.current.play();
		audio.current.currentTime = progress * audio.current.duration;
		setIsPlaying(true);
	}, [progress]);

	const pauseAudio = useCallback(() => {
		audio.current.pause();
		setIsPlaying(false);
	}, []);

	const stopAudio = useCallback(() => {
		pauseAudio();
		setProgress(0);
	}, [pauseAudio]);

	const text = syllables.join("+");
	useEffect(() => {
		const _isPlaying = isPlaying;
		async function fetchAudio() {
			const key: ModelLanguageAndVoice = `${language}_${voice}`;
			let textToURL = audioCache.get(key);
			if (!textToURL) audioCache.set(key, textToURL = new Map<string, string>());
			let url = textToURL.get(text);
			if (!url) {
				try {
					const response = await fetch(`https://Chaak2.pythonanywhere.com/TTS/${language}/${encodeURI(text)}?voice=${voice}`);
					if (response.ok) {
						textToURL.set(text, url = URL.createObjectURL(await response.blob()));
					}
					else {
						setServerError(await response.json() as ServerError);
					}
				}
				catch {
					setServerError({ error: "載入失敗" });
				}
			}
			if (url) {
				audio.current.src = url;
				setIsReady(true);
				if (_isPlaying) await playAudio();
				else setIsPlaying(false);
			}
		}
		audio.current.pause();
		setServerError(undefined);
		setIsReady(false);
		void fetchAudio();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language, voice, text, retryCounter]);

	useEffect(() => {
		if (!isReady || !isPlaying) return;
		function updateSeekBar() {
			if (Number.isFinite(audio.current.duration)) setProgress(audio.current.currentTime / audio.current.duration);
			animationId.current = requestAnimationFrame(updateSeekBar);
		}
		updateSeekBar();
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
		audio.current.pause();
		setIsPlaying(null);
	}, [isPlaying]);

	const seekBarMove = useCallback((event: SyntheticEvent<HTMLInputElement>) => {
		setProgress(+event.currentTarget.value);
	}, []);

	const seekBarUp = useCallback((event: SyntheticEvent<HTMLInputElement>) => {
		audio.current.currentTime = +event.currentTarget.value * audio.current.duration;
		if (isPlaying === null) void playAudio();
	}, [isPlaying, playAudio]);

	return <div className="flex items-center mt-2 relative">
		<button
			type="button"
			className="btn btn-warning btn-square text-3xl max-sm:size-10 max-sm:min-h-10"
			onClick={isPlaying === false ? playAudio : pauseAudio}
			aria-label={isPlaying === false ? "播放" : "暫停"}
			tabIndex={isReady ? 0 : -1}>
			{isPlaying === false ? <MdPlayArrow /> : <MdPause />}
		</button>
		<input
			type="range"
			className="range range-warning range-sm grow mx-3 sm:mx-4"
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
			onTouchCancel={seekBarUp}
			tabIndex={isReady ? 0 : -1} />
		<button
			type="button"
			className="btn btn-warning btn-square text-3xl max-sm:size-10 max-sm:min-h-10"
			onClick={stopAudio}
			aria-label="停止"
			tabIndex={isReady ? 0 : -1}>
			<MdStop />
		</button>
		{!isReady && <div className={`absolute inset-0 flex items-center justify-center ${serverError ? "bg-gray-300 bg-opacity-50 text-error" : "bg-gray-500 bg-opacity-20"} rounded-lg text-xl`}>
			{serverError
				? <div>
					<MdErrorOutline size="1.1875em" className="inline align-middle mt-0.5 mr-1" />
					<span className="leading-8 align-middle">
						<span className="font-bold">錯誤：</span>
						{serverError.error}
						{serverError.message && <>
							{": "}
							<code>{serverError.message}</code>
						</>}
					</span>
					<button
						type="button"
						className="btn btn-info btn-sm text-lg text-neutral-content ml-2 pl-2 gap-1 align-middle"
						onClick={retry}>
						<MdRefresh size="1.1875em" />重試
					</button>
				</div>
				: <span className="loading loading-spinner max-sm:w-8 sm:loading-lg" />}
		</div>}
	</div>;
}
