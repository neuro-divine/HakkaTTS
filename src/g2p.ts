// dprint-ignore
const waitauSymbolToID: Record<string, number> = {
    "b": 10, "p": 49, "m": 38, "f": 23, "d": 12, "t": 51, "n": 39, "l": 37,
    "z": 60, "c": 11, "s": 50, "y": 59, "g": 24, "k": 35, "ng": 40, "h": 26,
    "gw": 25, "kw": 36, "w": 58,

    "a": 1, "ai": 2, "au": 9, "am": 4, "an": 5, "ang": 6, "ap": 7, "at": 8, "ak": 3,
    "ä": 61, "äi": 62, "äu": 70, "äm": 65, "än": 66, "äng": 67, "äp": 68, "ät": 69, "äk": 64, 
    "äing": 63,
    "æ": 71, "æng": 74, "æk": 73,
    "æing": 72,
    "e": 13, "ei": 14, "eu": 22, "em": 16, "en": 17, "eng": 18, "ep": 20, "et": 21, "ek": 15, 
    "i": 27, "iu": 34, "im": 29, "in": 30, "ing": 31, "ip": 32, "it": 33, "ik": 28, 
    "o": 41, "oi": 42, "ou": 48, "on": 45, "ong": 46, "ot": 47, "ok": 44, 
    "oing": 43,
    "ö": 75, "öi": 76, "ön": 78, "öng": 79, "öt": 80, "ök": 77,
    "u": 52, "ui": 53, "un": 55, "ung": 56, "ut": 57, "uk": 54,
    "ü": 81, "ün": 83, "üng": 84, "üt": 85, "ük": 82,

    ".": 90, ",": 89, "!": 86, "?": 87, "…": 88, "'": 91, "-": 92,
};

// dprint-ignore
const hakkaSymbolToID: Record<string, number> = {
    "b": 19, "p": 62, "m": 49, "f": 34, "v": 74, "d": 21, "t": 67, "l": 48,
    "z": 80, "c": 20, "s": 63, "y": 76, "g": 35, "k": 46, "ng": 51, "h": 37, "#": 90,

    "a": 1, "ai": 11, "au": 18, "am": 13, "an": 14, "ang": 15, "ap": 16, "at": 17, "ak": 12,
    "e": 22, "ei": 23, "eu": 33, "em": 25, "en": 26, "eng": 27, "ep": 31, "et": 32, "ek": 24,
    "i": 38, "iu": 45, "im": 40, "in": 41, "ing": 42, "ip": 43, "it": 44, "ik": 39,
    "o": 52, "oi": 56, "ou": 61, "on": 58, "ong": 59, "ot": 60, "ok": 57,
    "u": 68, "ui": 69, "un": 71, "ung": 72, "ut": 73, "uk": 70,

    ".": 85, ",": 84, "!": 81, "?": 82, "…": 83, "'": 86, "-": 87,
};

export function waitau(syllables: readonly string[]) {
	const phones = [0, 0, 0];
	const tones = [0, 0, 0];

	for (const syllable of syllables) {
		if (syllable.length === 1) {
			phones.push(waitauSymbolToID[syllable], 0);
			tones.push(0, 0);
			continue;
		}

		const index = /[aeiouäöüæ]/.exec(syllable)?.index ?? 0;
		const initial = syllable.slice(0, index) || syllable[index];
		const final = syllable.slice(index, -1);
		phones.push(waitauSymbolToID[initial], 0, waitauSymbolToID[final], 0);

		const tone = +syllable.slice(-1);
		tones.push(tone, 0, tone, 0);
	}

	phones.push(0, 0);
	tones.push(0, 0);

	return [phones, tones] as const;
}

export function hakka(syllables: readonly string[]) {
	const phones = [0, 0, 0];
	const tones = [0, 0, 0];

	for (const syllable of syllables) {
		if (syllable.length === 1) {
			phones.push(hakkaSymbolToID[syllable], 0);
			tones.push(0, 0);
			continue;
		}

		let index = /[aeiou]/.exec(syllable)?.index ?? 0;
		const initial = syllable.slice(0, index) || syllable[index];
		const medial = syllable[index] === "i" && /[aeou]/.test(syllable[index + 1]) ? syllable[index++] : "#";
		const final = syllable.slice(index, -1);
		phones.push(hakkaSymbolToID[initial], 0, hakkaSymbolToID[medial], 0, hakkaSymbolToID[final], 0);

		const tone = +syllable.slice(-1);
		tones.push(tone, 0, medial === "i" ? tone : 0, 0, tone, 0);
	}

	phones.push(0, 0);
	tones.push(0, 0);

	return [phones, tones] as const;
}
