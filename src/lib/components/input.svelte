<script lang="ts">
	import { cn } from '$lib/cn';
	import type { HTMLInputAttributes } from 'svelte/elements';

	type Props = HTMLInputAttributes;

	let { class: className, value = $bindable(), ...rest }: Props = $props();
</script>

<input
	bind:value
	class={cn(
		'border-input bg-background text-foreground focus:ring-ring w-full border-2 px-3 py-2 focus:border-transparent focus:ring-2 focus:outline-none',
		'read-only:bg-muted read-only:border-border read-only:text-muted-foreground read-only:focus:border-border read-only:cursor-not-allowed read-only:focus:ring-0',
		'disabled:bg-muted disabled:border-border disabled:text-muted-foreground disabled:focus:border-border disabled:cursor-not-allowed disabled:focus:ring-0',
		className
	)}
	{...rest}
/>
