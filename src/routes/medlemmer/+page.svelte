<script lang="ts">
	import { Users } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Medlemmer - Webkom</title>
</svelte:head>

<div class="mx-auto max-w-6xl">
	<div class="mb-8 flex items-center gap-3">
		<Users size={32} class="text-muted-foreground" />
		<h1 class="text-foreground text-3xl font-bold">Medlemmer</h1>
	</div>

	<div class="grid grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
		{#each data.users as user (user.id)}
			<div class="bg-card border-border overflow-hidden rounded-lg border transition-colors">
				<!-- Profile Picture -->
				<div class="w-full">
					{#if user.imageUrl}
						<img
							src={user.imageUrl}
							alt="{user.name}s profilbilde"
							class="mx-auto h-56 object-cover"
						/>
					{:else}
						<div class="bg-muted flex h-56 items-center justify-center">
							<Users size={48} class="text-muted-foreground" />
						</div>
					{/if}
				</div>

				<!-- User Info -->
				<div class="border-border border-t p-6">
					<h3 class="text-foreground text-lg font-semibold break-words">
						<a
							href="/profil/{user.id}"
							class="text-foreground hover:text-primary transition-all hover:underline"
						>
							{user.name}
						</a>
					</h3>
					<p class="text-muted-foreground text-sm break-all">{user.email}</p>
					{#if user.activeFrom}
						<p class="text-muted-foreground mt-2 text-xs">
							{new Date(user.activeFrom).toLocaleDateString('no-NO', {
								month: 'short',
								year: 'numeric'
							})} -
							{user.activeTo
								? new Date(user.activeTo).toLocaleDateString('no-NO', {
										month: 'short',
										year: 'numeric'
									})
								: 'nåværende'}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
