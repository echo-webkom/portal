import { redirect, error } from '@sveltejs/kit';
import { db } from '$lib/db/drizzle';
import { sessions } from '$lib/db/schemas';
import { nanoid } from 'nanoid';
import type { PageServerLoad } from './$types';
import { SESSION_COOKIE_NAME } from '$lib/config';
import { MagicLinkService } from '$lib/services/magic-link-service';

export const load: PageServerLoad = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		error(400, 'Missing magic link token');
	}

	// Validate the magic link using our service
	const validation = await MagicLinkService.validateMagicLink(token);

	if (!validation.valid) {
		error(400, validation.error || 'Invalid magic link');
	}

	// Create a new session
	const sessionId = nanoid();
	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

	await db.insert(sessions).values({
		id: sessionId,
		userId: validation.userId!,
		expiresAt
	});

	// Set session cookie
	cookies.set(SESSION_COOKIE_NAME, sessionId, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30 // 30 days
	});

	// Redirect to home page or dashboard
	redirect(302, '/');
};
