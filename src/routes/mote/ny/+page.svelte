<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/button.svelte';
	import Input from '$lib/components/input.svelte';
	import Label from '$lib/components/label.svelte';
	import Textarea from '$lib/components/textarea.svelte';

	let { form } = $props();

	// Default to next Wednesday
	function getNextWednesday(): string {
		const today = new Date();
		const daysUntilWednesday = (3 - today.getDay() + 7) % 7;
		const nextWednesday = new Date(today);
		nextWednesday.setDate(today.getDate() + (daysUntilWednesday || 7));
		return nextWednesday.toISOString().split('T')[0];
	}

	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Nytt møte - Webkom</title>
</svelte:head>

<div class="mx-auto max-w-3xl">
	<h1 class="text-foreground mb-8 text-3xl font-bold">Opprett nytt møte</h1>

	{#if form?.message}
		<div
			class="mb-6 p-4 {form.message.includes('Kunne ikke')
				? 'border border-red-200 bg-red-50 text-red-800'
				: 'border border-red-200 bg-red-50 text-red-800'}"
		>
			{form.message}
		</div>
	{/if}

	<form
		method="POST"
		class="space-y-6"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
	>
		<div>
			<Label for="title" required>Møtetittel</Label>
			<Input
				type="text"
				id="title"
				name="title"
				value={form?.title || ''}
				required
				placeholder="f.eks. Webkom møte"
			/>
		</div>

		<div>
			<Label for="description">Beskrivelse</Label>
			<Textarea
				id="description"
				name="description"
				rows={3}
				value={form?.description || ''}
				placeholder="Beskrivelse av møtet (valgfritt)"
			></Textarea>
		</div>

		<div>
			<Label for="date" required>Dato</Label>
			<Input type="date" id="date" name="date" value={form?.date || getNextWednesday()} required />
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div>
				<Label for="startTime" required>Starttid</Label>
				<Input
					type="time"
					id="startTime"
					name="startTime"
					value={form?.startTime || '16:15'}
					required
				/>
			</div>

			<div>
				<Label for="endTime" required>Sluttid</Label>
				<Input type="time" id="endTime" name="endTime" value={form?.endTime || '18:00'} required />
			</div>
		</div>

		<div class="flex items-center justify-between pt-4">
			<a href="/" class="text-muted-foreground hover:text-foreground px-4 py-2 transition-colors"
				>Avbryt</a
			>
			<Button type="submit" disabled={isSubmitting}>
				{isSubmitting ? 'Oppretter...' : 'Opprett møte'}
			</Button>
		</div>
	</form>
</div>
