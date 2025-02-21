import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { MdError, MdLanguage, MdRecordVoiceOver, MdSettings, MdSwapHoriz } from "react-icons/md";

import { DOWNLOAD_STATUS_INDICATOR_CLASS, LANGUAGE_TO_TEXT_COLOR_CLASS, NO_AUTO_FILL, TERMINOLOGY } from "./consts";
import { DBProvider } from "./db/DBContext";
import { useDownloadState, useQueryOptions } from "./hooks";
import LanguageSelectionDialog from "./LanguageSelectionDialog";
import { segment } from "./parse";
import Radio from "./Radio";
import SentenceCard from "./SentenceCard";
import SettingsDialog from "./SettingsDialog";

import type { SettingsDialogPage, Sentence } from "./types";

export default function App() {
	const queryOptions = useQueryOptions();
	const { language, voice, inferenceMode, voiceSpeed, hakkaToneMode, setLanguage, setVoice } = queryOptions;
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
		if (!textArea.current || !language) return;
		setSentences([
			...textArea.current.value.split("\n").flatMap(text => (text.trim() ? [{ language, voice, inferenceMode, voiceSpeed, syllables: segment(text) }] : [])),
			...sentences,
		]);
		textArea.current.value = "";
		resizeElements();
	}, [textArea, language, voice, inferenceMode, voiceSpeed, sentences, resizeElements]);

	useEffect(() => {
		if (!textArea.current) return;
		const currTextArea = textArea.current;
		const observer = new ResizeObserver(resizeElements);
		observer.observe(currTextArea);
		return () => observer.unobserve(currTextArea);
	}, [textArea, resizeElements]);

	const languageSelectionDialog = useRef<HTMLDialogElement>(null);
	const showLanguageSelectionDialog = useCallback(() => {
		const { current: dialog } = languageSelectionDialog;
		if (dialog && !dialog.open) {
			setLanguage(undefined);
			dialog.inert = true;
			dialog.showModal();
			dialog.inert = false;
		}
	}, [setLanguage]);
	useEffect(() => {
		if (!language) showLanguageSelectionDialog();
	}, [language, showLanguageSelectionDialog]);

	const [currSettingsDialogPage, setCurrSettingsDialogPage] = useState<SettingsDialogPage>(null);
	const settingsDialog = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const { current: dialog } = settingsDialog;
		if (dialog && !dialog.open && currSettingsDialogPage) {
			dialog.inert = true;
			dialog.showModal();
			dialog.inert = false;
			dialog.addEventListener("close", () => setCurrSettingsDialogPage(null), { once: true });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settingsDialog.current, currSettingsDialogPage, setCurrSettingsDialogPage]);

	const [downloadState, setDownloadState] = useDownloadState();
	const currInferenceModeDownloadState = inferenceMode === "online" ? "latest" : downloadState.get(inferenceMode)!;

	return <DBProvider>
		<div>
			<div>
				<div className="flex items-top gap-3 mb-4">
					<div>
						<div className="flex items-center gap-1 text-slate-700 text-lg font-semibold mb-1 tracking-widest">
							<MdLanguage className="relative top-[1px]" />
							語言
						</div>
						<div className={`flex flex-col items-center justify-center h-12 text-2xl/tight font-semibold ${language ? LANGUAGE_TO_TEXT_COLOR_CLASS[language] : "text-[#318ab6]"}`}>
							<div>{TERMINOLOGY[language!] || "未選擇"}</div>
							<div className={language ? "text-[60%]" : "text-[50%]"}>{language ? language[0].toUpperCase() + language.slice(1) : "Unselected"}</div>
						</div>
					</div>
					<div>
						<button type="button" className="btn btn-ghost max-sm:btn-sm max-sm:px-2.5 relative flex-col flex-nowrap gap-0 text-lg whitespace-nowrap h-20 min-h-20 text-slate-500 font-extrabold hover:bg-opacity-10" onClick={showLanguageSelectionDialog}>
							<MdSwapHoriz size="2em" />
							{language ? "更改語言" : "選擇語言"}
							{createPortal(
								<LanguageSelectionDialog ref={languageSelectionDialog} queryOptions={queryOptions} />,
								document.body,
							)}
						</button>
					</div>
					<div>
						<div className="flex items-center gap-1 text-slate-700 text-lg font-semibold ms-0.5 mb-0.5 tracking-widest">
							<MdRecordVoiceOver />
							聲線
						</div>
						<div className="join" role="group" aria-label="選擇聲線">
							<Radio
								name="btnvoice"
								className="btn join-item text-base/tight border-[#2189f1] hover:bg-[#126fcb] hover:border-[#126fcb] hover:text-base-100 border-r-0"
								activeClassName="bg-[#2189f1] text-base-100"
								nonActiveClassName="btn-outline bg-white text-[#126fcb]"
								state={voice}
								setState={setVoice}
								value="male" />
							<Radio
								name="btnvoice"
								className="btn join-item text-base/tight border-[#f553a3] hover:bg-[#d13f87] hover:border-[#d13f87] hover:text-base-100 border-l-0"
								activeClassName="bg-[#f553a3] text-base-100"
								nonActiveClassName="btn-outline bg-white text-[#d13f87]"
								state={voice}
								setState={setVoice}
								value="female" />
						</div>
					</div>
					<div>
						<button type="button" className="btn btn-ghost max-sm:btn-sm max-sm:px-2.5 relative flex-col flex-nowrap gap-0 text-base whitespace-nowrap h-20 min-h-20 text-slate-500 font-extrabold hover:bg-opacity-10" onClick={() => setCurrSettingsDialogPage("settings")}>
							{currInferenceModeDownloadState !== "latest" && <MdError size="1.5em" className={`absolute -top-1 -right-1 ${DOWNLOAD_STATUS_INDICATOR_CLASS[currInferenceModeDownloadState]}`} />}
							<MdSettings size="2em" />
							設定
						</button>
						{createPortal(
							<SettingsDialog
								ref={settingsDialog}
								currSettingsDialogPage={currSettingsDialogPage}
								setCurrSettingsDialogPage={setCurrSettingsDialogPage}
								queryOptions={queryOptions}
								downloadState={downloadState}
								setDownloadState={setDownloadState} />,
							document.body,
						)}
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
					<SentenceCard
						key={sentences.length - i}
						sentence={sentence}
						hakkaToneMode={hakkaToneMode}
						setDownloadState={setDownloadState}
						currSettingsDialogPage={currSettingsDialogPage}
						setCurrSettingsDialogPage={setCurrSettingsDialogPage} />
				))}
			</div>
		</div>
	</DBProvider>;
}
