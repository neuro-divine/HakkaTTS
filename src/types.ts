export type CharsFile = { [P in "char" | "waitau" | "hakka" | "notes"]: string }[];
export type WordsFile = { [P in "char" | "pron"]: string }[];

export type Language = "waitau" | "hakka";
export type Genre = "lit" | "swc" | "col";
export type Terminology = Language | Genre;

export type PronToNoteMap = Map<string, string>;
export type PronNoteArray = [string, string][];
export interface Sentence {
	language: Language;
	genre: Genre;
	sentence: [string, PronNoteArray][];
}

export interface Actions {
	infer(language: Language, syllables: string[]): Promise<Float32Array>;
}

interface NamedMessage<K extends keyof Actions> {
	name: K;
	args: Parameters<Actions[K]>;
	resolve: (value: ReturnType<Actions[K]>) => void;
	reject: (reason: unknown) => void;
}

export type Message = NamedMessage<keyof Actions>;
