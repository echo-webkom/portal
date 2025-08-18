import { db } from '$lib/db/drizzle';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	let users;

	users = await db.query.users.findMany({
		columns: {
			id: true,
			name: true,
			email: true,
			imageUrl: true,
			createdAt: true,
			activeFrom: true,
			activeTo: true,
			isPublic: true
		},
		orderBy: (users, { asc }) => [asc(users.name)]
	});

	// If the user is not logged in, we want to filter out users that are not public
	if (!locals.user) {
		users = users.filter((user) => user.isPublic);
	}

	return {
		users,
		currentUser: locals.user
	};
};
