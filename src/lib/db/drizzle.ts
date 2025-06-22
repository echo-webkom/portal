import { env } from '$env/dynamic/private';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schemas';

export const client = createClient({
	url: env.DATABASE_URL!,
	authToken: env.DATABASE_AUTH_TOKEN || undefined
});

export const db = drizzle(client, {
	casing: 'snake_case',
	schema
});
