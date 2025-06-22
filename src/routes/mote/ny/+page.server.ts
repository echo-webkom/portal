import { db } from '$lib/db/drizzle';
import { meetings } from '$lib/db/schemas';
import { fail, redirect, error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Du må være innlogget for å opprette møter');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			error(401, 'Du må være innlogget for å opprette møter');
		}
		const data = await request.formData();
		const title = data.get('title') as string;
		const description = data.get('description') as string;
		const date = data.get('date') as string;
		const startTime = data.get('startTime') as string;
		const endTime = data.get('endTime') as string;

		if (!title || !date || !startTime || !endTime) {
			return fail(400, {
				message: 'Alle påkrevde felt må fylles ut',
				title,
				description,
				date,
				startTime,
				endTime
			});
		}

		// Combine date and time
		const startDateTime = new Date(`${date}T${startTime}`);
		const endDateTime = new Date(`${date}T${endTime}`);

		// Validate that end time is after start time
		if (endDateTime <= startDateTime) {
			return fail(400, {
				message: 'Sluttid må være etter starttid',
				title,
				description,
				date,
				startTime,
				endTime
			});
		}

		await db.insert(meetings).values({
			title,
			description: description || null,
			startTime: startDateTime,
			endTime: endDateTime
		});

		redirect(302, '/');
	}
};
