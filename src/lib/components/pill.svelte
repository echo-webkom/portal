<script lang="ts">
	import { cn } from '$lib/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	type Props = HTMLAttributes<HTMLSpanElement> & {
		status?: string;
	};

	let { status, class: className }: Props = $props();
</script>

<span
	class={cn(
		'bg-muted text-muted-foreground inline-flex rounded-full px-2 py-1 text-xs font-semibold',
		{
			'bg-success text-success-foreground': status === 'Møtt opp',
			'bg-info text-info-foreground': status === 'Kommer',
			'bg-destructive text-destructive-foreground': status === 'Fravær'
		},
		className
	)}
>
	{status}
</span>
