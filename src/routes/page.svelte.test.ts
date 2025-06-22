import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	it('should render h1', async () => {
		render(Page, {
			data: {
				users: [],
				meetings: [],
				attendanceMap: {},
				statuses: [],
				user: null,
				nextMeeting: null
			},
			form: {
				success: false
			}
		});

		const heading = page.getByRole('heading', { level: 1 });
		await expect.element(heading).toBeInTheDocument();
	});
});
