<script lang="ts">
	import { enhance } from '$app/forms';
	import { User, Calendar, Upload, Camera } from '@lucide/svelte';
	import Button from '$lib/components/button.svelte';
	import Pill from '$lib/components/pill.svelte';
	import Label from '$lib/components/label.svelte';
	import Input from '$lib/components/input.svelte';

	let { data, form } = $props();

	let isSubmitting = $state(false);
	let isUploadingImage = $state(false);
	let uploadMessage = $state<string | null>(null);
	let uploadError = $state<string | null>(null);
	let imagePreview = $state<string | null>(null);
	let fileInput = $state<HTMLInputElement | null>(null);

	async function handleImageUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) return;

		// Reset messages
		uploadMessage = null;
		uploadError = null;

		// Show preview
		const reader = new FileReader();
		reader.onload = (e) => {
			imagePreview = e.target?.result as string;
		};
		reader.readAsDataURL(file);

		// Upload file
		isUploadingImage = true;

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetch('/api/upload/profile-image', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok) {
				uploadMessage = result.message;
				// Refresh the page to show the new image
				window.location.reload();
			} else {
				uploadError = result.message || 'En feil oppstod under opplasting';
				imagePreview = null;
			}
		} catch {
			uploadError = 'En feil oppstod under opplasting';
			imagePreview = null;
		} finally {
			isUploadingImage = false;
		}
	}

	function triggerFileInput() {
		fileInput?.click();
	}

	function formatDateTime(date: Date): string {
		return new Date(date).toLocaleDateString('no-NO', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{data.user.name} - Profil - Webkom</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-foreground mb-8 text-3xl font-bold">
		{data.isOwnProfile ? 'Min profil' : `${data.user.name}s profil`}
	</h1>

	<div class="space-y-8">
		<!-- Profile Picture -->
		<div>
			<div class="mb-6 flex items-center gap-2">
				<Camera size={20} class="text-muted-foreground" />
				<h2 class="text-foreground text-xl font-semibold">Profilbilde</h2>
			</div>

			<div class="flex items-start gap-6">
				<!-- Current Profile Image -->
				<div class="flex flex-col items-center">
					{#if imagePreview}
						<img
							src={imagePreview}
							alt="Forhåndsvisning"
							class="border-border h-32 w-32 rounded-full border-2 object-cover"
						/>
					{:else if data.user.imageUrl}
						<img
							src={data.user.imageUrl}
							alt="{data.user.name}s profilbilde"
							class="border-border h-32 w-32 rounded-full border-2 object-cover"
						/>
					{:else}
						<div
							class="bg-muted border-border flex h-32 w-32 items-center justify-center rounded-full border-2"
						>
							<User size={48} class="text-muted-foreground" />
						</div>
					{/if}
				</div>

				<!-- Upload Controls -->
				{#if data.isOwnProfile}
					<div class="flex-1">
						<input
							bind:this={fileInput}
							type="file"
							accept="image/*"
							onchange={handleImageUpload}
							class="hidden"
						/>

						<Button
							variant="outline"
							onclick={triggerFileInput}
							disabled={isUploadingImage}
							class="mb-4 flex items-center gap-2"
						>
							<Upload size={16} class="mr-2" />
							{isUploadingImage ? 'Laster opp...' : 'Last opp nytt bilde'}
						</Button>

						{#if uploadMessage}
							<div class="mb-4 rounded bg-green-50 p-3 text-sm text-green-800">
								{uploadMessage}
							</div>
						{/if}

						{#if uploadError}
							<div class="mb-4 rounded bg-red-50 p-3 text-sm text-red-800">
								{uploadError}
							</div>
						{/if}

						<p class="text-muted-foreground text-sm">
							Støttede formater: JPEG, PNG, GIF, WebP<br />
							Maksimal størrelse: 5MB
						</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Profile Edit Form -->
		<div>
			<div class="mb-6 flex items-center gap-2">
				<User size={20} class="text-muted-foreground" />
				<h2 class="text-foreground text-xl font-semibold">Profilinformasjon</h2>
			</div>

			{#if data.isOwnProfile}
				{#if form?.message}
					<div
						class="mb-6 p-4 {form.message.includes('oppdatere') || form.message.includes('bruk')
							? 'bg-red-50 text-red-800'
							: 'bg-green-50 text-green-800'}"
					>
						{form.message}
					</div>
				{/if}

				{#if form?.success}
					<div class="mb-6 bg-green-50 p-4 text-green-800">Profil oppdatert!</div>
				{/if}

				<form
					method="POST"
					action="?/updateProfile"
					class="space-y-6"
					use:enhance={() => {
						isSubmitting = true;
						return async ({ update }) => {
							await update();
							isSubmitting = false;
						};
					}}
				>
					<div>
						<Label for="name" required>Navn</Label>
						<Input
							type="text"
							id="name"
							name="name"
							value={form?.name || data.user.name}
							required
						/>
					</div>

					<div>
						<Label for="email" required>E-post</Label>
						<Input
							type="email"
							id="email"
							name="email"
							value={form?.email || data.user.email}
							required
						/>
					</div>

					<div class="flex items-center justify-between pt-4">
						<Button variant="outline" type="submit" formaction="?/logout">Logg ut</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? 'Lagrer...' : 'Lagre endringer'}
						</Button>
					</div>
				</form>
			{:else}
				<div class="space-y-4">
					<div>
						<Label>Navn</Label>
						<div class="bg-muted text-foreground px-3 py-2">{data.user.name}</div>
					</div>
					<div>
						<Label>E-post</Label>
						<div class="bg-muted text-foreground px-3 py-2">{data.user.email}</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Recent Meetings -->
		<div>
			<div class="mb-6 flex items-center gap-2">
				<Calendar size={20} class="text-muted-foreground" />
				<h2 class="text-foreground text-xl font-semibold">Siste møter</h2>
			</div>

			{#if data.recentAttendance.length > 0}
				<div class="border-border overflow-hidden border-b">
					<table class="min-w-full">
						<thead class="bg-table-header border-border border-b">
							<tr>
								<th
									class="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
								>
									Møte
								</th>
								<th
									class="text-muted-foreground px-4 py-3 text-left text-xs font-medium tracking-wider uppercase"
								>
									Dato
								</th>
								<th
									class="text-muted-foreground px-4 py-3 text-center text-xs font-medium tracking-wider uppercase"
								>
									Status
								</th>
							</tr>
						</thead>
						<tbody class="bg-card">
							{#each data.recentAttendance as record (record.attendance.id)}
								<tr class="hover:bg-table-row-hover border-border border-t">
									<td class="px-4 py-4">
										<div>
											<div class="text-foreground text-sm font-medium">{record.meeting.title}</div>
										</div>
									</td>
									<td class="text-muted-foreground px-4 py-4 text-sm">
										{formatDateTime(record.meeting.startTime)}
									</td>
									<td class="px-4 py-4 text-center">
										<Pill status={record.status.name} />
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-muted-foreground py-8 text-center">
					{data.isOwnProfile
						? 'Du har ikke deltatt på noen møter ennå.'
						: `${data.user.name} har ikke deltatt på noen møter ennå.`}
				</p>
			{/if}
		</div>
	</div>
</div>
