import { useState, useEffect, useReducer } from "react";

import { openDB } from "idb";
import { MdClose, MdOutlineDownloadForOffline, MdRefresh } from "react-icons/md";

import { ALL_LANGUAGES, ALL_VOICES } from "./consts";
import ModelRow from "./ModelRow";

import type { TTSDB } from "./types";
import type { IDBPDatabase } from "idb";

export default function ModelManager() {
	const [db, setDb] = useState<IDBPDatabase<TTSDB>>();
	const [error, setError] = useState<Error>();
	const [retryCounter, retry] = useReducer((n: number) => n + 1, 0);

	useEffect(() => {
		setError(undefined);
		openDB<TTSDB>("TTS", 1, {
			upgrade(db) {
				if (!db.objectStoreNames.contains("models")) {
					const store = db.createObjectStore("models", { keyPath: "path" });
					store.createIndex("language_voice", ["language", "voice"]);
				}
			},
		}).then(setDb, setError);
	}, [retryCounter]);

	return <dialog className="modal modal-bottom sm:modal-middle">
		<div className="modal-box p-0 flex flex-col">
			<form method="dialog">
				<button type="submit" className="btn btn-ghost w-14 h-14 min-h-14 text-4.5xl text-slate-500 hover:bg-opacity-10" aria-label="關閉">
					<MdClose />
				</button>
			</form>
			<h3 className="mx-6 mt-6 mb-4.5">
				<MdOutlineDownloadForOffline className="mr-2" />模型下載
			</h3>
			<hr />
			<div className="overflow-y-auto">
				{error
					? <div>
						<h4>資料庫載入失敗</h4>
						<div>
							{error.name}
							{error.message && <>
								{": "}
								<code>{error.message}</code>
							</>}
						</div>
						<button type="button" className="btn btn-info text-xl text-neutral-content" onClick={retry}>
							<MdRefresh />重試
						</button>
					</div>
					: db
					? <ul>
						{ALL_LANGUAGES.flatMap(language => ALL_VOICES.map(voice => <ModelRow key={`${language}_${voice}`} db={db} language={language} voice={voice} />))}
					</ul>
					: <div>資料庫載入中……</div>}
			</div>
		</div>
	</dialog>;
}
