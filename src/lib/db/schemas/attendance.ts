import { relations } from 'drizzle-orm';
import { sqliteTable as table, text, integer, index } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';
import { users } from './users';
import { meetings } from './meetings';
import { attendanceStatus } from './attendance-status';

export const attendance = table(
	'attendance',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => nanoid()),
		userId: text().notNull(),
		meetingId: text().notNull(),
		attendanceStatusId: text().notNull(),
		createdAt: integer({ mode: 'timestamp' }).$defaultFn(() => new Date()),
		updatedAt: integer({ mode: 'timestamp' }).$onUpdateFn(() => new Date())
	},
	(t) => [index('attendance_user_meeting_idx').on(t.userId, t.meetingId)]
);

export const attendanceRelations = relations(attendance, ({ one }) => ({
	user: one(users, {
		fields: [attendance.userId],
		references: [users.id]
	}),
	meeting: one(meetings, {
		fields: [attendance.meetingId],
		references: [meetings.id]
	}),
	status: one(attendanceStatus, {
		fields: [attendance.attendanceStatusId],
		references: [attendanceStatus.id]
	})
}));
