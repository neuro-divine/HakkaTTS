export class ServerError extends Error {
	constructor(name: string, ...args: Parameters<ErrorConstructor>) {
		super(...args);
		this.name = name;
	}
}

export class DatabaseError extends Error {
	override name = "DatabaseError";
}
