import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { SESSION_COOKIE_NAME } from '$lib/config';
import { MagicLinkService } from '$lib/services/magic-link-service';
import { SessionService } from '$lib/services/session-service';

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

	if (!validation.userId) {
		error(400, 'Magic link has expired');
	}

	await MagicLinkService.deleteMagicLink(token);

	// Create a new session
	const { id: sessionId } = await SessionService.create(validation.userId);

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
