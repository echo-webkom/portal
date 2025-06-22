<script lang="ts">
	import Header from '$lib/components/header.svelte';
	import { setUserContext } from '$lib/contexts/user-context';
	import '../app.css';

	import { writable } from 'svelte/store';

	const { data, children } = $props();

	const user = writable(data.user);
	$effect.pre(() => {
		user.set(data.user);
	});
	setUserContext(user);
</script>

<div class="flex min-h-screen w-full flex-col">
	<Header />
	<div class="flex-1 px-4 py-8 md:px-8">
		{@render children()}
	</div>
</div>
