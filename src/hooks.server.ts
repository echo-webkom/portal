import { SESSION_COOKIE_NAME } from '$lib/config';
import { SessionService } from '$lib/services/session-service';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(SESSION_COOKIE_NAME);

	if (sessionId) {
		const auth = await SessionService.validate(sessionId);
		if (auth) {
			event.locals.user = auth.user;
			event.locals.session = auth.session;
		} else {
			event.cookies.delete(SESSION_COOKIE_NAME, {
				path: '/'
			});
			event.locals.user = null;
			event.locals.session = null;
		}
	}

	return await resolve(event);
};
