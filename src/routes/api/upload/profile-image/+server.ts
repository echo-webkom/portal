import { json, error } from '@sveltejs/kit';
import { BucketService } from '$lib/services/bucket-service.js';
import { db } from '$lib/db/drizzle.js';
import { users } from '$lib/db/schemas/users.js';
import { eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';
import { nanoid } from 'nanoid';

// Helper function to get file extension from content type
function getFileExtension(contentType: string): string {
	const mimeToExt: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/jpg': 'jpg',
		'image/png': 'png',
		'image/gif': 'gif',
		'image/webp': 'webp'
	};

	return mimeToExt[contentType] || 'jpg';
}

// Helper function to validate image file
function validateImageFile(file: File): { valid: boolean; error?: string } {
	const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
	const maxSize = 5 * 1024 * 1024; // 5MB

	if (!allowedTypes.includes(file.type)) {
		return {
			valid: false,
			error: 'Ugyldig filtype. Kun JPEG, PNG, GIF og WebP er tillatt.'
		};
	}

	if (file.size > maxSize) {
		return {
			valid: false,
			error: 'Filen er for stor. Maksimal størrelse er 5MB.'
		};
	}

	return { valid: true };
}

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check if user is authenticated
		if (!locals.user) {
			throw error(401, { message: 'Du må være innlogget for å laste opp bilder' });
		}

		// Parse form data
		const formData = await request.formData();
		const file = formData.get('image') as File;

		if (!file || !(file instanceof File)) {
			throw error(400, { message: 'Ingen fil valgt' });
		}

		// Validate the image file
		const validation = validateImageFile(file);
		if (!validation.valid) {
			throw error(400, { message: validation.error! });
		}

		// Generate unique filename
		const fileExtension = getFileExtension(file.type);
		const imageId = `user-${locals.user.id}-${nanoid()}`;
		const imageKey = `images/${imageId}.${fileExtension}`;

		// Convert file to buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Delete old profile image if exists
		const currentUser = await db
			.select({ imageUrl: users.imageUrl })
			.from(users)
			.where(eq(users.id, locals.user.id))
			.limit(1);

		if (currentUser[0]?.imageUrl) {
			try {
				// Extract image key from the current image URL
				const urlParts = currentUser[0].imageUrl.split('/');
				const oldImageKey = urlParts[urlParts.length - 1];

				// Try to delete the old image from S3
				// The key stored in the URL should be the full key with extension
				const oldS3Key = `images/${oldImageKey}`;
				if (await BucketService.exists(oldS3Key)) {
					await BucketService.delete(oldS3Key);
				}
			} catch (deleteError) {
				console.warn('Could not delete old profile image:', deleteError);
				// Continue with upload even if deletion fails
			}
		}

		// Upload new image to S3
		await BucketService.upload({
			key: imageKey,
			body: buffer,
			contentType: file.type
		});

		// Construct the full image URL using BASE_URL
		// Store the full key (with extension) in the URL so the serving endpoint can find it
		const imageKeyWithExtension = `${imageId}.${fileExtension}`;
		const imageUrl = `${env.BASE_URL}/api/images/${imageKeyWithExtension}`;

		// Update user's image URL in database
		await db
			.update(users)
			.set({
				imageUrl,
				updatedAt: new Date()
			})
			.where(eq(users.id, locals.user.id));

		return json({
			success: true,
			imageUrl,
			message: 'Profilbilde opplastet!'
		});
	} catch (err) {
		console.error('Error uploading profile image:', err);

		// Handle specific S3 errors
		if (err instanceof Error) {
			if (err.message.includes('network') || err.message.includes('timeout')) {
				throw error(503, { message: 'Tjenesten er midlertidig utilgjengelig' });
			}

			if (err.message.includes('access') || err.message.includes('denied')) {
				throw error(503, { message: 'Kunne ikke laste opp til lagring' });
			}
		}

		// Re-throw SvelteKit errors
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}

		// Generic server error
		throw error(500, { message: 'En feil oppstod under opplasting' });
	}
};
