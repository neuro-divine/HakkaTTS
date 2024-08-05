import { useState, useRef, useReducer, useEffect } from "react";

import { AbortError, ALL_MODEL_COMPONENTS, CURRENT_MODEL_VERSION, DatabaseError, MODEL_STATUS_LABEL, MODEL_STATUS_ACTION_LABEL, MODEL_STATUS_CLASS, MODEL_STATUS_ICON, TERMINOLOGY, VOICE_TO_ICON } from "./consts";

import type { ModelStatus, TTSDB, Language, ModelComponent, ModelFile, Voice } from "./types";
import type { IDBPDatabase } from "idb";

// This method is bounded per the spec
// eslint-disable-next-line @typescript-eslint/unbound-method
const formatPercentage = Intl.NumberFormat("zh-HK", { style: "percent", maximumFractionDigits: 2 }).format;

export default function ModelRow({ db, language, voice }: { db: IDBPDatabase<TTSDB>; language: Language; voice: Voice }) {
	const [status, setStatus] = useState<ModelStatus>("gathering_info");
	const [missingComponents, setMissingComponents] = useState<ModelComponent[]>([]);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState<Error>();
	const [retryCounter, retry] = useReducer((n: number) => n + 1, 0);
	const abortController = useRef<AbortController>();

	useEffect(() => {
		async function getMissingComponents() {
			try {
				const availableFiles = await db.getAllFromIndex("models", "language_voice", [language, voice]);
				const components: Partial<Record<ModelComponent, ModelFile>> = {};
				for (const file of availableFiles) {
					components[file.component] = file;
				}
				const newMissingComponents: ModelComponent[] = [];
				let newStatus: ModelStatus = "latest";
				for (const component of ALL_MODEL_COMPONENTS) {
					if (!components[component]) {
						newStatus = "incomplete";
						newMissingComponents.push(component);
					}
					else if (components[component].version < CURRENT_MODEL_VERSION) {
						newStatus = "new_version_available";
						newMissingComponents.push(component);
					}
				}
				if (newStatus === "incomplete" && newMissingComponents.length === ALL_MODEL_COMPONENTS.length) {
					newStatus = "available_for_download";
				}
				setStatus(newStatus);
				setMissingComponents(newMissingComponents);
			}
			catch (error) {
				setError(new DatabaseError("Failed to get entries", { cause: error }));
			}
		}
		setError(undefined);
		void getMissingComponents();
	}, [db, language, voice, retryCounter]);

	async function downloadModel() {
		if (!missingComponents.length) return;
		setError(undefined);
		setStatus("downloading");
		setProgress(0);
		const { signal } = abortController.current = new AbortController();

		interface FetchResult {
			component: ModelComponent;
			path: ModelFile["path"];
			reader: ReadableStreamDefaultReader<Uint8Array>;
			contentLength: number;
		}

		const fetchResults = await Promise.allSettled(missingComponents.map(async (component): Promise<FetchResult> => {
			// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
			const path = `${language}/${voice}/${component}.onnx` as ModelFile["path"];
			const { ok, headers, body } = await fetch(path, { signal });
			if (!ok || !body) throw new Error("Network response was not OK");
			const reader = body.getReader();
			const length = headers.get("Content-Length");
			if (!length) throw new Error("Content-Length header is missing");
			const contentLength = +length;
			if (!contentLength || contentLength !== ~~contentLength) throw new Error("Content-Length header is invalid or zero");
			return { component, path, reader, contentLength };
		}));

		let totalLength = 0;
		const successFetches: FetchResult[] = [];
		const errors: Error[] = [];

		for (const fetchResult of fetchResults) {
			if (fetchResult.status === "fulfilled") {
				successFetches.push(fetchResult.value);
				totalLength += fetchResult.value.contentLength;
			}
			else {
				errors.push(fetchResult.reason as Error);
			}
		}

		let totalReceivedLength = 0;
		const saveResults = await Promise.allSettled(successFetches.map(async ({ component, path, reader }) => {
			let receivedLength = 0;
			const chunks: Uint8Array[] = [];
			for (;;) {
				const { done, value } = await reader.read();
				// if (signal.aborted) throw signal.reason;
				if (done) break;
				chunks.push(value);
				totalReceivedLength += value.length;
				receivedLength += value.length;
				setProgress(totalReceivedLength / totalLength);
			}
			const fileData = new Uint8Array(receivedLength);
			let position = 0;
			for (const chunk of chunks) {
				fileData.set(chunk, position);
				position += chunk.length;
			}
			try {
				await db.put("models", {
					path,
					language,
					voice,
					component,
					version: CURRENT_MODEL_VERSION,
					file: fileData.buffer,
				});
				return component;
			}
			catch (error) {
				throw new DatabaseError("Failed to save", { cause: error });
			}
		}));

		const newMissingComponents = new Set(missingComponents);
		for (const saveResult of saveResults) {
			if (saveResult.status === "fulfilled") {
				newMissingComponents.delete(saveResult.value);
			}
			else {
				errors.push(saveResult.reason as Error);
			}
		}

		const hasDownloadedComponent = newMissingComponents.size !== ALL_MODEL_COMPONENTS.length;
		setStatus(
			errors.length
				? errors.some(error => error instanceof AbortError)
					? (hasDownloadedComponent ? "cancelled_incomplete" : "cancelled_not_downloaded")
					: errors.some(error => error instanceof DatabaseError)
					? (hasDownloadedComponent ? "save_incomplete" : "save_failed")
					: (hasDownloadedComponent ? "download_incomplete" : "download_failed")
				: "latest",
		);
		setError(errors.length ? errors.length === 1 ? errors[0] : new AggregateError(errors) : undefined);
		setMissingComponents([...newMissingComponents]);
	}

	function cancelDownload() {
		abortController.current?.abort(new AbortError("The download was cancelled by the user"));
	}

	const MODEL_STATUS_ACTION: Record<ModelStatus, (() => void) | undefined> = {
		gathering_info: undefined,
		gather_failed: retry,
		available_for_download: downloadModel,
		new_version_available: downloadModel,
		incomplete: downloadModel,
		downloading: cancelDownload,
		download_failed: downloadModel,
		download_incomplete: downloadModel,
		cancelled_not_downloaded: downloadModel,
		cancelled_incomplete: downloadModel,
		save_failed: downloadModel,
		save_incomplete: downloadModel,
		latest: undefined,
	};

	useEffect(() => {
		console.error(error);
	}, [error]);

	return <li>
		<button type="button" className={`flex text-slate-700 border-b border-b-slate-500 ${MODEL_STATUS_ACTION[status] ? "btn btn-ghost" : ""}`} onClick={MODEL_STATUS_ACTION[status]}>
			{VOICE_TO_ICON[voice]}
			<div>
				<div className="text-xl">{TERMINOLOGY[language]} – {TERMINOLOGY[voice]}</div>
				{status === "downloading"
					? <div>
						<progress className="progress progress-info" value={progress} />
						{formatPercentage(progress)}
					</div>
					: <div className={MODEL_STATUS_CLASS[status]}>{MODEL_STATUS_LABEL[status]}</div>}
			</div>
			<div className="tooltip" data-tip={MODEL_STATUS_ACTION_LABEL[status]}>{MODEL_STATUS_ICON[status]}</div>
		</button>
	</li>;
}
