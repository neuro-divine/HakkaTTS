import { NO_AUTO_FILL, TERMINOLOGY } from "./consts";

import type { Terminology } from "./types";
import type { Dispatch, SetStateAction } from "react";

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
	return <label className={`btn btn-outline text-base join-item ${className}${state === value ? " btn-active" : ""}`}>
		<input
			type="radio"
			className="sr-only"
			name={name}
			value={value}
			{...NO_AUTO_FILL}
			checked={state === value}
			onChange={() => setState(value)} />
		{TERMINOLOGY[value]}
	</label>;
}
