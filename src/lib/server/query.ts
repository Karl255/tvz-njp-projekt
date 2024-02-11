import postgres from "postgres";

const DATABASE = "tvz-njp-projekt";
const DEFAULT_DB_USERNAME = "postgres";
const DEFAULT_DB_PASSWORD = "postgres";

export const sql = postgres({
	database: DATABASE,
	username: DEFAULT_DB_USERNAME,
	password: DEFAULT_DB_PASSWORD,
	types: {
		numeric: {
			to: 0,
			from: [1700],
			serialize: (x: unknown) => "" + x,
			parse: (x: string) => +x,
		},
	},
	transform: postgres.camel,
});
