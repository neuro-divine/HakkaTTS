import type { DBSchema } from "idb";
import type { Dispatch, SetStateAction } from "react";

export type CharsFile = { [P in "char" | "waitau" | "hakka" | "notes"]: string }[];
export type WordsFile = { [P in "char" | "pron"]: string }[];

export type Language = "waitau" | "hakka";
export type Voice = "male" | "female";
export type Terminology = Language | Voice | HakkaToneMode;

export type PronToNoteMap = Map<string, string>;

export interface Edge {
	start: number;
	end: number;
	pron: string;
	note: string;
}

export interface StackedEdge extends Edge {
	layer: number;
}

export interface Sentence {
	language: Language;
	voice: Voice;
	inferenceMode: InferenceMode;
	voiceSpeed: number;
	syllables: string[];
}

export type OfflineInferenceMode = "offline" | "lightweight";
export type InferenceMode = "online" | OfflineInferenceMode;

export type HakkaToneMode = "digits" | "diacritics";

export type ModelComponent = "enc" | "emb" | "sdp" | "flow" | "dec";

export type ModelComponentToFile = Record<ModelComponent, ArrayBuffer>;

export type ModelVersion = string & { readonly brand: unique symbol };

export interface ModelFile {
	path: `${Language}/${Voice}/${ModelComponent}`;
	language: Language;
	voice: Voice;
	component: ModelComponent;
	version: ModelVersion;
	file: ArrayBuffer;
}

export interface ModelFileStatus {
	path: `${Language}/${Voice}`;
	language: Language;
	voice: Voice;
	version: ModelVersion;
	missingComponents: Set<ModelComponent>;
}

export type AudioComponent = "chars" | "words";

export type AudioComponentToFile = Record<AudioComponent, ArrayBuffer>;

export type AudioVersion = string & { readonly brand: unique symbol };

export interface AudioFile {
	path: `${Language}/${Voice}/${AudioComponent}`;
	language: Language;
	voice: Voice;
	component: AudioComponent;
	version: AudioVersion;
	file: ArrayBuffer;
}

export interface AudioFileStatus {
	path: `${Language}/${Voice}`;
	language: Language;
	voice: Voice;
	version: AudioVersion;
	missingComponents: Set<AudioComponent>;
}

export type DatabaseStore = "models" | "models_status" | "audios" | "audios_status";

export interface TTSDB extends DBSchema, Record<DatabaseStore, DBSchema[string]> {
	models: {
		key: ModelFile["path"];
		value: ModelFile;
	};
	models_status: {
		key: ModelFileStatus["path"];
		value: ModelFileStatus;
	};
	audios: {
		key: AudioFile["path"];
		value: AudioFile;
	};
	audios_status: {
		key: AudioFileStatus["path"];
		value: AudioFileStatus;
	};
}

export type DownloadComponent = ModelComponent | AudioComponent;

export type DownloadComponentToFile = Record<DownloadComponent, ArrayBuffer>;

export type DownloadVersion = ModelVersion | AudioVersion;

export type DownloadFile = ModelFile | AudioFile;

export type DownloadFileStatus = ModelFileStatus | AudioFileStatus;

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

export interface QueryOptions {
	language: Language;
	voice: Voice;
	inferenceMode: InferenceMode;
	voiceSpeed: number;
	hakkaToneMode: HakkaToneMode;
	setLanguage: Dispatch<Language>;
	setVoice: Dispatch<Voice>;
	setInferenceMode: Dispatch<InferenceMode>;
	setVoiceSpeed: Dispatch<number>;
	setHakkaToneMode: Dispatch<HakkaToneMode>;
	get urlWithQuery(): string;
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

export type SettingsDialogPage = null | "settings" | `${OfflineInferenceMode}_mode_downloads`;

export interface SettingsDialogState {
	currSettingsDialogPage: SettingsDialogPage;
	setCurrSettingsDialogPage: Dispatch<SetStateAction<SettingsDialogPage>>;
}

export interface SentenceComponentState extends SetDownloadStatus, SettingsDialogState {
	sentence: Sentence;
}

export interface Actions {
	infer(language: Language, voice: Voice, syllables: string[], voiceSpeed: number): Promise<Float32Array>;
}

interface NamedMessage<K extends keyof Actions> {
	name: K;
	args: Parameters<Actions[K]>;
	resolve: (value: ReturnType<Actions[K]>) => void;
	reject: (reason: unknown) => void;
}

export type Message = NamedMessage<keyof Actions>;
