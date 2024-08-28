import type { Edge, PronToNoteMap, WordsFile } from "./types";

type Node = Map<string, Node> & { v?: PronToNoteMap };

export default class Resource {
	t: Node = new Map();

	constructor(res: WordsFile) {
		const data = new Map<string, PronToNoteMap>();
		for (const { char, pron } of res) {
			const map = data.get(char);
			if (map) {
				if (!map.has(pron)) map.set(pron, "");
			}
			else data.set(char, new Map([[pron, ""]]));
		}
		for (const line of data) this.set(...line);
	}

	get(syllables: string[]): Edge[] {
		return syllables.flatMap((_, i) => {
			const edges: Edge[][] = [];
			let u: Node | undefined = this.t;
			for (let j = i; j < syllables.length; j++) {
				u = u.get(syllables[j]);
				if (!u) break;
				if (u.v) edges.push(Array.from(u.v, ([pron, note]) => ({ start: i, end: j + 1, pron, note })));
			}
			return edges.reverse().flat();
		});
	}

	set(k: string, v: PronToNoteMap) {
		if (!k) return;
		const u = Array.from(k).reduce((t, c) => {
			let u = t.get(c);
			if (!u) t.set(c, u = new Map());
			return u;
		}, this.t);
		const n = u.v;
		if (n) v.forEach((m, k) => n.set(k, n.has(k) ? n.get(k) + (n.get(k) && m ? "、" : "") + m : m));
		else u.v = v;
	}
}
