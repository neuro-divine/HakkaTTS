import { eastAsianWidth } from "eastasianwidth";
import Resource from "./Resource";
import Chars from "./res/Chars.csv";
import WaitauWords from "./res/WaitauWords.csv";
import HakkaWords from "./res/HakkaWords.csv";
import WaitauGeneratedWords from "./res/WaitauGeneratedWords.csv";
import HakkaGeneratedWords from "./res/HakkaGeneratedWords.csv";
import { Language, PronNoteArray } from "./types";

const resources: Record<Language, Resource> = {
	waitau: new Resource(WaitauWords, WaitauGeneratedWords),
	hakka: new Resource(HakkaWords, HakkaGeneratedWords),
};
for (const { char, waitau, hakka1, hakka2, Notes } of Chars) {
	if (waitau) resources.waitau.set(char, new Map([[waitau, Notes]]));
	if (hakka1) resources.hakka.set(char, new Map([[hakka1, Notes]]));
	if (hakka2) resources.hakka.set(char, new Map([[hakka2, Notes]]));
}

function segment(text: string) {
	const result: string[] = [];
	let curr = "";
	for (const c of text) {
		if (c.trim()) {
			const width = eastAsianWidth(c);
			if (width == "W" || width == "F") {
				if (curr) result.push(curr);
				result.push(c);
				curr = "";
			} else {
				curr += c;
			}
		} else {
			if (curr) result.push(curr);
			curr = "";
		}
	}
	if (curr) result.push(curr);
	return result;
}

export default function parse(language: Language, text: string): [string, PronNoteArray][] {
	return resources[language].get(segment(text)).map(([char, pronToNoteMap]) => [char, Array.from(pronToNoteMap)]);
}
