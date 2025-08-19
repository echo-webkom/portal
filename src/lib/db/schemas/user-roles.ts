import { relations, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable as table, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { users } from './users';
import { roles } from './roles';

export const userRoles = table('user_roles', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	roleId: text('role_id')
		.notNull()
		.references(() => roles.id, { onDelete: 'cascade' }),
	startDate: integer('start_date', { mode: 'timestamp' }),
	endDate: integer('end_date', { mode: 'timestamp' }),
	createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date())
});

export const userRolesRelations = relations(userRoles, ({ one }) => ({
	user: one(users, {
		fields: [userRoles.userId],
		references: [users.id]
	}),
	role: one(roles, {
		fields: [userRoles.roleId],
		references: [roles.id]
	})
}));

export type UserRole = InferSelectModel<typeof userRoles>;
