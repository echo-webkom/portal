<script lang="ts">
	import { Calendar } from '@lucide/svelte';
	import { getUser } from '$lib/contexts/user-context.js';
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import Label from '$lib/components/label.svelte';

	let { data, form } = $props();

	let user = getUser();

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
						<div class="w-full max-w-md">
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
					<div class="bg-card border-border w-full max-w-md rounded-xl border p-8 shadow-sm">
						<div class="mb-6 text-center">
							<h2 class="text-foreground mb-2 text-2xl font-bold">Neste møte</h2>
							<p class="text-muted-foreground text-sm">Kommende møteinformasjon</p>
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
</div>
