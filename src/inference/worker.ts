import * as g2p from "./g2p";
import infer from "./infer";

import type { Actions, Message } from "../types";

const actions: Actions = {
	infer(language, syllables) {
		// eslint-disable-next-line import/namespace
		return infer(...g2p[language](syllables), language);
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
