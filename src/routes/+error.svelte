<script lang="ts">
	import { page } from '$app/state';
	import { ArrowLeft } from '@lucide/svelte';

	let errorTitle = $derived.by(() => {
		switch (page.status) {
			case 404:
				return 'Side ikke funnet';
			case 401:
				return 'Ikke autorisert';
			case 403:
				return 'Ingen tilgang';
			case 500:
				return 'Serverfeil';
			default:
				return 'Noe gikk galt';
		}
	});

	let errorDescription = $derived.by(() => {
		switch (page.status) {
			case 404:
				return 'Siden du leter etter eksisterer ikke eller har blitt flyttet.';
			case 401:
				return 'Du må logge inn for å få tilgang til denne siden.';
			case 403:
				return 'Du har ikke tilgang til denne ressursen.';
			case 500:
				return 'En intern serverfeil oppstod. Prøv igjen senere.';
			default:
				return 'En uventet feil oppstod. Prøv igjen senere.';
		}
	});

	let errorIcon = $derived.by(() => {
		switch (page.status) {
			case 404:
				return '🔍';
			case 401:
				return '🔒';
			case 403:
				return '🚫';
			case 500:
				return '⚠️';
			default:
				return '❗';
		}
	});
</script>

<svelte:head>
	<title>{errorTitle} - Webkom</title>
</svelte:head>

<div class="bg-background flex justify-center px-4 py-10">
	<div class="w-full max-w-md text-center">
		<div class="mb-8">
			<h1 class="text-foreground mb-2 text-4xl font-bold">
				{errorIcon}
				{page.status}
			</h1>
			<h2 class="text-muted-foreground mb-4 text-xl font-semibold">{errorTitle}</h2>
			<p class="text-muted-foreground mb-8">{errorDescription}</p>

			{#if page.error?.message && page.status !== 404}
				<div class="mb-8 border border-red-200 bg-red-50 p-4 text-left">
					<p class="text-sm text-red-800">{page.error.message}</p>
				</div>
			{/if}
		</div>

		<div class="space-y-4">
			<a
				href="/"
				class="bg-muted text-foreground hover:bg-table-row-hover flex w-full items-center justify-center gap-2 px-4 py-2 transition-colors"
			>
				<ArrowLeft size={16} />
				Til forsiden
			</a>
		</div>

		{#if page.status === 404}
			<div class="text-muted-foreground mt-8 text-sm">
				<p>
					Prøv å sjekke URL-en for skrivefeil, eller bruk navigasjonen til å finne det du leter
					etter.
				</p>
			</div>
		{/if}
	</div>
</div>
