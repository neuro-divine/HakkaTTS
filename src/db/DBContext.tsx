import { useEffect, useReducer, createContext, useContext } from "react";

import { openDB } from "idb";

import type { TTSDB } from "../types";
import type { IDBPDatabase } from "idb";
import type { Dispatch } from "react";

type TTSDatabase = IDBPDatabase<TTSDB>;
let dbInstance: TTSDatabase | undefined;
let pendingDBInstance: Promise<TTSDatabase> | undefined;

function getDBInstance() {
	async function createDBInstance() {
		try {
			return dbInstance = await openDB<TTSDB>("TTS", 1, {
				upgrade(db) {
					if (!db.objectStoreNames.contains("models")) {
						const store = db.createObjectStore("models", { keyPath: "path" });
						store.createIndex("language_voice", ["language", "voice"]);
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

interface DBState {
	db: TTSDatabase | undefined;
	error: Error | undefined;
	retryCounter: number;
}

type DBAction = { type: "init" | "retry" } | { type: "success"; payload: TTSDatabase } | { type: "error"; payload: Error };

function dbReducer(state: DBState, action: DBAction): DBState {
	switch (action.type) {
		case "init":
			return { ...state, db: undefined, error: undefined };
		case "success":
			return { ...state, db: action.payload, error: undefined };
		case "error":
			return { ...state, db: undefined, error: action.payload };
		case "retry":
			return { ...state, retryCounter: state.retryCounter + 1 };
		default:
			return state;
	}
}

const defaultDBState: DBState = {
	db: undefined,
	error: undefined,
	retryCounter: 0,
};

const DBContext = createContext<[DBState, Dispatch<DBAction>]>([defaultDBState, () => defaultDBState]);

export function DBProvider({ children }: { children: JSX.Element }) {
	return <DBContext.Provider value={useReducer(dbReducer, defaultDBState)}>{children}</DBContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDB() {
	const [{ db, error, retryCounter }, dispatch] = useContext(DBContext);

	useEffect(() => {
		async function loadDB() {
			dispatch({ type: "init" });
			try {
				dispatch({ type: "success", payload: await getDBInstance() });
			}
			catch (error) {
				dispatch({ type: "error", payload: error as Error });
			}
		}
		void loadDB();
	}, [retryCounter, dispatch]);

	return { db, error, retry: () => dispatch({ type: "retry" }) };
}
