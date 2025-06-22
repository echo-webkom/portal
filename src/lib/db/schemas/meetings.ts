import { relations, type InferSelectModel } from 'drizzle-orm';
import { sqliteTable as table, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { attendance } from './attendance';

export const meetings = table('meetings', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	title: text().notNull(),
	description: text(),
	startTime: integer({ mode: 'timestamp' }).notNull(),
	endTime: integer({ mode: 'timestamp' }).notNull(),
	createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
});

export const meetingsRelations = relations(meetings, ({ many }) => ({
	attendees: many(attendance)
}));

export type Meeting = InferSelectModel<typeof meetings>;
