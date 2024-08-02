import type { Actions, Message } from "../types";

interface SuccessPayload {
	type: "success";
	result: ReturnType<Actions[keyof Actions]>;
}

interface ErrorPayload {
	type: "error";
	error: unknown;
}

type Payload = SuccessPayload | ErrorPayload;

let running: Message | null = null;
const queue: Message[] = [];

const worker = new Worker("./worker.js");
worker.addEventListener("message", ({ data }: MessageEvent<Payload>) => {
	if (!running) return;
	const { resolve, reject } = running;
	const nextMessage = queue.shift();
	if (nextMessage) {
		postMessage(nextMessage);
	}
	else {
		running = null;
	}
	if (data.type === "success") {
		resolve(data.result);
	}
	else {
		reject(data.error);
	}
});

function postMessage(message: Message) {
	const { name, args } = running = message;
	worker.postMessage({ name, args });
}

const allActions: (keyof Actions)[] = ["infer"];

const API = {} as Actions;
for (const action of allActions) {
	API[action] = registerAction(action);
}
export default API;

function registerAction<K extends keyof Actions>(name: K): Actions[K] {
	return (...args: Parameters<Actions[K]>) =>
		new Promise((resolve, reject) => {
			const message: Message = { name, args, resolve, reject };
			if (running) {
				queue.push(message);
			}
			else {
				postMessage(message);
			}
		});
}
