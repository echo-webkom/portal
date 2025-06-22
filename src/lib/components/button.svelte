<script lang="ts">
	import { cn } from '$lib/cn';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'ghost' | 'outline';
	};

	let { variant = 'primary', class: className, children, ...restProps }: Props = $props();

	const variants = {
		primary:
			'bg-primary text-primary-foreground border border-primary hover:bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed',
		ghost: 'bg-transparent text-foreground hover:bg-muted disabled:opacity-50',
		outline:
			'bg-transparent text-foreground border border-border hover:bg-muted disabled:opacity-50'
	};
</script>

<button
	class={cn('px-4 py-2 font-medium disabled:cursor-not-allowed', variants[variant], className)}
	{...restProps}
>
	{@render children?.()}
</button>
