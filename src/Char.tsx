import { useState } from "react";

import type { PronNoteArray } from "./types";

export default function Char({
	char,
	pronNoteArray,
	setSyllable,
}: {
	char: string;
	pronNoteArray: PronNoteArray;
	setSyllable: (pron: string) => void;
}) {
	const [selected, setSelected] = useState(-1);

	const resolved = selected !== -1;
	const currIndex = +resolved && selected;
	const [pron, note] = pronNoteArray[currIndex] || ["-", ""];

	return pronNoteArray.length > 1 ? (
		<div className="dropdown dropdown-hover">
			<label className={resolved ? "text-primary" : "text-accent"} tabIndex={0}>
				<ruby>
					{char}
					<rt>{pron}</rt>
					<span className="-order-1 text-sm text-slate-500">{note || "\xa0"}</span>
				</ruby>
			</label>
			<ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow bg-base-100 rounded-box [display:table]">
				{pronNoteArray.map(([pron, note], i) => (
					<li
						key={i}
						className="table-row-group"
						onClick={() => {
							setSelected(i);
							setSyllable(pron);
						}}>
						<div className={"table-row join" + (i == selected ? " active" : "")}>
							<span className="table-cell px-4 py-3 text-lg join-item whitespace-nowrap">{pron}</span>
							<span className="table-cell px-4 py-3 text-lg join-item whitespace-nowrap">{note}</span>
						</div>
					</li>
				))}
			</ul>
		</div>
	) : (
		<ruby>
			{char}
			<rt>{pron}</rt>
			<span className="-order-1 text-sm text-slate-500">{note || "\xa0"}</span>
		</ruby>
	);
}
