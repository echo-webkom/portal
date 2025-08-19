<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { Info } from '@lucide/svelte';
	import Pill from '$lib/components/pill.svelte';
	import { getStatusColor } from '$lib/status';
	import { getUser } from '$lib/contexts/user-context.js';
	import { cn } from '$lib/cn.js';
	import type { Meeting } from '$lib/db/schemas/meetings.js';

	let { data } = $props();

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
	<title>Timeplan - Webkom</title>
</svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="mb-8">
		<h1 class="text-foreground mb-2 text-3xl font-bold">Timeplan</h1>
		<p class="text-muted-foreground">Oversikt over møteoppmøte og status for alle medlemmer</p>
	</div>

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
										value={attendanceData?.status ?? ''}
									>
										<option value="" class="bg-dropdown text-foreground"> Velg status </option>
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

	<div class="mt-6 flex items-center justify-between">
		<div class="flex flex-wrap gap-2 text-sm">
			<span class="text-muted-foreground">Statuser:</span>
			<Pill status="Møtt opp" />
			<Pill status="Kommer" />
			<Pill status="Fravær" />
		</div>

		{#if isLoggedIn}
			<a
				href="/mote/ny"
				class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="size-4"
				>
					<path d="M5 12h14" />
					<path d="m12 5 7 7-7 7" />
				</svg>
				Nytt møte
			</a>
		{/if}
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
