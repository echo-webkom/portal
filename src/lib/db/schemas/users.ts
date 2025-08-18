import { relations, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable as table, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { sessions } from './sessions';
import { magicLinks } from './magic-links';
import { attendance } from './attendance';
import { roles } from './roles';
import { userRoles } from './user-roles';

export const users = table(
	'users',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		name: text().notNull(),
		email: text().notNull(),
		imageUrl: text('image_url'),
		activeFrom: integer('active_from', { mode: 'timestamp' }),
		activeTo: integer('active_to', { mode: 'timestamp' }),
		isPublic: integer('is_public', { mode: 'boolean' }).default(false),
		currentRoleId: text('current_role_id'),
		createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
		updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
	},
	(t) => [uniqueIndex('users_email_idx').on(t.email)]
);

export const usersRelations = relations(users, ({ many, one }) => ({
	sessions: many(sessions),
	magicLinks: many(magicLinks),
	attendance: many(attendance),
	userRoles: many(userRoles),
	currentRole: one(roles, {
		fields: [users.currentRoleId],
		references: [roles.id]
	})
}));

export type User = InferSelectModel<typeof users>;
