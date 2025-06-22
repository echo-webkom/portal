import { db } from '$lib/db/drizzle';
import { users, meetings, attendance, attendanceStatus } from '$lib/db/schemas';
import { eq } from 'drizzle-orm';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { MagicLinkService } from '$lib/services/magic-link-service';

export const load: PageServerLoad = async () => {
	// Fetch all users
	const allUsers = await db.select().from(users).orderBy(users.name);

	// Fetch all meetings ordered by start time
	const allMeetings = await db.select().from(meetings).orderBy(meetings.startTime);

	// Find the next upcoming meeting
	const now = new Date();
	const nextMeeting = allMeetings.find((meeting) => meeting.startTime > now) || null;

	// Fetch all attendance statuses
	const allStatuses = await db.select().from(attendanceStatus).orderBy(attendanceStatus.name);

	// Fetch all attendance records with status
	const allAttendance = await db
		.select({
			userId: attendance.userId,
			meetingId: attendance.meetingId,
			statusName: attendanceStatus.name,
			attendanceId: attendance.id
		})
		.from(attendance)
		.innerJoin(attendanceStatus, eq(attendance.attendanceStatusId, attendanceStatus.id));

	// Create a map for quick lookup of attendance status
	const attendanceMap = new Map<string, { status: string; attendanceId: string }>();
	allAttendance.forEach((record) => {
		const key = `${record.userId}-${record.meetingId}`;
		attendanceMap.set(key, {
			status: record.statusName,
			attendanceId: record.attendanceId
		});
	});

	return {
		users: allUsers,
		meetings: allMeetings,
		attendanceMap: Object.fromEntries(attendanceMap),
		statuses: allStatuses,
		nextMeeting
	};
};

export const actions: Actions = {
	requestMagicLink: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email')?.toString();

		if (!email) {
			return fail(400, { error: 'E-post er påkrevd' });
		}

		// Get the base URL for the magic link
		const baseUrl = `${url.protocol}//${url.host}`;

		// Send the magic link email
		const result = await MagicLinkService.sendMagicLink(email, baseUrl);

		if (!result.success) {
			return fail(400, { error: result.error });
		}

		return { success: true };
	}
};
