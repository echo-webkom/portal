<script lang="ts">
	import { getUser } from '$lib/contexts/user-context';
	import { Plus, ExternalLink, Users, Menu, X } from '@lucide/svelte';
	import ThemeSwitcher from './theme-switcher.svelte';

	let user = getUser();
	let isMenuOpen = $state(false);

	function toggleMenu() {
		isMenuOpen = !isMenuOpen;
	}

	function closeMenu() {
		isMenuOpen = false;
	}
</script>

<header
	class="border-border bg-card relative flex items-center justify-between border-b-2 px-4 py-4 md:px-8"
>
	<div class="flex items-center">
		<a href="/" class="text-foreground hover:text-primary"
			><h1 class="text-lg md:text-xl">Webkom</h1></a
		>

		<!-- Desktop Navigation -->
		<nav class="ml-6 hidden items-center space-x-6 md:flex">
			{#if $user}
				<a
					href="/mote/ny"
					class="text-foreground hover:text-primary flex items-center gap-2 text-sm hover:underline"
				>
					<Plus class="size-4" />
					<span>Nytt møte</span>
				</a>
			{/if}
			<a
				href="/medlemmer"
				class="text-foreground hover:text-primary flex items-center gap-2 text-sm hover:underline"
			>
				<Users class="size-4" />
				<span>Medlemmer</span>
			</a>
			<a
				href="https://pizza.echo-webkom.no"
				target="_blank"
				rel="noopener noreferrer"
				class="text-foreground hover:text-primary flex items-center gap-2 text-sm hover:underline"
			>
				<ExternalLink class="size-4" />
				<span>Pizza-formelen</span>
			</a>
		</nav>
	</div>

	<div class="flex items-center gap-4">
		{#if $user}
			<a href="/profil/{$user.id}" class="text-foreground hover:text-primary hover:underline">
				{$user.name}
			</a>
		{/if}

		<ThemeSwitcher />

		<!-- Mobile Menu Button -->
		<button
			onclick={toggleMenu}
			class="text-muted-foreground hover:text-foreground p-2 md:hidden"
			aria-label="Toggle menu"
		>
			{#if isMenuOpen}
				<X class="size-5" />
			{:else}
				<Menu class="size-5" />
			{/if}
		</button>
	</div>

	<!-- Mobile Navigation Menu -->
	{#if isMenuOpen}
		<nav class="bg-card border-border absolute top-full right-0 left-0 z-50 border-b md:hidden">
			<div class="flex flex-col space-y-1 p-4">
				{#if $user}
					<a
						href="/mote/ny"
						onclick={closeMenu}
						class="text-foreground hover:bg-muted flex items-center gap-3 p-3 text-sm"
					>
						<Plus class="size-4" />
						<span>Nytt møte</span>
					</a>
				{/if}
				<a
					href="/medlemmer"
					onclick={closeMenu}
					class="text-foreground hover:bg-muted flex items-center gap-3 p-3 text-sm"
				>
					<Users class="size-4" />
					<span>Medlemmer</span>
				</a>
				<a
					href="https://pizza.echo-webkom.no"
					target="_blank"
					rel="noopener noreferrer"
					onclick={closeMenu}
					class="text-foreground hover:bg-muted flex items-center gap-3 p-3 text-sm"
				>
					<ExternalLink class="size-4" />
					<span>Pizza-formelen</span>
				</a>
			</div>
		</nav>
	{/if}
</header>
