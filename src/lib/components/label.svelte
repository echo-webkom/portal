<script lang="ts">
	import { cn } from '$lib/cn';
	import type { HTMLLabelAttributes } from 'svelte/elements';

	type Props = HTMLLabelAttributes & {
		required?: boolean;
	};

	let { class: className, children, required, ...rest }: Props = $props();
</script>

<label class={cn('text-foreground mb-2 block text-sm font-medium', className)} {...rest}>
	{@render children?.()}

	{#if required}
		<span class="text-destructive">*</span>
	{/if}
</label>
