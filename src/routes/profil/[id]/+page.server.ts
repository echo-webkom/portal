import { db } from '$lib/db/drizzle';
import { users, meetings, attendance, attendanceStatus, sessions } from '$lib/db/schemas';
import { eq, desc } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { SESSION_COOKIE_NAME } from '$lib/config';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Du må være innlogget for å se profiler');
	}

	// Get the profile user
	const profileUser = await db.select().from(users).where(eq(users.id, params.id)).limit(1);

	if (!profileUser || profileUser.length === 0) {
		error(404, 'Bruker ikke funnet');
	}

	// Get user's recent meeting attendance (last 10)
	const recentAttendance = await db
		.select({
			meeting: meetings,
			attendance: attendance,
			status: attendanceStatus
		})
		.from(attendance)
		.innerJoin(meetings, eq(attendance.meetingId, meetings.id))
		.innerJoin(attendanceStatus, eq(attendance.attendanceStatusId, attendanceStatus.id))
		.where(eq(attendance.userId, params.id))
		.orderBy(desc(meetings.startTime))
		.limit(10);

	return {
		user: profileUser[0],
		currentUser: locals.user,
		recentAttendance,
		isOwnProfile: locals.user.id === params.id
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals, params }) => {
		if (!locals.user) {
			error(401, 'Du må være innlogget');
		}

		// Only allow users to edit their own profile
		if (locals.user.id !== params.id) {
			error(403, 'Du kan kun redigere din egen profil');
		}

		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;

		if (!name || !email) {
			return fail(400, {
				message: 'Navn og e-post er påkrevd',
				name,
				email
			});
		}

		// Check if email is already taken by another user
		const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (existingUser.length > 0 && existingUser[0].id !== locals.user.id) {
			return fail(400, {
				message: 'E-posten er allerede i bruk',
				name,
				email
			});
		}

		try {
			await db
				.update(users)
				.set({
					name,
					email,
					updatedAt: new Date()
				})
				.where(eq(users.id, locals.user.id));

			return { success: true };
		} catch (err) {
			console.error('Error updating profile:', err);
			return fail(500, {
				message: 'Kunne ikke oppdatere profil',
				name,
				email
			});
		}
	},

	logout: async ({ locals, cookies }) => {
		if (!locals.user) {
			error(401, 'Du må være innlogget for å logge ut');
		}

		// Clear the user session
		cookies.delete(SESSION_COOKIE_NAME, {
			path: '/'
		});

		if (locals.session) {
			await db.delete(sessions).where(eq(sessions.id, locals.session?.id));
		}

		// Redirect to home page after logout
		redirect(302, '/');
	}
};
