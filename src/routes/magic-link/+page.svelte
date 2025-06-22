<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let isLoading = true;
	let error = '';

	onMount(() => {
		const token = $page.url.searchParams.get('token');

		if (!token) {
			error = 'No magic link token provided';
			isLoading = false;
			return;
		}

		// The server-side load function handles the actual login
		// If we reach this point, it means there was an error
		isLoading = false;
	});

	function goHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Magic Link Login</title>
</svelte:head>

<div class="bg-background flex min-h-screen items-center justify-center">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h2 class="text-foreground mt-6 text-3xl font-extrabold">
				{#if isLoading}
					Logging you in...
				{:else if error}
					Login Failed
				{:else}
					Welcome!
				{/if}
			</h2>
		</div>

		<div class="bg-card rounded-lg p-8">
			{#if isLoading}
				<div class="flex items-center justify-center">
					<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
					<span class="text-muted-foreground ml-3">Processing your magic link...</span>
				</div>
			{:else if error}
				<div class="text-center">
					<div class="mb-4 rounded-md border border-red-200 bg-red-50 p-4">
						<p class="text-red-800">{error}</p>
					</div>
					<button
						on:click={goHome}
						class="rounded-md bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
					>
						Go to Home
					</button>
				</div>
			{:else}
				<div class="text-center">
					<div class="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
						<p class="text-green-800">Successfully logged in! Redirecting...</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
