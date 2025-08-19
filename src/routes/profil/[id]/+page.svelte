<script lang="ts">
	import UserView from './components/user-view.svelte';
	import GuestView from './components/guest-view.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.user.name} - Profil - Webkom</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-foreground mb-8 text-3xl font-bold">
		{data.isOwnProfile ? 'Min profil' : `${data.user.name}s profil`}
	</h1>

	{#if data.isOwnProfile}
		<UserView />
	{:else}
		<GuestView />
	{/if}
</div>
