import { Dispatch, SetStateAction, useId } from "react";

export default function Radio<T extends string>({
	name,
	className,
	state,
	setState,
	value,
	label,
}: {
	name: string;
	className: string;
	state: T;
	setState: Dispatch<SetStateAction<T>>;
	value: T;
	label: string;
}) {
	const id = useId();
	return (
		<label className={"btn btn-outline text-base join-item " + className + (state === value ? " btn-active" : "")}>
			<input
				type="radio"
				className="absolute [clip:rect(0,0,0,0)] pointer-events-none"
				name={name}
				id={id}
				value={value}
				autoComplete="off"
				autoCorrect="off"
				autoCapitalize="off"
				spellCheck="false"
				checked={state === value}
				onClick={() => setState(value)}
			/>
			{label}
		</label>
	);
}
