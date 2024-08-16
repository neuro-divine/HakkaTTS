import { useState } from "react";

import Char from "./Char";
import { TERMINOLOGY } from "./consts";
import OfflineAudioPlayer from "./OfflineAudioPlayer";
import OnlineAudioPlayer from "./OnlineAudioPlayer";
import { normalizePauses } from "./parse";
import PlainAudioPlayer from "./PlainAudioPlayer";

import type { DownloadManagerState, Sentence, SetDownloadStatus, InferenceMode } from "./types";

interface SentenceCardProps extends SetDownloadStatus, DownloadManagerState {
	sentence: Sentence;
	inferenceMode: InferenceMode;
	isDownloadManagerVisible: boolean;
	openDownloadManager: () => void;
}

export default function SentenceCard({ sentence: { language, voice, sentence }, inferenceMode, setDownloadState, isDownloadManagerVisible, openDownloadManager }: SentenceCardProps) {
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
			{inferenceMode === "online"
				? <OnlineAudioPlayer
					language={language}
					voice={voice}
					syllables={syllables} />
				: inferenceMode === "offline"
				? <OfflineAudioPlayer
					inferenceMode={inferenceMode}
					language={language}
					voice={voice}
					syllables={syllables}
					setDownloadState={setDownloadState}
					isDownloadManagerVisible={isDownloadManagerVisible}
					openDownloadManager={openDownloadManager} />
				: <PlainAudioPlayer
					language={language}
					voice={voice}
					syllables={syllables} />}
		</div>
	</div>;
}
