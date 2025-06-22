import { env } from '$env/dynamic/private';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

export const FROM_EMAIL = 'hello@mail.echo-webkom.no';

export const ses = new SESClient({
	region: 'eu-north-1',
	credentials: {
		accessKeyId: env.AWS_ACCESS_KEY_ID!,
		secretAccessKey: env.AWS_SECRET_ACCESS_KEY!
	}
});

type SendEmailParams = {
	to: Array<string>;
	subject: string;
	html: string;
	text: string;
};

export async function sendEmail({ to, subject, html }: SendEmailParams) {
	const command = new SendEmailCommand({
		Source: FROM_EMAIL,
		Destination: {
			ToAddresses: to
		},
		Message: {
			Subject: {
				Data: subject,
				Charset: 'UTF-8'
			},
			Body: {
				Html: {
					Data: html,
					Charset: 'UTF-8'
				},
				Text: {
					Data: html.replace(/<[^>]*>/g, ''),
					Charset: 'UTF-8'
				}
			}
		}
	});

	const result = await ses.send(command);

	return { success: true, messageId: result.MessageId };
}
