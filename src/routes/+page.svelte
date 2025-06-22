<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Info, Calendar } from '@lucide/svelte';
	import Pill from '$lib/components/pill.svelte';
	import { getStatusColor } from '$lib/status';
	import { getUser } from '$lib/contexts/user-context.js';
	import { cn } from '$lib/cn.js';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import Label from '$lib/components/label.svelte';
	import type { Meeting } from '$lib/db/schemas/meetings.js';

	let { data, form } = $props();

	let user = getUser();
	let hoveredMeeting = $state<Meeting | null>(null);
	let tooltipPosition = $state({ x: 0, y: 0 });

	let isLoggedIn = $derived(!!$user);

	function getInitials(name: string): string {
		return name
			.split(' ')
			.map((part) => part.charAt(0).toUpperCase())
			.join('');
	}

	function formatDate(date: Date): string {
		return new Date(date).toLocaleDateString('no-NO', {
			month: 'short',
			day: 'numeric'
		});
	}

	function formatMeetingDateTime(date: Date): string {
		const formatted = new Date(date).toLocaleDateString('no-NO', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

		// Capitalize the first letter
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	}

	function getAttendanceData(
		userId: string,
		meetingId: string
	): { status: string; attendanceId: string } | null {
		const key = `${userId}-${meetingId}`;
		return data.attendanceMap[key] || null;
	}

	function isMeetingEditable(meeting: Meeting): boolean {
		const now = new Date();
		const meetingDate = new Date(meeting.startTime);

		// Past meetings are editable
		if (meetingDate < now) {
			return true;
		}

		// Future meetings within the next two weeks are editable
		const twoWeeksFromNow = new Date(now);
		twoWeeksFromNow.setDate(now.getDate() + 14);

		return meetingDate <= twoWeeksFromNow;
	}

	async function updateAttendance(
		userId: string,
		meetingId: string,
		statusId: string,
		attendanceId?: string
	) {
		try {
			const response = await fetch('/api/attendance', {
				method: 'POST',
				body: JSON.stringify({
					userId,
					meetingId,
					statusId,
					attendanceId
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update attendance');
			}

			invalidateAll();
		} catch (error) {
			console.error('Error updating attendance:', error);
			alert('Kunne ikke oppdatere møtestatus');
		}
	}

	function showTooltip(event: MouseEvent, meeting: Meeting) {
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		tooltipPosition = {
			x: rect.left + rect.width / 2,
			y: rect.top - 10
		};
		hoveredMeeting = meeting;
	}

	function hideTooltip() {
		hoveredMeeting = null;
	}
</script>

<svelte:head>
	<title>Møteoversikt - Webkom</title>
</svelte:head>

<div>
	{#if $user}
		<div class="mb-12">
			<div class="from-card to-muted mb-8 rounded-xl bg-gradient-to-r p-8">
				<div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
					<div class="space-y-2">
						<h1 class="text-foreground text-3xl font-bold">Velkommen tilbake!</h1>
						<p class="text-muted-foreground text-lg">{$user.name}</p>
					</div>

					{#if data.nextMeeting}
						<div class="bg-card border-border max-w-md rounded-lg border p-6 backdrop-blur-sm">
							<div class="mb-4 flex items-center gap-3">
								<div class="bg-primary/10 rounded-full p-2">
									<Calendar size={20} class="text-primary" />
								</div>
								<h2 class="text-foreground text-lg font-semibold">Neste møte</h2>
							</div>

							<div class="space-y-3">
								<div>
									<h3 class="text-foreground text-base font-semibold">{data.nextMeeting.title}</h3>
								</div>

								<div>
									<p class="text-muted-foreground text-sm font-medium">
										{formatMeetingDateTime(data.nextMeeting.startTime)}
									</p>
								</div>

								{#if data.nextMeeting.description}
									<div class="border-border border-t pt-2">
										<p class="text-foreground text-sm leading-relaxed">
											{data.nextMeeting.description}
										</p>
									</div>
								{/if}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{:else}
		<div class="mb-12">
			<div class="mb-8 text-center">
				<h1 class="text-foreground mb-3 text-4xl font-bold">Webkom Portal</h1>
				<p class="text-muted-foreground text-lg">
					Administrer møteoppmøte og få oversikt over hvem som kommer
				</p>
			</div>

			<div class="flex flex-col items-start justify-center gap-8 lg:flex-row">
				<div class="bg-card border-border w-full max-w-md rounded-xl border p-8 shadow-sm">
					<div class="mb-6 text-center">
						<h2 class="text-foreground mb-2 text-2xl font-bold">Logg inn</h2>
						<p class="text-muted-foreground text-sm">Få tilgang til møteadministrasjon</p>
					</div>

					{#if form?.error}
						<div class="border-destructive/20 bg-destructive/5 mb-6 rounded-lg border p-4">
							<p class="text-destructive text-sm font-medium">{form.error}</p>
						</div>
					{/if}

					{#if form?.success}
						<div class="border-success/20 bg-success/5 mb-6 rounded-lg border p-4">
							<p class="text-success text-sm font-medium">
								Magic link er sendt til din e-post! Sjekk innboksen din.
							</p>
						</div>
					{/if}

					<form method="POST" action="?/requestMagicLink" use:enhance class="space-y-6">
						<div>
							<Label for="email" required>E-post</Label>
							<Input
								type="email"
								id="email"
								name="email"
								placeholder="din@email.no"
								required
								class="mt-1"
							/>
						</div>
						<Button type="submit" class="h-12 w-full text-base font-semibold">
							Send magic link
						</Button>
					</form>
				</div>

				{#if data.nextMeeting}
					<div
						class="from-card to-accent/5 border-border/20 w-full max-w-md rounded-xl border bg-gradient-to-br p-8 shadow-sm"
					>
						<div class="mb-6 flex items-center gap-3">
							<div class="bg-primary/10 rounded-full p-3">
								<Calendar size={24} class="text-primary" />
							</div>
							<h2 class="text-foreground text-xl font-bold">Neste møte</h2>
						</div>

						<div class="space-y-4">
							<div>
								<h3 class="text-foreground text-lg leading-tight font-bold">
									{data.nextMeeting.title}
								</h3>
							</div>

							<div class="bg-muted/30 rounded-lg p-3">
								<p class="text-foreground text-sm font-semibold">
									{formatMeetingDateTime(data.nextMeeting.startTime)}
								</p>
							</div>

							{#if data.nextMeeting.description}
								<div class="border-border/20 border-t pt-4">
									<p class="text-muted-foreground text-sm leading-relaxed">
										{data.nextMeeting.description}
									</p>
								</div>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<div class="overflow-x-auto overflow-y-visible rounded-lg">
		<table class="bg-card min-w-full">
			<thead class="bg-table-header">
				<tr>
					<th
						class="bg-table-header text-muted-foreground sticky left-0 z-20 px-6 py-3 text-left text-xs font-medium tracking-wider uppercase"
					>
						Navn
					</th>
					{#each data.meetings as meeting (meeting.id)}
						<th
							class="text-muted-foreground relative min-w-[100px] px-3 py-3 text-center text-xs font-medium tracking-wider uppercase"
						>
							<div class="flex flex-col items-center">
								<div class="flex items-center gap-1">
									<span>{formatDate(meeting.startTime)}</span>
									<Info
										size={12}
										class="text-muted-foreground hover:text-foreground cursor-help"
										onmouseenter={(e) => showTooltip(e, meeting)}
										onmouseleave={hideTooltip}
									/>
								</div>
								<span class="text-muted-foreground text-xs normal-case">
									{meeting.startTime.getFullYear()}
								</span>
							</div>
						</th>
					{/each}
				</tr>
			</thead>
			<tbody class="bg-card">
				{#each data.users as user (user.id)}
					<tr class="hover:bg-table-row-hover border-border border-t">
						<td
							class="bg-table-header text-foreground sticky left-0 z-20 px-6 py-4 text-sm font-medium whitespace-nowrap"
						>
							<a href="/profil/{user.id}" class="text-foreground hover:underline">
								<span class="sm:hidden">{getInitials(user.name)}</span>
								<span class="hidden sm:inline">{user.name}</span>
							</a>
						</td>
						{#each data.meetings as meeting (meeting.id)}
							{@const attendanceData = getAttendanceData(user.id, meeting.id)}
							{@const isEditable = isMeetingEditable(meeting)}
							<td
								class="px-3 py-4 text-center whitespace-nowrap {isEditable && user
									? ''
									: 'bg-muted opacity-50'}"
							>
								{#if isEditable && user}
									<select
										class={cn(
											'rounded-full border-0 px-2 py-1 text-xs',
											attendanceData?.status
												? getStatusColor(attendanceData.status)
												: 'bg-muted text-muted-foreground',
											{
												'cursor-pointer': isLoggedIn,
												'cursor-not-allowed': !isLoggedIn
											}
										)}
										disabled={!isLoggedIn}
										onchange={(e) => {
											const target = e.target as HTMLSelectElement;
											if (target.value) {
												updateAttendance(
													user.id,
													meeting.id,
													target.value,
													attendanceData?.attendanceId
												);
											}
										}}
									>
										<option value="" class="bg-dropdown text-foreground">
											{attendanceData?.status || 'Velg status'}
										</option>
										{#each data.statuses as status (status.id)}
											<option value={status.id} class="bg-dropdown text-foreground">
												{status.name}
											</option>
										{/each}
									</select>
								{:else if attendanceData?.status}
									<Pill status={attendanceData.status} />
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<div class="mt-6 flex flex-wrap gap-2 text-sm">
		<span class="text-muted-foreground">Statuser:</span>
		<Pill status="Møtt opp" />
		<Pill status="Kommer" />
		<Pill status="Fravær" />
	</div>
</div>

<!-- Global tooltip -->
{#if hoveredMeeting}
	<div
		class="bg-foreground text-background pointer-events-none fixed z-50 rounded px-3 py-2 text-xs whitespace-nowrap"
		style="left: {tooltipPosition.x}px; top: {tooltipPosition.y}px; transform: translate(-50%, -100%);"
	>
		<div class="font-semibold">{hoveredMeeting.title}</div>
		{#if hoveredMeeting.description}
			<div class="mt-1 opacity-80">{hoveredMeeting.description}</div>
		{/if}
		<div
			class="border-t-foreground absolute top-full left-1/2 h-0 w-0 -translate-x-1/2 transform border-t-4 border-r-4 border-l-4 border-transparent"
		></div>
	</div>
{/if}
