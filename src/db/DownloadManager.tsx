import { forwardRef, useEffect } from "react";

import { MdClose, MdOutlineDownloadForOffline, MdRefresh } from "react-icons/md";

import { useDB } from "./DBContext";
import DownloadRow from "./DownloadRow";
import { ALL_LANGUAGES, ALL_VOICES, DOWNLOAD_TYPE_LABEL } from "../consts";

import type { OfflineInferenceModeState, SetDownloadStatus } from "../types";

interface DownloadManagerProps extends OfflineInferenceModeState, SetDownloadStatus {}

const DownloadManager = forwardRef<HTMLDialogElement, DownloadManagerProps>(function DownloadManager({ inferenceMode, setDownloadState }, ref) {
	const { db, error, retry } = useDB();
	useEffect(() => {
		if (error) console.error(error);
	}, [error]);

	return <dialog ref={ref} className="modal modal-bottom sm:modal-middle">
		<div className="modal-box p-0 flex flex-col sm:max-w-3xl h-[calc(100%-5rem)]">
			<form method="dialog">
				<button type="submit" className="btn btn-ghost w-14 h-14 min-h-14 text-4.5xl absolute right-3 top-3 text-slate-500 hover:bg-opacity-10" aria-label="關閉">
					<span>
						<MdClose />
					</span>
				</button>
			</form>
			<h3 className="flex items-center gap-2 mx-6 mt-6 mb-4.5">
				<MdOutlineDownloadForOffline size="1.125em" />
				{DOWNLOAD_TYPE_LABEL[inferenceMode]}下載
			</h3>
			<hr />
			<div className={`flex-1 overflow-x-hidden overflow-y-auto${db ? "" : " flex items-center justify-center"}`}>
				{error
					? <div className="text-center">
						<h4>資料庫載入失敗</h4>
						<div className="mt-2 mb-3">
							{error.name}
							{error.message && <>
								{": "}
								<code>{error.message}</code>
							</>}
						</div>
						<button type="button" className="btn btn-info text-xl text-neutral-content" onClick={retry}>
							<MdRefresh size="1.25em" />重試
						</button>
					</div>
					: db
					? <ul className="flex flex-col">
						{ALL_LANGUAGES.flatMap(language =>
							ALL_VOICES.map(voice =>
								<DownloadRow
									key={`${inferenceMode}_${language}_${voice}`}
									db={db}
									inferenceMode={inferenceMode}
									language={language}
									voice={voice}
									setDownloadState={setDownloadState} />
							)
						)}
					</ul>
					: <h4>資料庫載入中……</h4>}
			</div>
		</div>
	</dialog>;
});

export default DownloadManager;
