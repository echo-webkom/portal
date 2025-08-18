import { db } from '$lib/db/drizzle';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const users = await db.query.users.findMany({
		columns: {
			id: true,
			name: true,
			email: true,
			imageUrl: true,
			createdAt: true,
			activeFrom: true,
			activeTo: true
		},
		orderBy: (users, { asc }) => [asc(users.name)]
	});

	return {
		users,
		currentUser: locals.user
	};
};
