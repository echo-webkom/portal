<script lang="ts">
	import { User } from '@lucide/svelte';
	import Label from '$lib/components/label.svelte';

	let { data } = $props();

	// Calculate active years for role history
	function getActiveYears(roleHistory: typeof data.roleHistory) {
		const years = new Set<number>();
		roleHistory.forEach(({ userRole }) => {
			const startYear = new Date(userRole.startDate!).getFullYear();
			const endYear = userRole.endDate
				? new Date(userRole.endDate).getFullYear()
				: new Date().getFullYear();
			for (let year = startYear; year <= endYear; year++) {
				years.add(year);
			}
		});
		const sortedYears = Array.from(years).sort();
		if (sortedYears.length <= 3) {
			return sortedYears.join(', ');
		} else {
			return `${sortedYears[0]} - ${sortedYears[sortedYears.length - 1]} (${sortedYears.length} år)`;
		}
	}
</script>

<div>
	<div class="mb-6 flex items-center gap-2">
		<User size={20} class="text-muted-foreground" />
		<h2 class="text-foreground text-xl font-semibold">Profilinformasjon</h2>
	</div>

	<div class="flex items-start gap-6">
		<!-- Current Profile Image -->
		<div class="flex flex-col items-center">
			{#if data.user.imageUrl}
				<img
					src={data.user.imageUrl}
					alt="{data.user.name}s profilbilde"
					class="border-border aspect-[2/3] w-32 rounded-lg border-2 object-cover"
				/>
			{:else}
				<div
					class="bg-muted border-border flex aspect-[2/3] w-32 items-center justify-center rounded-lg border-2"
				>
					<User size={48} class="text-muted-foreground" />
				</div>
			{/if}
		</div>

		<!-- User Information -->
		<div class="flex-1 space-y-4">
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

			{#if !data.isOwnProfile && data.roleHistory.length > 0}
				<div>
					<Label>Rollehistorikk</Label>
					<div class="bg-muted text-foreground space-y-2 px-3 py-3">
						{#each data.roleHistory as { role, userRole } (userRole.id)}
							<div class="flex items-center justify-between text-sm">
								<span class="font-medium">{role.name}</span>
								<span class="text-muted-foreground">
									{new Date(userRole.startDate!).toLocaleDateString('no-NO', {
										month: 'short',
										year: 'numeric'
									})}
									{#if userRole.endDate}
										- {new Date(userRole.endDate).toLocaleDateString('no-NO', {
											month: 'short',
											year: 'numeric'
										})}
									{:else}
										- nåværende
									{/if}
								</span>
							</div>
						{/each}
					</div>
				</div>

				<div>
					<Label>Aktive år</Label>
					<div class="bg-muted text-foreground px-3 py-2">
						{getActiveYears(data.roleHistory)}
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
	</div>
</div>
