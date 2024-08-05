import { useCallback, useEffect, useRef, useState } from "react";

import { NO_AUTO_FILL } from "./consts";
import parse from "./parse";
import Radio from "./Radio";
import SentenceCard from "./SentenceCard";

import type { Voice, Language, Sentence } from "./types";

export default function App() {
	const [language, setLanguage] = useState<Language>("waitau");
	const [voice, setVoice] = useState<Voice>("male");
	const [sentences, setSentences] = useState<Sentence[]>([]);

	const textArea = useRef<HTMLTextAreaElement>(null);
	const btnAddSentence = useRef<HTMLButtonElement>(null);

	const resizeElements = useCallback(() => {
		if (textArea.current && btnAddSentence.current) {
			const height = textArea.current.style.height;
			textArea.current.style.setProperty("height", "");
			textArea.current.style.setProperty("min-height", "");
			btnAddSentence.current.style.setProperty("min-height", "");
			const scrollHeight = textArea.current.scrollHeight;
			textArea.current.style.setProperty("height", height, "important");
			textArea.current.style.setProperty("min-height", `${scrollHeight}px`, "important");
			btnAddSentence.current.style.setProperty("min-height", `${Math.max(parseInt(height) || 0, scrollHeight)}px`, "important");
		}
	}, [textArea, btnAddSentence]);

	const addSentence = useCallback(() => {
		if (!textArea.current) return;
		setSentences([
			...textArea.current.value.split("\n").flatMap(line => (line.trim() ? [{ language, voice, sentence: parse(language, line) }] : [])),
			...sentences,
		]);
		textArea.current.value = "";
		resizeElements();
	}, [textArea, voice, language, sentences, resizeElements]);

	useEffect(() => {
		if (!textArea.current) return;
		const currTextArea = textArea.current;
		const observer = new ResizeObserver(resizeElements);
		observer.observe(currTextArea);
		return () => observer.unobserve(currTextArea);
	}, [textArea, resizeElements]);

	return <div>
		<div>
			<div className="flex gap-3 mb-4">
				<div>
					<div className="text-primary text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">語言</div>
					<div className="join bg-base-100" role="group" aria-label="選擇語言">
						<Radio name="btnlanguage" className="btn-primary" state={language} setState={setLanguage} value="waitau" />
						<Radio name="btnlanguage" className="btn-primary" state={language} setState={setLanguage} value="hakka" />
					</div>
				</div>
				<div>
					<div className="text-secondary text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">聲線</div>
					<div className="join bg-base-100" role="group" aria-label="選擇聲線">
						<Radio name="btnvoice" className="btn-secondary" state={voice} setState={setVoice} value="male" />
						<Radio name="btnvoice" className="btn-secondary" state={voice} setState={setVoice} value="female" />
					</div>
				</div>
			</div>
			<div className="join w-full">
				<textarea
					className="textarea textarea-accent text-lg h-0 min-h-0 max-sm:py-2.5 sm:textarea-lg sm:text-xl flex-grow join-item overflow-hidden"
					placeholder="輸入文字……"
					rows={1}
					{...NO_AUTO_FILL}
					ref={textArea}
					onChange={resizeElements} />
				<button
					type="button"
					className="btn btn-accent h-0 min-h-0 max-sm:text-base sm:btn-lg join-item"
					ref={btnAddSentence}
					onClick={addSentence}>
					加入句子
				</button>
			</div>
		</div>
		<div className="mt-5">
			{sentences.map((sentence, i) => (
				<SentenceCard key={sentences.length - i} sentence={sentence} />
			))}
		</div>
	</div>;
}
