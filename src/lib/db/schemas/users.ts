import { relations, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable as table, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { sessions } from './sessions';
import { magicLinks } from './magic-links';
import { attendance } from './attendance';

export const users = table(
	'users',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		name: text().notNull(),
		email: text().notNull(),
		imageUrl: text('image_url'),
		createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
		updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
	},
	(t) => [uniqueIndex('users_email_idx').on(t.email)]
);

export const usersRelations = relations(users, ({ many }) => ({
	sessions: many(sessions),
	magicLinks: many(magicLinks),
	attendance: many(attendance)
}));

export type User = InferSelectModel<typeof users>;
