import { useEffect, useReducer, useState } from "react";

import { ALL_INFERENCE_MODES, DOWNLOAD_STATUS_PRIORITY } from "./consts";

import type { ActualDownloadStatus, InferenceMode, DownloadState } from "./types";

const currentDownloadState = new Map<string, ActualDownloadStatus>();

function downloadStateReducer(_: ActualDownloadStatus, { inferenceMode, language, voice, status }: DownloadState): ActualDownloadStatus {
	currentDownloadState.set(`${inferenceMode}_${language}_${voice}`, status);
	const allStatus = new Set(currentDownloadState.values());
	return DOWNLOAD_STATUS_PRIORITY.find(status => allStatus.has(status)) || "latest";
}

export function useDownloadState() {
	return useReducer(downloadStateReducer, "latest");
}

export function useInferenceMode() {
	const [inferenceMode, setInferenceMode] = useState(() => {
		const searchParams = new URLSearchParams(location.search);
		const mode_sugar = ALL_INFERENCE_MODES.find(mode => searchParams.has(mode));
		if (mode_sugar) return mode_sugar;
		const mode = searchParams.get("mode") as InferenceMode;
		return ALL_INFERENCE_MODES.includes(mode) ? mode : "online";
	});
	useEffect(() => {
		history.replaceState(null, document.title, `?${String(new URLSearchParams({ mode: inferenceMode }))}`);
	}, [inferenceMode]);
	return [inferenceMode, setInferenceMode] as const;
}
