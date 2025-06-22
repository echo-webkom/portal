import { eq, and, gt } from 'drizzle-orm';
import { db } from '$lib/db/drizzle';
import { sessions, users, type Session } from '$lib/db/schemas';
import type { User } from '$lib/db/schemas/users';

export async function validateSession(sessionId: string): Promise<{
	user: User;
	session: Session;
} | null> {
	if (!sessionId) {
		return null;
	}

	try {
		const result = await db
			.select({
				session: sessions,
				user: users
			})
			.from(sessions)
			.innerJoin(users, eq(sessions.userId, users.id))
			.where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
			.limit(1);

		if (!result || result.length === 0) {
			return null;
		}

		return result[0] ?? null;
	} catch (error) {
		console.error('Error validating session:', error);
		return null;
	}
}
