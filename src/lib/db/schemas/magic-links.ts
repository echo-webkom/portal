import { relations } from 'drizzle-orm';
import { sqliteTable as table, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { users } from './users';

export const magicLinks = table('magic_links', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text().notNull(),
	expiresAt: integer({ mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date(Date.now() + 24 * 60 * 60 * 1000)), // Default to 24 hours from now
	createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
});

export const magicLinksRelations = relations(magicLinks, ({ one }) => ({
	user: one(users, {
		fields: [magicLinks.userId],
		references: [users.id]
	})
}));
