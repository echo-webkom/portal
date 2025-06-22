import 'dotenv/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { eq } from 'drizzle-orm';
import * as schema from './src/lib/db/schemas';

const client = createClient({
	url: process.env.DATABASE_URL!,
	authToken: process.env.DATABASE_AUTH_TOKEN || undefined
});
const db = drizzle(client, {
	casing: 'snake_case',
	schema
});
const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5173}`;

const command = process.argv[2] ?? 'help';

if (command === 'help') {
	console.log('Available commands:');
	console.log('  - help: Show this help message');
	console.log('  - seed: Seed the database with initial data');
	console.log('  - create-magic-link <email>: Create a magic link for a user');
}

if (command === 'create-magic-link') {
	const email = process.argv[3];

	if (!email) {
		console.error('Usage: npm run script create-magic-link <email>');
		process.exit(1);
	}

	try {
		const user = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);

		if (!user || user.length === 0) {
			console.error(`User with email ${email} not found`);
			process.exit(1);
		}

		const [magicLink] = await db
			.insert(schema.magicLinks)
			.values({
				userId: user[0].id
			})
			.returning();

		const magicLinkUrl = `${baseUrl}/magic-link?token=${magicLink.id}`;

		console.log(`Magic link created for ${email}:`);
		console.log(`URL: ${magicLinkUrl}`);
		console.log(`Expires at: ${magicLink.expiresAt}`);
	} catch (error) {
		console.error('Error creating magic link:', error);
		process.exit(1);
	}
}

if (command === 'seed') {
	const users = [
		'Zeno Leonardi',
		'Johanne Blikberg Herheim',
		'Ole Magnus Fon Johnsen',
		'Jesper Kierulf Hammer',
		'Andreas Drevdal',
		'Karolina Gil',
		'Birk Monsen',
		'Izaak Sarnecki',
		'Hermann Holstad Walaunet'
	];

	for (const name of users) {
		await db
			.insert(schema.users)
			.values({
				name,
				email: `${name.toLowerCase().replace(/ /g, '_')}@echo.uib.no`
			})
			.onConflictDoNothing();
	}

	console.log('Database seeded with initial user data.');

	const statuses = ['Fravær', 'Møtt opp', 'Kommer'];

	for (const status of statuses) {
		await db
			.insert(schema.attendanceStatus)
			.values({
				name: status
			})
			.onConflictDoNothing();
	}

	console.log('Seeded attendance statuses.');

	// Seed meetings - every Wednesday from today, 15 times
	const today = new Date();
	const daysUntilWednesday = (3 - today.getDay() + 7) % 7; // 3 = Wednesday
	const nextWednesday = new Date(today);
	nextWednesday.setDate(today.getDate() + daysUntilWednesday);

	for (let i = 0; i < 15; i++) {
		const meetingDate = new Date(nextWednesday);
		meetingDate.setDate(nextWednesday.getDate() + i * 7); // Add 7 days for each week

		const startTime = new Date(meetingDate);
		startTime.setHours(19, 0, 0, 0); // 7:00 PM

		const endTime = new Date(meetingDate);
		endTime.setHours(21, 0, 0, 0); // 9:00 PM

		await db
			.insert(schema.meetings)
			.values({
				title: `Webkom møte ${meetingDate.toISOString().split('T')[0]}`,
				description: 'Ukentlig webkom møte',
				startTime,
				endTime
			})
			.onConflictDoNothing();
	}

	console.log('Seeded 15 weekly meetings starting from next Wednesday.');
}
