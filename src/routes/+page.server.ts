import { db } from '$lib/db/drizzle';
import { meetings } from '$lib/db/schemas';
import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { MagicLinkService } from '$lib/services/magic-link-service';

export const load: PageServerLoad = async () => {
	// Fetch all meetings ordered by start time
	const allMeetings = await db.select().from(meetings).orderBy(meetings.startTime);

	// Find the next upcoming meeting
	const now = new Date();
	const nextMeeting = allMeetings.find((meeting) => meeting.startTime > now) || null;

	return {
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
