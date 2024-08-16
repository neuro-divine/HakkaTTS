import type { DBSchema } from "idb";
import type { Dispatch } from "react";

export type CharsFile = { [P in "char" | "waitau" | "hakka" | "notes"]: string }[];
export type WordsFile = { [P in "char" | "pron"]: string }[];

export type Language = "waitau" | "hakka";
export type Voice = "male" | "female";
export type Terminology = Language | Voice;

export type PronToNoteMap = Map<string, string>;
export type PronNoteArray = [string, string][];
export interface Sentence {
	language: Language;
	voice: Voice;
	sentence: [string, PronNoteArray][];
}

export type OfflineInferenceMode = "offline" | "plain";
export type InferenceMode = "online" | OfflineInferenceMode;

export interface ServerError {
	error: string;
	message?: string;
}

export type ModelComponent = "enc" | "emb" | "sdp" | "flow" | "dec";

export type ModelComponentToFile = Record<ModelComponent, ModelFile>;

export type ModelVersion = string & { readonly brand: unique symbol };

export interface ModelFile {
	path: `${Language}/${Voice}/${ModelComponent}`;
	language: Language;
	voice: Voice;
	component: ModelComponent;
	version: ModelVersion;
	file: ArrayBuffer;
}

export type AudioComponent = "chars" | "words";

export type AudioComponentToFile = Record<AudioComponent, AudioFile>;

export type AudioVersion = string & { readonly brand: unique symbol };

export interface AudioFile {
	path: `${Language}/${Voice}/${AudioComponent}`;
	language: Language;
	voice: Voice;
	component: AudioComponent;
	version: AudioVersion;
	file: ArrayBuffer;
}

export interface TTSDB extends DBSchema {
	models: {
		key: ModelFile["path"];
		value: ModelFile;
		indexes: {
			language_voice: [Language, Voice];
		};
	};
	audios: {
		key: AudioFile["path"];
		value: AudioFile;
		indexes: {
			language_voice: [Language, Voice];
		};
	};
}

export type DownloadComponent = ModelComponent | AudioComponent;

export type DownloadComponentToFile = Record<DownloadComponent, DownloadFile>;

export type DownloadVersion = ModelVersion | AudioVersion;

export type DownloadFile = ModelFile | AudioFile;

export type ActualDownloadStatus =
	| "available_for_download"
	| "new_version_available"
	| "incomplete"
	| "latest";

export type DownloadStatus =
	| ActualDownloadStatus
	| "gathering_info"
	| "gather_failed"
	| "downloading"
	| "download_failed"
	| "download_incomplete"
	| "cancelled_not_downloaded"
	| "cancelled_incomplete"
	| "save_failed"
	| "save_incomplete";

export interface OfflineInferenceModeState {
	inferenceMode: OfflineInferenceMode;
}

export interface DownloadState {
	inferenceMode: OfflineInferenceMode;
	language: Language;
	voice: Voice;
	status: ActualDownloadStatus;
}

export interface SetDownloadStatus {
	setDownloadState: Dispatch<DownloadState>;
}

export interface DownloadManagerState {
	isDownloadManagerVisible: boolean;
	openDownloadManager: () => void;
}

export interface Actions {
	infer(language: Language, model: ModelComponentToFile, syllables: string[]): Promise<Float32Array>;
}

interface NamedMessage<K extends keyof Actions> {
	name: K;
	args: Parameters<Actions[K]>;
	resolve: (value: ReturnType<Actions[K]>) => void;
	reject: (reason: unknown) => void;
}

export type Message = NamedMessage<keyof Actions>;
