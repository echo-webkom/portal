import { relations, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable as table, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { users } from './users';

export const sessions = table('sessions', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text().notNull(),
	expiresAt: integer({ mode: 'timestamp' }).notNull(),
	createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export type Session = InferSelectModel<typeof sessions>;
