import { useReducer } from "react";

import { MODEL_STATUS_PRIORITY } from "./consts";

import type { ActualModelStatus, ModelLanguageAndVoice, ModelWithStatus } from "./types";

const currentModelsStatus = new Map<ModelLanguageAndVoice, ActualModelStatus>();

function modelsStatusReducer(_: ActualModelStatus, { model, status }: ModelWithStatus): ActualModelStatus {
	currentModelsStatus.set(model, status);
	const allStatus = new Set(currentModelsStatus.values());
	return MODEL_STATUS_PRIORITY.find(status => allStatus.has(status)) || "latest";
}

export function useModelsStatus() {
	return useReducer(modelsStatusReducer, "latest");
}
