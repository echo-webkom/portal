import { json, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { attendance } from '$lib/db/schemas';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		error(401, 'Unauthorized');
	}

	try {
		const { userId, meetingId, statusId, attendanceId } = await request.json();

		if (!userId || !meetingId || !statusId) {
			error(400, 'Missing required fields');
		}

		if (attendanceId) {
			// Update existing attendance record
			await db
				.update(attendance)
				.set({
					attendanceStatusId: statusId,
					updatedAt: new Date()
				})
				.where(eq(attendance.id, attendanceId));
		} else {
			// Create new attendance record
			await db.insert(attendance).values({
				userId,
				meetingId,
				attendanceStatusId: statusId
			});
		}

		return json({ success: true });
	} catch (err) {
		console.error('Error updating attendance:', err);
		error(500, 'Failed to update attendance');
	}
};
