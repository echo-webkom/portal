<script lang="ts">
	import { enhance } from '$app/forms';
	import { User, Upload, Camera } from '@lucide/svelte';
	import Button from '$lib/components/button.svelte';
	import Label from '$lib/components/label.svelte';
	import Input from '$lib/components/input.svelte';

	let { data, form } = $props();

	let isSubmitting = $state(false);

	// Form field states
	let name = $state(form?.name || data.user.name);
	let email = $state(form?.email || data.user.email);
	let activeFromMonth = $state(
		form?.activeFromMonth ||
			(data.user.activeFrom ? String(new Date(data.user.activeFrom).getMonth() + 1) : '')
	);
	let activeFromYear = $state(
		form?.activeFromYear ||
			(data.user.activeFrom ? String(new Date(data.user.activeFrom).getFullYear()) : '')
	);
	let activeToMonth = $state(
		form?.activeToMonth ||
			(data.user.activeTo ? String(new Date(data.user.activeTo).getMonth() + 1) : '')
	);
	let activeToYear = $state(
		form?.activeToYear ||
			(data.user.activeTo ? String(new Date(data.user.activeTo).getFullYear()) : '')
	);
	let currentRoleId = $state(form?.currentRoleId || data.user.currentRoleId || '');
	let isPublic = $state(form?.isPublic !== undefined ? form.isPublic : data.user.isPublic);

	// Update form fields when form prop changes (after server validation)
	$effect(() => {
		if (form) {
			name = form.name || data.user.name;
			email = form.email || data.user.email;
			activeFromMonth =
				form.activeFromMonth ||
				(data.user.activeFrom ? String(new Date(data.user.activeFrom).getMonth() + 1) : '');
			activeFromYear =
				form.activeFromYear ||
				(data.user.activeFrom ? String(new Date(data.user.activeFrom).getFullYear()) : '');
			activeToMonth =
				form.activeToMonth ||
				(data.user.activeTo ? String(new Date(data.user.activeTo).getMonth() + 1) : '');
			activeToYear =
				form.activeToYear ||
				(data.user.activeTo ? String(new Date(data.user.activeTo).getFullYear()) : '');
			currentRoleId = form.currentRoleId || data.user.currentRoleId || '';
			isPublic = form.isPublic !== undefined ? form.isPublic : data.user.isPublic;
		}
	});
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
							class="border-border aspect-[9/16] w-32 rounded-lg border-2 object-cover"
						/>
					{:else if data.user.imageUrl}
						<img
							src={data.user.imageUrl}
							alt="{data.user.name}s profilbilde"
							class="border-border aspect-[9/16] w-32 rounded-lg border-2 object-cover"
						/>
					{:else}
						<div
							class="bg-muted border-border flex aspect-[9/16] w-32 items-center justify-center rounded-lg border-2"
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
						<Input type="text" id="name" name="name" bind:value={name} required />
					</div>

					<div>
						<Label for="email" required>E-post</Label>
						<Input type="email" id="email" name="email" bind:value={email} required />
					</div>

					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<Label for="activeFrom">Aktiv fra (måned/år)</Label>
							<div class="grid grid-cols-2 gap-2">
								<select
									id="activeFromMonth"
									name="activeFromMonth"
									class="border-input bg-background text-foreground focus:ring-ring w-full border-2 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
									bind:value={activeFromMonth}
								>
									<option value="">Velg måned</option>
									<option value="1">Januar</option>
									<option value="2">Februar</option>
									<option value="3">Mars</option>
									<option value="4">April</option>
									<option value="5">Mai</option>
									<option value="6">Juni</option>
									<option value="7">Juli</option>
									<option value="8">August</option>
									<option value="9">September</option>
									<option value="10">Oktober</option>
									<option value="11">November</option>
									<option value="12">Desember</option>
								</select>
								<Input
									type="number"
									id="activeFromYear"
									name="activeFromYear"
									placeholder="År"
									min="2000"
									max="2030"
									bind:value={activeFromYear}
								/>
							</div>
						</div>

						<div>
							<Label for="activeTo">Aktiv til (måned/år)</Label>
							<div class="grid grid-cols-2 gap-2">
								<select
									id="activeToMonth"
									name="activeToMonth"
									class="border-input bg-background text-foreground focus:ring-ring w-full border-2 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
									bind:value={activeToMonth}
								>
									<option value="">Velg måned</option>
									<option value="1">Januar</option>
									<option value="2">Februar</option>
									<option value="3">Mars</option>
									<option value="4">April</option>
									<option value="5">Mai</option>
									<option value="6">Juni</option>
									<option value="7">Juli</option>
									<option value="8">August</option>
									<option value="9">September</option>
									<option value="10">Oktober</option>
									<option value="11">November</option>
									<option value="12">Desember</option>
								</select>
								<Input
									type="number"
									id="activeToYear"
									name="activeToYear"
									placeholder="År"
									min="2000"
									max="2030"
									bind:value={activeToYear}
								/>
							</div>
						</div>
					</div>

					<div>
						<Label for="currentRoleId">Nåværende rolle</Label>
						<select
							id="currentRoleId"
							name="currentRoleId"
							class="border-input bg-background text-foreground focus:ring-ring w-full border-2 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none"
							bind:value={currentRoleId}
						>
							<option value="">Ingen rolle</option>
							{#each data.availableRoles as role}
								<option value={role.id}>{role.name}</option>
							{/each}
						</select>
					</div>

					<div class="flex items-center gap-2">
						<input
							type="checkbox"
							id="isPublic"
							name="isPublic"
							class="border-input bg-background text-primary focus:ring-ring h-4 w-4 border-2 focus:ring-2 focus:ring-offset-2"
							bind:checked={isPublic}
						/>
						<Label for="isPublic">Offentlig profil</Label>
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
					{#if data.user.activeFrom || data.user.activeTo}
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							{#if data.user.activeFrom}
								<div>
									<Label>Aktiv fra</Label>
									<div class="bg-muted text-foreground px-3 py-2">
										{new Date(data.user.activeFrom).toLocaleDateString('no-NO', {
											month: 'long',
											year: 'numeric'
										})}
									</div>
								</div>
							{/if}
							{#if data.user.activeTo}
								<div>
									<Label>Aktiv til</Label>
									<div class="bg-muted text-foreground px-3 py-2">
										{new Date(data.user.activeTo).toLocaleDateString('no-NO', {
											month: 'long',
											year: 'numeric'
										})}
									</div>
								</div>
							{/if}
						</div>
					{/if}
					{#if data.currentRole}
						<div>
							<Label>Nåværende rolle</Label>
							<div class="bg-muted text-foreground px-3 py-2">
								{data.currentRole.name}
							</div>
						</div>
					{/if}
					<div>
						<Label>Offentlig profil</Label>
						<div class="bg-muted text-foreground px-3 py-2">
							{data.user.isPublic ? 'Ja' : 'Nei'}
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
