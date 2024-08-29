import { openDB } from "idb";

import type { DatabaseStore, TTSDB } from "../types";
import type { IDBPDatabase } from "idb";

export type TTSDatabase = IDBPDatabase<TTSDB>;
export let dbInstance: TTSDatabase | undefined;
export let pendingDBInstance: Promise<TTSDatabase> | undefined;

export const ALL_DATABASE_STORES: readonly DatabaseStore[] = ["models", "models_status", "audios", "audios_status"];

export function getDBInstance() {
	async function createDBInstance() {
		try {
			return dbInstance = await openDB<TTSDB>("TTS", 3, {
				upgrade(db) {
					for (const store of ALL_DATABASE_STORES) {
						if (!db.objectStoreNames.contains(store)) {
							db.createObjectStore(store, { keyPath: "path" });
						}
					}
				},
			});
		}
		finally {
			pendingDBInstance = undefined;
		}
	}
	return dbInstance || (pendingDBInstance ||= createDBInstance());
}
