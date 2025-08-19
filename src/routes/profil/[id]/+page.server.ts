import { db } from '$lib/db/drizzle';
import {
	users,
	meetings,
	attendance,
	attendanceStatus,
	sessions,
	roles,
	userRoles
} from '$lib/db/schemas';
import { eq, desc, and, isNull } from 'drizzle-orm';
import { fail, redirect, error } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { SESSION_COOKIE_NAME } from '$lib/config';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		error(401, 'Du må være innlogget for å se profiler');
	}

	// Get the profile user with current role
	const profileUser = await db
		.select({
			user: users,
			currentRole: roles
		})
		.from(users)
		.leftJoin(roles, eq(users.currentRoleId, roles.id))
		.where(eq(users.id, params.id))
		.limit(1);

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

	// Get all available roles
	const availableRoles = await db.select().from(roles).orderBy(roles.name);

	// Get user's role history (for viewing other profiles)
	const roleHistory = await db
		.select({
			role: roles,
			userRole: userRoles
		})
		.from(userRoles)
		.innerJoin(roles, eq(userRoles.roleId, roles.id))
		.where(eq(userRoles.userId, params.id))
		.orderBy(desc(userRoles.startDate));

	return {
		user: profileUser[0].user,
		currentRole: profileUser[0].currentRole,
		currentUser: locals.user,
		recentAttendance,
		availableRoles,
		roleHistory,
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
		const activeFromMonth = data.get('activeFromMonth') as string;
		const activeFromYear = data.get('activeFromYear') as string;
		const activeToMonth = data.get('activeToMonth') as string;
		const activeToYear = data.get('activeToYear') as string;
		const isPublic = data.get('isPublic') === 'on';
		const currentRoleId = data.get('currentRoleId') as string;

		if (!name || !email) {
			return fail(400, {
				message: 'Navn og e-post er påkrevd',
				name,
				email,
				activeFromMonth,
				activeFromYear,
				activeToMonth,
				activeToYear,
				isPublic,
				currentRoleId
			});
		}

		// Convert date inputs to timestamps (first day of the month)
		let activeFrom: Date | null = null;
		let activeTo: Date | null = null;

		if (activeFromMonth && activeFromYear) {
			const month = parseInt(activeFromMonth);
			const year = parseInt(activeFromYear);
			if (month >= 1 && month <= 12 && year >= 2020 && year <= new Date().getFullYear()) {
				activeFrom = new Date(year, month - 1, 1); // month - 1 because Date constructor uses 0-based months
			}
		}

		if (activeToMonth && activeToYear) {
			const month = parseInt(activeToMonth);
			const year = parseInt(activeToYear);
			if (month >= 1 && month <= 12 && year >= 2020 && year <= new Date().getFullYear()) {
				activeTo = new Date(year, month - 1, 1);
			}
		}

		// Check if email is already taken by another user
		const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

		if (existingUser.length > 0 && existingUser[0].id !== locals.user.id) {
			return fail(400, {
				message: 'E-posten er allerede i bruk',
				name,
				email,
				activeFromMonth,
				activeFromYear,
				activeToMonth,
				activeToYear,
				isPublic,
				currentRoleId
			});
		}

		// Get current user data to check for role changes
		const currentUser = await db.select().from(users).where(eq(users.id, locals.user.id)).limit(1);
		const oldRoleId = currentUser[0]?.currentRoleId;
		const newRoleId = currentRoleId || null;

		try {
			// Update user profile
			await db
				.update(users)
				.set({
					name,
					email,
					activeFrom,
					activeTo,
					isPublic,
					currentRoleId: newRoleId,
					updatedAt: new Date()
				})
				.where(eq(users.id, locals.user.id));

			// Handle role change - add to role history if role changed
			if (oldRoleId !== newRoleId) {
				const currentDate = new Date();

				// End the previous role if there was one
				if (oldRoleId) {
					await db
						.update(userRoles)
						.set({
							endDate: currentDate
						})
						.where(
							and(
								eq(userRoles.userId, locals.user.id),
								eq(userRoles.roleId, oldRoleId),
								isNull(userRoles.endDate)
							)
						);
				}

				// Add new role to history if a role was selected
				if (newRoleId) {
					await db.insert(userRoles).values({
						userId: locals.user.id,
						roleId: newRoleId,
						startDate: currentDate,
						endDate: null
					});
				}
			}

			return { success: true };
		} catch (err) {
			console.error('Error updating profile:', err);
			return fail(500, {
				message: 'Kunne ikke oppdatere profil',
				name,
				email,
				activeFromMonth,
				activeFromYear,
				activeToMonth,
				activeToYear,
				isPublic,
				currentRoleId
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
