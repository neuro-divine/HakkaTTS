import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import { MdErrorOutline, MdFileDownload, MdPause, MdPlayArrow, MdRefresh, MdStop } from "react-icons/md";
import { WaveFile } from "wavefile";

import { ALL_AUDIO_COMPONENTS, ALL_MODEL_COMPONENTS, DatabaseError, DOWNLOAD_TYPE_LABEL, FileNotDownloadedError, NO_AUTO_FILL } from "./consts";
import { useDB } from "./db/DBContext";
import { CURRENT_AUDIO_VERSION, CURRENT_MODEL_VERSION } from "./db/version";
import API from "./inference/api";

import type { Language, DownloadComponentToFile, DownloadManagerState, SetDownloadStatus, DownloadVersion, Voice, OfflineInferenceModeState, ModelComponentToFile } from "./types";
import type { SyntheticEvent } from "react";

const audioCache = new Map<string, Map<string, string>>();

interface AudioPlayerProps extends OfflineInferenceModeState, SetDownloadStatus, DownloadManagerState {
	language: Language;
	voice: Voice;
	syllables: string[];
}

export default function OfflineAudioPlayer({ inferenceMode, language, voice, syllables, setDownloadState, isDownloadManagerVisible, openDownloadManager }: AudioPlayerProps) {
	const [isReady, setIsReady] = useState(false);
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

	const { db, error: dbInitError, retry: dbInitRetry } = useDB();
	const [downloadError, setDownloadError] = useState<Error>();
	const [downloadRetryCounter, downloadRetry] = useReducer((n: number) => n + 1, 0);
	const [download, setDownload] = useState<DownloadComponentToFile>();

	const store = inferenceMode === "offline" ? "models" : "audios";
	const CURRENT_VERSION = inferenceMode === "offline" ? CURRENT_MODEL_VERSION : CURRENT_AUDIO_VERSION;
	const ALL_COMPONENTS = inferenceMode === "offline" ? ALL_MODEL_COMPONENTS : ALL_AUDIO_COMPONENTS;

	useEffect(() => {
		if (!db || download || isDownloadManagerVisible) return;
		async function getDownloadComponents() {
			try {
				const availableFiles = await db!.getAllFromIndex(store, "language_voice", [language, voice]);
				if (availableFiles.length !== ALL_COMPONENTS.length) {
					setDownloadError(new FileNotDownloadedError(inferenceMode, language, voice, !availableFiles.length));
					setDownloadState({ inferenceMode, language, voice, status: availableFiles.length ? "incomplete" : "available_for_download" });
					return;
				}
				const components = {} as DownloadComponentToFile;
				const versions = new Set<DownloadVersion>();
				for (const file of availableFiles) {
					components[file.component] = file;
					versions.add(file.version);
				}
				if (versions.size !== 1) {
					setDownloadError(new FileNotDownloadedError(inferenceMode, language, voice));
					setDownloadState({ inferenceMode, language, voice, status: "incomplete" });
					return;
				}
				setDownload(components);
				setDownloadState({ inferenceMode, language, voice, status: versions.values().next().value === CURRENT_VERSION ? "latest" : "new_version_available" });
			}
			catch (error) {
				setDownloadError(new DatabaseError(`無法存取語音${DOWNLOAD_TYPE_LABEL[inferenceMode]}：資料庫出錯`, { cause: error }));
			}
		}
		setDownloadError(undefined);
		setIsReady(false);
		void getDownloadComponents();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [db, download, inferenceMode, language, voice, setDownloadState, isDownloadManagerVisible, downloadRetryCounter]);

	const [generationError, setGenerationError] = useState<Error>();
	const [generationRetryCounter, generationRetry] = useReducer((n: number) => n + 1, 0);
	const text = syllables.join(" ");
	useEffect(() => {
		if (!download) return;
		const [{ version }] = Object.values(download);
		const _isPlaying = isPlaying;
		async function generateAudio() {
			const key = `${version}/${language}/${voice}`;
			let textToURL = audioCache.get(key);
			if (!textToURL) audioCache.set(key, textToURL = new Map<string, string>());
			let url = textToURL.get(text);
			if (!url) {
				try {
					const wav = new WaveFile();
					wav.fromScratch(1, 44100, "32f", await API.infer(language, download as ModelComponentToFile, syllables));
					textToURL.set(text, url = wav.toDataURI());
				}
				catch (error) {
					setGenerationError(error as Error);
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
		setGenerationError(undefined);
		setIsReady(false);
		void generateAudio();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [language, voice, download, text, generationRetryCounter]);

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

	const error = dbInitError || downloadError || generationError;
	useEffect(() => {
		if (error) console.error(error);
	}, [error]);

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
		{(error || !isReady) && <div className={`absolute inset-0 flex items-center justify-center ${error ? "bg-gray-300 bg-opacity-50 text-error" : "bg-gray-500 bg-opacity-20"} rounded-lg text-xl`}>
			{error
				? <div>
					<MdErrorOutline size="1.1875em" className="inline align-middle mt-0.5 mr-1" />
					<span className="leading-8 align-middle">
						{error instanceof FileNotDownloadedError || error instanceof DatabaseError ? <span className="font-medium">{error.message}</span> : <>
							<span className="font-bold">錯誤：</span>
							{error.name}
							{error.message && <>
								{": "}
								<code>{error.message}</code>
							</>}
						</>}
					</span>
					<button
						type="button"
						className="btn btn-info btn-sm text-lg text-neutral-content ml-2 pl-2 gap-1 align-middle"
						onClick={dbInitError
							? dbInitRetry
							: downloadError
							? (downloadError instanceof FileNotDownloadedError ? openDownloadManager : downloadRetry)
							: generationError
							? generationRetry
							: undefined}>
						{error instanceof FileNotDownloadedError
							? <>
								<MdFileDownload size="1.1875em" />下載{DOWNLOAD_TYPE_LABEL[inferenceMode]}
							</>
							: <>
								<MdRefresh size="1.1875em" />重試
							</>}
					</button>
				</div>
				: <div className="flex items-center gap-3 font-medium">
					{db ? download ? "正在生成語音，請稍候……" : `正在存取語音${DOWNLOAD_TYPE_LABEL[inferenceMode]}……` : "資料庫載入中……"}
					<span className="loading loading-spinner max-sm:w-8 sm:loading-lg" />
				</div>}
		</div>}
	</div>;
}
