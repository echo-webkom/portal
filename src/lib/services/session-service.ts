import { eq, and, gt } from 'drizzle-orm';
import { db } from '$lib/db/drizzle';
import { sessions, users, type Session } from '$lib/db/schemas';
import type { User } from '$lib/db/schemas/users';
import { nanoid } from 'nanoid';

export class SessionService {
	static async create(userId: string) {
		const sessionId = nanoid();
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

		try {
			await db.insert(sessions).values({
				id: sessionId,
				userId,
				expiresAt
			});

			return {
				id: sessionId,
				expiresAt,
				userId
			};
		} catch (error) {
			console.error('Error creating session:', error);
			throw new Error('Kunne ikke opprette ny økt');
		}
	}

	static async validate(sessionId: string): Promise<{
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
}
