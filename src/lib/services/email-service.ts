import MagicLinkEmail from '$lib/emails/magic-link';
import { render } from '@react-email/components';
import { dev } from '$app/environment';
import { sendEmail } from '$lib/ses';

interface SendMagicLinkEmailParams {
	to: string;
	name: string;
	magicLinkUrl: string;
}

export class EmailService {
	/**
	 * Send a magic link email to the specified recipient
	 */
	static async sendMagicLinkEmail({ to, name, magicLinkUrl }: SendMagicLinkEmailParams) {
		try {
			if (dev) {
				// In development, just print the magic link to console
				console.log('\n=== MAGIC LINK EMAIL (DEV MODE) ===');
				console.log(`To: ${to}`);
				console.log(`Name: ${name}`);
				console.log(`Magic Link: ${magicLinkUrl}`);
				console.log('===================================\n');

				return {
					success: true,
					messageId: 'dev-mode'
				};
			}

			// In production, render and send the actual email
			const emailHtml = await render(MagicLinkEmail({ name, magicLinkUrl }));

			const { messageId } = await sendEmail({
				to: [to],
				subject: 'Logg inn på Webkom Portalen',
				html: emailHtml,
				text: `Hei, ${name}!

Klikk denne linken for å logge deg på Webkom-portalen:
${magicLinkUrl}

Denne linken utløper om 24 timer og kan kun brukes én gang.

--
Webkom`
			});

			return {
				success: true,
				messageId
			};
		} catch (error) {
			console.error('Error sending magic link email:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error occurred'
			};
		}
	}
}
