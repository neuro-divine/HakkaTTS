import { TERMINOLOGY } from "./consts";

import type { Dispatch, SetStateAction } from "react";
import type { Terminology } from "./types";

export default function Radio<T extends Terminology>({
	name,
	className,
	state,
	setState,
	value,
}: {
	name: string;
	className: string;
	state: T;
	setState: Dispatch<SetStateAction<T>>;
	value: T;
}) {
	return (
		<label className={"btn btn-outline text-base join-item " + className + (state === value ? " btn-active" : "")}>
			<input
				type="radio"
				className="absolute [clip:rect(0,0,0,0)] pointer-events-none"
				name={name}
				value={value}
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="off"
				spellCheck="false"
				checked={state === value}
				onClick={() => setState(value)}
			/>
			{TERMINOLOGY[value]}
		</label>
	);
}
