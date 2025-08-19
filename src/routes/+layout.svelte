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
	<div class="flex-1 px-4 py-8 pb-16 md:px-8 md:pb-24">
		{@render children()}
	</div>
	<footer class="bg-card border-border border-t py-6">
		<div class="text-muted-foreground mx-auto max-w-6xl px-4 text-center text-sm md:px-8">
			Laget med ❤️ av Webkom
		</div>
	</footer>
</div>
