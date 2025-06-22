import { redirect } from '@sveltejs/kit';
import { users, meetings, attendance, attendanceStatus } from '$lib/db/schemas';
import type { PageServerLoad } from './$types';
import { db } from '$lib/db/drizzle';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/');
	}

	// Fetch all users, meetings, and statuses
	const [allUsers, allMeetings, allStatuses] = await Promise.all([
		db.select().from(users).orderBy(users.name),
		db.select().from(meetings).orderBy(meetings.startTime),
		db.select().from(attendanceStatus)
	]);

	// Fetch all attendance records
	const allAttendance = await db.select().from(attendance);

	// Create a map for quick lookup: userId-meetingId -> {status, attendanceId}
	const attendanceMap = new Map<string, { status: string; attendanceId: string }>();

	for (const record of allAttendance) {
		const status = allStatuses.find((s) => s.id === record.attendanceStatusId);
		if (status) {
			attendanceMap.set(`${record.userId}-${record.meetingId}`, {
				status: status.name,
				attendanceId: record.id
			});
		}
	}

	return {
		users: allUsers,
		meetings: allMeetings.map((meeting) => ({
			...meeting,
			startTime: new Date(meeting.startTime)
		})),
		attendanceMap: Object.fromEntries(attendanceMap),
		statuses: allStatuses
	};
};
