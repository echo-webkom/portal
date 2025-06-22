import { relations } from 'drizzle-orm';
import { sqliteTable as table, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { attendance } from './attendance';

export const attendanceStatus = table('attendance_status', {
	id: text()
		.primaryKey()
		.$defaultFn(() => nanoid()),
	name: text().notNull(),
	createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
	updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
});

export const attendanceStatusRelations = relations(attendanceStatus, ({ many }) => ({
	attendanceRecords: many(attendance)
}));
