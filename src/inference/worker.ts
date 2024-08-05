import * as g2p from "./g2p";
import infer from "./infer";

import type { Actions, Message } from "../types";

const actions: Actions = {
	infer(language, voice, syllables) {
		// eslint-disable-next-line import/namespace
		return infer(`${language}_${voice}`, ...g2p[language](syllables));
	},
};

addEventListener("message", async ({ data: { name, args } }: MessageEvent<Message>) => {
	try {
		const result = await actions[name](...args);
		postMessage({ type: "success", result });
	}
	catch (error) {
		postMessage({ type: "error", error });
	}
});
