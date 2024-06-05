import { useState } from "react";

import { NO_AUTO_FILL } from "./consts";
import parse from "./parse";
import Radio from "./Radio";
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
	return <div className="m-auto p-8 max-w-7xl">
		<div className="grid items-center justify-center grid-cols-1 max-sm:max-w-fit">
			<h1 className="max-sm:col-span-2">香港本土語言文字轉語音朗讀器</h1>
			<h2 className="my-2">香港本土語言保育協會</h2>
			<button
				type="button"
				className="btn btn-ghost hover:bg-opacity-10
						   max-sm:text-xl max-sm:font-normal max-sm:relative max-sm:left-4
						   sm:btn-lg sm:text-[1.375rem] sm:leading-[1.875rem] sm:text-slate-500 sm:col-start-2 sm:row-start-1 sm:row-end-3"
				onClick={() => (document.getElementById("about-dialog") as HTMLDialogElement).showModal()}>
				<span className="font-symbol font-normal">🛈</span>關於
			</button>
		</div>
		<div>
			<div>
				<div className="inline-block">
					<div className="text-primary text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">語言</div>
					<div className="join me-3 mb-4 bg-base-100" role="group" aria-label="選擇語言">
						<Radio name="btnlanguage" className="btn-primary" state={language} setState={setLanguage} value="waitau" />
						<Radio name="btnlanguage" className="btn-primary" state={language} setState={setLanguage} value="hakka" />
					</div>
				</div>
				<div className="inline-block">
					<div className="text-secondary text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">語體</div>
					<div className="join me-3 mb-4 bg-base-100" role="group" aria-label="選擇語體">
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
					{...NO_AUTO_FILL}
					value={text}
					onChange={event => setText(event.target.value)} />
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
	</div>;
}
