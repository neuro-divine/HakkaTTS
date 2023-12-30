import { PronToNoteMap, WordsFile } from "./types";

type Node = Map<string, Node> & { v?: PronToNoteMap };

export default class Resource {
	t: Node = new Map();

	constructor(res: WordsFile) {
		const data = new Map<string, PronToNoteMap>();
		for (const { char, pron } of res) {
			const map = data.get(char);
			if (map) {
				if (!map.has(pron)) map.set(pron, "");
			} else data.set(char, new Map([[pron, ""]]));
		}
		for (const line of data) this.set(...line);
	}

	get(s: string | string[]): [string, PronToNoteMap][] {
		const t = this.t;
		const r: [string, PronToNoteMap | undefined, PronToNoteMap[]][] = Array.from(s, c => {
			const v = t.get(c)?.v;
			return [c, v, v ? [v] : []];
		});
		for (let i = 0; i < r.length; i++) {
			const u = t.get(r[i][0]);
			if (!u) continue;
			for (let t = u, j = i + 1; j < r.length; j++) {
				const u = t.get(r[j][0]);
				if (!u) break;
				if ((t = u).v) {
					const l = j - i;
					for (const [p] of t.v)
						for (let d = p.split(" "), k = i; k <= j; k++) {
							const s = r[k][2];
							const v = d[k - i];
							if (!(l in s)) s[l] = new Map([[v, ""]]);
							else s[l].set(v, "");
						}
				}
			}
		}
		return r.map(([c, m, s]) => [c, new Map(s.reverse().flatMap(v => Array.from(v, ([p]) => [p.trim(), m?.get(p) || ""])))]);
	}

	set(k: string, v: PronToNoteMap) {
		if (!k) return;
		const u = Array.from(k).reduce((t, c) => {
			let u = t.get(c);
			if (!u) t.set(c, (u = new Map()));
			return u;
		}, this.t);
		const n = u.v;
		if (n) v.forEach((m, k) => n.set(k, n.has(k) ? n.get(k) + (n.get(k) && m ? "、" : "") + m : m));
		else u.v = v;
	}
}
