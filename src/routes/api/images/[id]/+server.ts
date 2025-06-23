import { error } from '@sveltejs/kit';
import { BucketService } from '$lib/services/bucket-service.js';
import type { RequestHandler } from './$types';

// Helper function to determine content type from file extension
function getContentType(key: string): string {
	const extension = key.split('.').pop()?.toLowerCase();

	const mimeTypes: Record<string, string> = {
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml',
		bmp: 'image/bmp',
		ico: 'image/x-icon',
		tiff: 'image/tiff',
		tif: 'image/tiff'
	};

	return mimeTypes[extension || ''] || 'application/octet-stream';
}

// Helper function to convert AWS SDK stream to buffer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function streamToBuffer(stream: any): Promise<Buffer> {
	// Handle different types of streams from AWS SDK
	if (stream instanceof Buffer) {
		return stream;
	}

	if (typeof stream === 'string') {
		return Buffer.from(stream);
	}

	// For Node.js streams (most common in server environment)
	if (stream && typeof stream.pipe === 'function') {
		const chunks: Buffer[] = [];

		return new Promise((resolve, reject) => {
			stream.on('data', (chunk: Buffer) => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	// For web ReadableStream (if in edge runtime)
	if (stream && typeof stream.getReader === 'function') {
		const reader = stream.getReader();
		const chunks: Uint8Array[] = [];

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) break;
				chunks.push(value);
			}
		} finally {
			reader.releaseLock();
		}

		const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
		const result = new Uint8Array(totalLength);
		let offset = 0;

		for (const chunk of chunks) {
			result.set(chunk, offset);
			offset += chunk.length;
		}

		return Buffer.from(result);
	}

	// Fallback: try to convert to buffer directly
	return Buffer.from(stream);
}

export const GET: RequestHandler = async ({ params }) => {
	try {
		const { id } = params;

		if (!id) {
			throw error(400, { message: 'Image ID is required' });
		}

		// Construct the S3 key for the image
		// The id parameter now includes the file extension (e.g., "user-123-abc.jpg")
		let imageKey = `images/${id}`;

		// Check if the image exists with the provided key
		const exists = await BucketService.exists(imageKey);
		if (!exists) {
			// If the id doesn't include extension, try common extensions
			if (!id.includes('.')) {
				const extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
				let foundKey: string | null = null;

				for (const ext of extensions) {
					const keyWithExt = `images/${id}.${ext}`;
					if (await BucketService.exists(keyWithExt)) {
						foundKey = keyWithExt;
						break;
					}
				}

				if (!foundKey) {
					throw error(404, { message: 'Image not found' });
				}

				imageKey = foundKey;
			} else {
				// The key includes extension but still not found
				throw error(404, { message: 'Image not found' });
			}
		}

		// Download the image from S3
		const s3Response = await BucketService.download(imageKey);

		if (!s3Response.Body) {
			throw error(404, { message: 'Image data not found' });
		}

		// Convert the stream to buffer
		const imageBuffer = await streamToBuffer(s3Response.Body);

		// Determine content type
		const contentType = s3Response.ContentType || getContentType(imageKey);

		// Return the image with appropriate headers
		return new Response(imageBuffer, {
			status: 200,
			headers: {
				'Content-Type': contentType,
				'Content-Length': imageBuffer.length.toString(),
				'Cache-Control': 'public, max-age=86400, immutable', // Cache for 24 hours
				ETag: s3Response.ETag || '',
				'Last-Modified': s3Response.LastModified?.toUTCString() || new Date().toUTCString()
			}
		});
	} catch (err) {
		console.error('Error serving image:', err);

		// Handle S3 specific errors
		if (err instanceof Error) {
			if (err.name === 'NoSuchKey' || err.name === 'NotFound') {
				throw error(404, { message: 'Image not found' });
			}

			if (err.name === 'AccessDenied') {
				throw error(403, { message: 'Access denied to image' });
			}

			if (err.message.includes('network') || err.message.includes('timeout')) {
				throw error(503, { message: 'Service temporarily unavailable' });
			}
		}

		// Handle AWS SDK errors that might have different structure
		if (typeof err === 'object' && err !== null && '$metadata' in err) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const awsError = err as any;
			if (awsError.name === 'NoSuchKey' || awsError.name === 'NotFound') {
				throw error(404, { message: 'Image not found' });
			}
		}

		// Re-throw SvelteKit errors
		if (typeof err === 'object' && err !== null && 'status' in err) {
			throw err;
		}

		// Generic server error
		throw error(500, { message: 'Internal server error' });
	}
};
