# Webkom Portal

The offical portal of echo Webkom.

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- SQLite database

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd <repo>
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Required environment variables:

- `DATABASE_URL` - SQLite database connection string
- `BASE_URL` - Application base URL (for magic links)
- `POSTMARK_SERVER_TOKEN` - Postmark API token for email sending

4. Set up the database:

```bash
pnpm db:migrate
tsx scripts.ts seed
```

5. Start development server:

```bash
pnpm dev
```

Visit `http://localhost:5173` to view the application.

## Development Commands

### Core Scripts

- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm start` - Start production server

### Code Quality

- `pnpm lint` - Run Prettier and ESLint checks
- `pnpm format` - Format code with Prettier
- `pnpm check` - Run TypeScript and Svelte checks
- `pnpm check:watch` - Run checks in watch mode

### Testing

- `pnpm test` - Run all tests
- `pnpm test:unit` - Run unit tests with Vitest

### Database Management

- `pnpm db:generate` - Generate database migrations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:push` - Push schema changes to database
- `pnpm db:studio` - Open Drizzle Studio for database inspection

### Email Development

- `pnpm email:dev` - Start React Email development server

## Custom Scripts

The project includes a custom script system accessible via `pnpm run script <command>`:

### `pnpm run script help`

Shows available script commands.

### `pnpm run script seed`

Seeds the database with initial data including:

- Sample users from Webkom
- Attendance status options (Møtt opp, Kommer, Fravær, etc.)
- 15 weekly meetings starting from next Wednesday at 19:00-21:00

### `pnpm run script create-magic-link <email>`

Generates a magic link for user authentication.

**Usage:**

```bash
pnpm run script create-magic-link user@echo.uib.no
```

**Output:**

- Magic link URL
- Expiration timestamp
- User validation

## Authentication

Uses magic link authentication:

1. User enters email on login page
2. Magic link sent via email (or printed to console in development)
3. Link validates token and creates session
4. User gains access to application

## Deployment

### Docker

Build and run with Docker:

```bash
docker build -t webkom-portal .
docker run -p 3000:3000 --env-file .env webkom-portal
```

## Environment Variables

### Required

- `DATABASE_URL` - SQLite database path (e.g., `file:./app.db`)
- `BASE_URL` - Application URL for magic links

### Email Configuration

- `POSTMARK_SERVER_TOKEN` - Postmark API token for email delivery
