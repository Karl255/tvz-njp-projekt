import type { User, UserEntity } from "$lib/model/user.model";
import { sql } from "$lib/server/query";

export const userRepo = {
	getAll: async (): Promise<User[]> => {
		const users = await sql<UserEntity[]>`
			SELECT id, email, is_admin
			FROM "user"
		`;

		return users;
	},

	getOneByEmail: async (email: string): Promise<UserEntity | null> => {
		const users = await sql<UserEntity[]>`
			SELECT id, email, password_hash, is_admin
			FROM "user"
			WHERE email = ${email}
		`;

		return users[0] ?? null;
	},

	create: async (email: string, passwordHash: string): Promise<User> => {
		const users = await sql<User[]>`
			INSERT INTO "user" (email, password_hash, is_admin)
			VALUES (${email}, ${passwordHash}, FALSE)
			RETURNING id, email, is_admin
		`;

		console.info(`Created ${users.length} users with email ${email}`);

		return users[0];
	},

	update: async (userId: number, isAdmin: boolean | null): Promise<User | null> => {
		const users = await sql<User[]>`
			UPDATE "user"
			SET is_admin = COALESCE(${isAdmin}, is_admin)
			WHERE id = ${userId}
			RETURNING id, email, is_admin
		`;

		return users[0] ?? null;
	},

	delete: async (userId: number): Promise<void> => {
		type Id = { id: number };
		const toNumberArray = (ids: Id[]) => ids.map(({ id }) => id);

		const accountIds = toNumberArray(await sql<Id[]>`SELECT id FROM account WHERE user_id = ${userId}`);
		const labelIds = toNumberArray(await sql<Id[]>`SELECT id FROM label WHERE user_id = ${userId}`);

		await sql`
			DELETE FROM transaction_label
			WHERE label_id IN ${sql(labelIds)}
		`;

		await sql`
			DELETE FROM label
			WHERE id IN ${sql(labelIds)}
		`;

		await sql`
			DELETE FROM transaction
			WHERE account_id IN ${sql(accountIds)}
		`;

		await sql`
			DELETE FROM account
			WHERE id IN ${sql(accountIds)}
		`;

		await sql`
			DELETE FROM "user"
			WHERE id = ${userId}
		`;
	},
};
