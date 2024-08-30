import { useCallback, useEffect, useRef, useState } from "react";

import { MdContentCopy, MdLink } from "react-icons/md";

export default function CopyURLRow({ urlWithQuery }: { urlWithQuery: string }) {
	const [copyState, setCopyState] = useState<"copied" | "failed">();
	const prevCopyState = useRef<"copied" | "failed">();
	useEffect(() => {
		prevCopyState.current = copyState;
	}, [copyState]);
	const onClick = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(urlWithQuery);
			setCopyState("copied");
		}
		catch {
			setCopyState("failed");
		}
		setTimeout(() => setCopyState(undefined), 2500);
	}, [urlWithQuery]);

	return <li className="contents">
		<button type="button" className={`flex items-center text-left pl-2 pr-4 py-4 border-b border-b-slate-300 text-slate-700 transition-colors hover:bg-base-content hover:bg-opacity-10`} onClick={onClick}>
			<div className="text-2xl flex items-center px-2">
				<MdLink size="1.25em" />
			</div>
			<div className="flex-1 flex flex-col gap-1">
				<div className="text-xl font-medium">複製包含目前設定的連結</div>
				<div className="text-sm text-slate-500 break-all">{urlWithQuery}</div>
			</div>
			<div
				className={`text-2xl flex items-center px-2 tooltip tooltip-left${copyState ? ` ${copyState === "copied" ? "tooltip-primary" : "tooltip-error"} tooltip-open` : ""} before:text-lg`}
				data-tip={(copyState || prevCopyState.current) && ((copyState || prevCopyState.current) === "copied" ? "已複製至剪貼簿" : "無法複製至剪貼簿")}>
				<MdContentCopy size="1.25em" />
			</div>
		</button>
	</li>;
}
