import { useState } from "react";
import "./index.css";
import Radio from "./Radio";
import parse from "./parse";
import SentenceCard from "./SentenceCard";

import type { Genre, Language, Sentence } from "./types";

export default function App() {
	const [language, setLanguage] = useState<Language>("waitau");
	const [genre, setGenre] = useState<Genre>("lit");
	const [text, setText] = useState("");
	const [sentences, setSentences] = useState<Sentence[]>([]);
	function addSentence() {
		setSentences([
			...text.split("\n").flatMap(line => (line.trim() ? [{ language, genre, sentence: parse(language, line) }] : [])),
			...sentences,
		]);
		setText("");
	}
	return (
		<div className="m-auto p-8 max-w-7xl">
			<h1 className="whitespace-nowrap">香港本土語言文字轉語音朗讀器（測試版本）</h1>
			<p className="text-slate-500 my-2 whitespace-nowrap">香港本土語言保育協會（2024 年 4 月 20 日）</p>
			<div>
				<div>
					<div className="inline-block">
						<div className="text-primary text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">語言</div>
						<div className="join me-3 mb-4" role="group" aria-label="選擇語言">
							<Radio name="btnlanguage" className="btn-primary" state={language} setState={setLanguage} value="waitau" />
							<Radio name="btnlanguage" className="btn-primary" state={language} setState={setLanguage} value="hakka" />
						</div>
					</div>
					<div className="inline-block">
						<div className="text-secondary text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">語體</div>
						<div className="join me-3 mb-4" role="group" aria-label="選擇語體">
							<Radio name="btngenre" className="btn-secondary" state={genre} setState={setGenre} value="lit" />
							<Radio name="btngenre" className="btn-secondary" state={genre} setState={setGenre} value="swc" />
							<Radio name="btngenre" className="btn-secondary" state={genre} setState={setGenre} value="col" />
						</div>
					</div>
				</div>
				<div className="join w-full">
					<textarea
						className="textarea textarea-accent textarea-lg text-xl min-h-16 flex-grow join-item"
						placeholder="輸入文字……"
						rows={1}
						value={text}
						onChange={event => setText(event.target.value)}
					/>
					<button type="button" className="btn btn-accent btn-lg h-full join-item" onClick={addSentence}>
						加入句子
					</button>
				</div>
			</div>
			<div className="mt-5">
				{sentences.map((sentence, i) => (
					<SentenceCard key={sentences.length - i} sentence={sentence} />
				))}
			</div>
		</div>
	);
}
