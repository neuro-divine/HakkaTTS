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
			<div
				className="text-base-100 opacity-80 [text-shadow:0_0_0.5rem_hsl(var(--bc)/0.1)] float-right select-none relative"
				aria-hidden="true">
				<div className="absolute right-12 top-5 text-7xl">❅</div>
				<div className="absolute right-6 top-10 text-7xl">❆</div>
			</div>
			<h1 className="whitespace-nowrap">香港本土語言文字轉語音朗讀器（預覽版本）</h1>
			<p className="text-slate-500 my-2 whitespace-nowrap">香港本土語言保育協會（2023 年 12 月 22 日）</p>
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
