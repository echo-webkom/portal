import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const DATABASE_URL = process.env.DATABASE_URL!;

const isDev = DATABASE_URL.startsWith('file');

const dev = defineConfig({
	dialect: 'sqlite',
	casing: 'snake_case',
	schema: './src/lib/db/schemas/index.ts',
	dbCredentials: {
		url: DATABASE_URL
	}
});

const prod = defineConfig({
	dialect: 'turso',
	casing: 'snake_case',
	schema: './src/lib/db/schemas/index.ts',
	dbCredentials: {
		url: DATABASE_URL,
		authToken: process.env.DATABASE_AUTH_TOKEN || undefined
	}
});

export default isDev ? dev : prod;
