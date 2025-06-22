import { db } from '$lib/db/drizzle';
import { magicLinks, users } from '$lib/db/schemas';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import { EmailService } from './email-service';

export class MagicLinkService {
	/**
	 * Generate a secure random token for magic links
	 */
	private static generateToken(): string {
		return randomBytes(32).toString('hex');
	}

	/**
	 * Create a magic link token and store it in the database
	 */
	static async createMagicLink(userId: string, baseUrl: string): Promise<string> {
		const token = this.generateToken();
		const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

		// Store the magic link in the database
		await db.insert(magicLinks).values({
			id: token,
			userId,
			expiresAt
		});

		// Return the full magic link URL
		return `${baseUrl}/magic-link?token=${token}`;
	}

	/**
	 * Send a magic link email to a user
	 */
	static async sendMagicLink(
		email: string,
		baseUrl: string
	): Promise<{ success: boolean; error?: string }> {
		try {
			// Find the user by email
			const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

			if (!user) {
				return { success: false, error: 'Ingen bruker funnet med denne e-postadressen' };
			}

			// Create the magic link
			const magicLinkUrl = await this.createMagicLink(user.id, baseUrl);

			// Send the email
			const emailResult = await EmailService.sendMagicLinkEmail({
				to: email,
				name: user.name,
				magicLinkUrl
			});

			if (!emailResult.success) {
				return { success: false, error: 'Kunne ikke sende e-post' };
			}

			return { success: true };
		} catch (error) {
			console.error('Error sending magic link:', error);
			return { success: false, error: 'En feil oppstod' };
		}
	}

	/**
	 * Validate and consume a magic link token
	 */
	static async validateMagicLink(
		token: string
	): Promise<{ valid: boolean; userId?: string; error?: string }> {
		try {
			// Find the magic link by token
			const magicLink = await db.select().from(magicLinks).where(eq(magicLinks.id, token)).limit(1);

			if (magicLink.length === 0) {
				return { valid: false, error: 'Ugyldig magic link' };
			}

			const link = magicLink[0];

			// Check if the link has expired
			if (link.expiresAt < new Date()) {
				return { valid: false, error: 'Magic link har utløpt' };
			}

			// Mark the link as used
			await db.delete(magicLinks).where(eq(magicLinks.id, token));

			return { valid: true, userId: link.userId };
		} catch (error) {
			console.error('Error validating magic link:', error);
			return { valid: false, error: 'En feil oppstod ved validering' };
		}
	}

	/**
	 * Clean up expired magic links (can be called periodically)
	 */
	static async cleanupExpiredLinks(): Promise<void> {
		try {
			await db.delete(magicLinks).where(eq(magicLinks.expiresAt, new Date()));
		} catch (error) {
			console.error('Error cleaning up expired magic links:', error);
		}
	}
}
