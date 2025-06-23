<script lang="ts">
	import { Users } from '@lucide/svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Medlemmer - Webkom</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<div class="mb-8 flex items-center gap-3">
		<Users size={32} class="text-muted-foreground" />
		<h1 class="text-foreground text-3xl font-bold">Medlemmer</h1>
	</div>

	<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.users as user (user.id)}
			<div class="bg-card hover:bg-muted border-border rounded-lg border p-6 transition-colors">
				<div class="flex items-start gap-4">
					<!-- Profile Picture -->
					<div class="flex-shrink-0">
						{#if user.imageUrl}
							<img
								src={user.imageUrl}
								alt="{user.name}s profilbilde"
								class="border-border h-16 w-16 rounded-full border-2 object-cover"
							/>
						{:else}
							<div
								class="bg-muted border-border flex h-16 w-16 items-center justify-center rounded-full border-2"
							>
								<Users size={24} class="text-muted-foreground" />
							</div>
						{/if}
					</div>

					<!-- User Info -->
					<div class="min-w-0 flex-1">
						<h3 class="text-foreground text-lg font-semibold break-words">
							<a
								href="/profil/{user.id}"
								class="text-foreground hover:text-primary transition-all hover:underline"
							>
								{user.name}
							</a>
						</h3>
						<p class="text-muted-foreground text-sm break-all">{user.email}</p>
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
