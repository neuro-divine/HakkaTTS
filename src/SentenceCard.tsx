import { useState } from "react";
import Char from "./Char";
import { Sentence } from "./types";
import playAudio from "./audio";
import { TERMINOLOGY } from "./consts";

export default function SentenceCard({ sentence: { language, genre, sentence } }: { sentence: Sentence }) {
	const [syllables, setSyllables] = useState(() => sentence.map(([, pronNoteArray]) => pronNoteArray[0]?.[0] || ""));
	return (
		<div className="card card-bordered border-neutral-300 bg-base-100 rounded-xl shadow-lg mb-3">
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
							}}
						/>
					))}
				</p>
				<div className="mt-2">
					<button className="btn btn-warning text-lg" onClick={() => playAudio(syllables, language)}>
						▶️
					</button>
				</div>
			</div>
		</div>
	);
}
