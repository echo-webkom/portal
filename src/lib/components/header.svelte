<script lang="ts">
	import { getUser } from '$lib/contexts/user-context';
	import { ExternalLink, Users, Menu, X, Calendar } from '@lucide/svelte';
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

<header>
	<div
		class="border-border bg-card relative flex items-center justify-between border-b px-4 py-4 md:px-8"
	>
		<div class="flex items-center">
			<a href="/" class="text-foreground hover:text-primary"
				><h1 class="text-lg md:text-xl">Webkom</h1></a
			>
		</div>

		<div class="flex items-center gap-4">
			{#if $user}
				<a
					href="/profil/{$user.id}"
					class="text-foreground hover:text-primary text-sm hover:underline"
				>
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
							href="/timeplan"
							onclick={closeMenu}
							class="text-foreground hover:bg-muted flex items-center gap-3 p-3 text-sm"
						>
							<Calendar class="size-4" />
							<span>Timeplan</span>
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
	</div>

	<!-- Secondary Navigation -->
	<nav class="border-border bg-card hidden border-b px-4 py-2 md:block md:px-8">
		<div class="flex items-center space-x-6">
			{#if $user}
				<a
					href="/timeplan"
					class="text-foreground hover:text-primary hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
				>
					<Calendar class="size-4" />
					<span>Timeplan</span>
				</a>
			{/if}
			<a
				href="/medlemmer"
				class="text-foreground hover:text-primary hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
			>
				<Users class="size-4" />
				<span>Medlemmer</span>
			</a>
			<a
				href="https://pizza.echo-webkom.no"
				target="_blank"
				rel="noopener noreferrer"
				class="text-foreground hover:text-primary hover:bg-muted flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors"
			>
				<ExternalLink class="size-4" />
				<span>Pizza-formelen</span>
			</a>
		</div>
	</nav>
</header>
