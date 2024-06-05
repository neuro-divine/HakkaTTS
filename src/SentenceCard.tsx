import { useState } from "react";

import AudioPlayer from "./AudioPlayer";
import Char from "./Char";
import { TERMINOLOGY } from "./consts";

import type { Sentence } from "./types";

export default function SentenceCard({ sentence: { language, genre, sentence } }: { sentence: Sentence }) {
	const [syllables, setSyllables] = useState(() => sentence.map(([, pronNoteArray]) => pronNoteArray[0]?.[0] || ""));
	return <div className="card card-bordered border-base-300 bg-base-100 rounded-xl shadow-lg mb-3">
		<div className="card-body">
			<div className="join">
				<span className="badge badge-primary join-item">{TERMINOLOGY[language]}</span>
				<span className="badge badge-secondary join-item">{TERMINOLOGY[genre]}</span>
			</div>
			<p className="text-4xl mt-2">
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
			</p>
			<AudioPlayer syllables={syllables} language={language} />
		</div>
	</div>;
}
