import { NO_AUTO_FILL, TERMINOLOGY, VOICE_TO_ICON } from "./consts";

import type { Terminology, Voice } from "./types";
import type { Dispatch } from "react";

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
	setState: Dispatch<T>;
	value: T;
}) {
	return <label className={`btn btn-outline text-base join-item ${className}${state === value ? " btn-active" : ""}`}>
		<input
			type="radio"
			className="sr-only"
			name={name}
			value={value}
			{...NO_AUTO_FILL}
			checked={state === value}
			onChange={() => setState(value)} />
		{VOICE_TO_ICON[value as Voice]}
		{TERMINOLOGY[value]}
	</label>;
}
