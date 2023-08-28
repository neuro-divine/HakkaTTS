export type CharsFile = {
	[P in "char" | "canton" | "waitau" | "searchkey" | "hakka1" | "hakka2" | "Notes"]: string;
}[];
export type GeneratedWordsFile = {
	[P in "char" | "pron"]: string;
}[];
export type WordsFile = {
	[P in "Index" | "Word" | "Glossary" | "EnglishGlossary" | "Type" | "Character" | "IPA" | "Rom" | "1st check" | "Remark"]: string;
}[];

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
