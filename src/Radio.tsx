import { NO_AUTO_FILL, TERMINOLOGY, VOICE_TO_ICON } from "./consts";

import type { Terminology, Voice } from "./types";
import type { Dispatch } from "react";

export default function Radio<T extends Terminology>({
	name,
	className,
	activeClassName = "",
	nonActiveClassName = "",
	state,
	setState,
	value,
}: {
	name: string;
	className: string;
	activeClassName?: string;
	nonActiveClassName?: string;
	state: T;
	setState: Dispatch<T>;
	value: T;
}) {
	return <label className={`${className} ${state === value ? activeClassName : nonActiveClassName}`}>
		<input
			type="radio"
			className="sr-only"
			name={name}
			value={value}
			{...NO_AUTO_FILL}
			checked={state === value}
			onChange={() => setState(value)} />
		{VOICE_TO_ICON[value as Voice]}
		<div>
			<div>{TERMINOLOGY[value]}</div>
			<div className="text-[60%]">{value[0].toUpperCase() + value.slice(1)}</div>
		</div>
	</label>;
}
