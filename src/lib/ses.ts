import { env } from '$env/dynamic/private';
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';

export const FROM_EMAIL = 'hello@echo-webkom.no';

export const ses = new SESClient({
	region: env.AWS_REGION!,
	credentials: {
		accessKeyId: env.AWS_SES_ACCESS_KEY_ID!,
		secretAccessKey: env.AWS_SES_SECRET_ACCESS_KEY!
	}
});

type SendEmailParams = {
	to: Array<string>;
	subject: string;
	html: string;
	text: string;
};

export async function sendEmail({ to, subject, html, text }: SendEmailParams) {
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
					Data: text,
					Charset: 'UTF-8'
				}
			}
		}
	});

	const result = await ses.send(command);

	return { success: true, messageId: result.MessageId };
}
