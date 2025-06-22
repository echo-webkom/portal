<script lang="ts">
	import { onMount } from 'svelte';
	import { Palette } from '@lucide/svelte';

	type Theme = 'light' | 'dark' | 'air' | 'neon';

	let currentTheme: Theme = $state('light');
	let isOpen = $state(false);

	const themes: { value: Theme; label: string }[] = [
		{ value: 'light', label: 'Lys' },
		{ value: 'dark', label: 'Mørk' },
		{ value: 'air', label: 'Air' },
		{ value: 'neon', label: 'Neon' }
	];

	function setTheme(theme: Theme) {
		currentTheme = theme;
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		isOpen = false;
	}

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	onMount(() => {
		// Get theme from localStorage or default to light
		const savedTheme = localStorage.getItem('theme') as Theme;
		if (savedTheme && ['light', 'dark', 'air', 'neon'].includes(savedTheme)) {
			currentTheme = savedTheme;
			document.documentElement.setAttribute('data-theme', savedTheme);
		}

		// Close dropdown when clicking outside
		function handleClickOutside(event: MouseEvent) {
			if (!(event.target as Element).closest('.theme-switcher')) {
				isOpen = false;
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="theme-switcher relative">
	<button
		onclick={toggleDropdown}
		class="text-foreground hover:bg-muted flex items-center gap-2 rounded px-3 py-2 text-sm"
		aria-label="Bytt tema"
	>
		<Palette class="size-4" />
		<span class="hidden sm:inline">{themes.find((t) => t.value === currentTheme)?.label}</span>
	</button>

	{#if isOpen}
		<div
			class="border-border bg-dropdown absolute top-full right-0 z-50 mt-1 w-32 rounded border py-1"
		>
			{#each themes as theme (theme.value)}
				<button
					onclick={() => setTheme(theme.value)}
					class="text-foreground hover:bg-dropdown-hover w-full px-4 py-2 text-left text-sm {currentTheme ===
					theme.value
						? 'bg-accent font-medium'
						: ''}"
				>
					{theme.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
