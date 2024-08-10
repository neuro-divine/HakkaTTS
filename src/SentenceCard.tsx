import { useState } from "react";

import AudioPlayer from "./AudioPlayer";
import Char from "./Char";
import { TERMINOLOGY } from "./consts";
import { normalizePauses } from "./parse";

import type { Sentence } from "./types";

export default function SentenceCard({ sentence: { language, voice, sentence }, openModelManager }: { sentence: Sentence; openModelManager: () => Promise<void> }) {
	const [syllables, setSyllables] = useState(() => sentence.map(([char, pronNoteArray]) => pronNoteArray[0]?.[0] || normalizePauses(char)));
	return <div className="card card-bordered border-base-300 bg-base-100 rounded-xl shadow-lg mb-3">
		<div className="card-body max-sm:[--padding-card:1.5rem]">
			<div className="join">
				<span className="badge badge-primary join-item">{TERMINOLOGY[language]}</span>
				<span className="badge badge-secondary join-item">{TERMINOLOGY[voice]}</span>
			</div>
			<div className="text-2.5xl/none sm:text-4xl mt-2 sm:mt-5">
				{sentence.map(([char, pronNoteArray], i) => (
					<Char
						key={i}
						char={char}
						pronNoteArray={pronNoteArray}
						setSyllable={pron => {
							const newSyllables = syllables.slice();
							newSyllables[i] = pron;
							setSyllables(newSyllables);
						}} />
				))}
			</div>
			<AudioPlayer language={language} voice={voice} syllables={syllables} openModelManager={openModelManager} />
		</div>
	</div>;
}
