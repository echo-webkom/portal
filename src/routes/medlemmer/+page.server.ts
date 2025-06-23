import { db } from '$lib/db/drizzle';
import { users } from '$lib/db/schemas';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		error(401, 'Du må være innlogget for å se medlemsoversikten');
	}

	// Get all users
	const allUsers = await db
		.select({
			id: users.id,
			name: users.name,
			email: users.email,
			imageUrl: users.imageUrl,
			createdAt: users.createdAt
		})
		.from(users)
		.orderBy(users.name);

	return {
		users: allUsers,
		currentUser: locals.user
	};
};
