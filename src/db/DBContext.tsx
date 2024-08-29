import { useEffect, useReducer, createContext, useContext } from "react";

import { getDBInstance } from "./instance";

import type { TTSDatabase } from "./instance";
import type { Dispatch } from "react";

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
