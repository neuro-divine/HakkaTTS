import { GrResume } from "react-icons/gr";
import { MdCancel, MdFileDownload, MdFileDownloadDone, MdMan, MdOutlinePending, MdRefresh, MdWoman } from "react-icons/md";

import type { Language, ModelComponent, ModelStatus, Terminology, Voice } from "./types";

export const TERMINOLOGY: Record<Terminology, string> = {
	waitau: "圍頭話",
	hakka: "客家話",
	male: "男聲",
	female: "女聲",
};

export const VOICE_TO_ICON: Record<Voice, JSX.Element> = {
	male: <MdMan />,
	female: <MdWoman />,
};

export const ALL_LANGUAGES: readonly Language[] = ["waitau", "hakka"];
export const ALL_VOICES: readonly Voice[] = ["male", "female"];
export const ALL_MODEL_COMPONENTS: readonly ModelComponent[] = ["enc_p", "emb", "sdp", "flow", "dec"];

export const CURRENT_MODEL_VERSION = 20240801;

export const MODEL_STATUS_LABEL: Record<ModelStatus, string> = {
	gathering_info: "正在收集檔案狀態……",
	gather_failed: "檔案狀態收集失敗：資料庫出錯",
	available_for_download: "可供下載",
	new_version_available: "有新版本可供下載",
	incomplete: "模型不完整",
	downloading: "下載中……",
	download_failed: "下載失敗：網絡錯誤",
	download_incomplete: "下載不完整：網絡錯誤",
	cancelled_not_downloaded: "下載已被取消；模型尚未下載",
	cancelled_incomplete: "下載已被取消；模型不完整",
	save_failed: "下載失敗：儲存至資料庫時發生錯誤",
	save_incomplete: "下載不完整：儲存至資料庫時發生錯誤",
	latest: "已經為最新版本",
};

export const MODEL_STATUS_CLASS: Record<ModelStatus, string> = {
	gathering_info: "text-info",
	gather_failed: "text-error",
	available_for_download: "text-info",
	new_version_available: "text-info",
	incomplete: "text-error",
	downloading: "text-info",
	download_failed: "text-error",
	download_incomplete: "text-error",
	cancelled_not_downloaded: "text-error",
	cancelled_incomplete: "text-error",
	save_failed: "text-error",
	save_incomplete: "text-error",
	latest: "text-success",
};

export const MODEL_STATUS_ICON: Record<ModelStatus, JSX.Element> = {
	gathering_info: <MdOutlinePending />,
	gather_failed: <MdRefresh />,
	available_for_download: <MdFileDownload />,
	new_version_available: <MdFileDownload />,
	incomplete: <GrResume />,
	downloading: <MdCancel />,
	download_failed: <MdRefresh />,
	download_incomplete: <MdRefresh />,
	cancelled_not_downloaded: <MdFileDownload />,
	cancelled_incomplete: <GrResume />,
	save_failed: <MdRefresh />,
	save_incomplete: <MdRefresh />,
	latest: <MdFileDownloadDone />,
};

export const MODEL_STATUS_ACTION_LABEL: Record<ModelStatus, string | null> = {
	gathering_info: null,
	gather_failed: "重試",
	available_for_download: "下載",
	new_version_available: "下載",
	incomplete: "繼續下載",
	downloading: "取消下載",
	download_failed: "重試",
	download_incomplete: "重試",
	cancelled_not_downloaded: "下載",
	cancelled_incomplete: "繼續下載",
	save_failed: "重試",
	save_incomplete: "重試",
	latest: null,
};

export const NO_AUTO_FILL = {
	autoComplete: "off",
	autoCorrect: "off",
	autoCapitalize: "off",
	spellCheck: "false",
} as const;

export class DatabaseError extends Error {
	override name = "DatabaseError";
}

export class AbortError extends Error {
	override name = "AbortError";
}
