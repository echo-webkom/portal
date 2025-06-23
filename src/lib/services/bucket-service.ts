import { env } from '$env/dynamic/private';
import {
	S3Client,
	PutObjectCommand,
	GetObjectCommand,
	DeleteObjectCommand,
	HeadObjectCommand,
	ListObjectsV2Command,
	type PutObjectCommandOutput,
	type GetObjectCommandOutput,
	type DeleteObjectCommandOutput
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

interface UploadParams {
	key: string;
	body: Buffer | Uint8Array | string;
	contentType?: string;
	metadata?: Record<string, string>;
}

interface PresignedUrlParams {
	key: string;
	expiresIn?: number; // seconds, default 3600 (1 hour)
	operation: 'upload' | 'download';
}

export interface BucketObject {
	key: string;
	size: number;
	lastModified: Date;
	etag: string;
}

export interface ListObjectsResult {
	objects: BucketObject[];
	isTruncated: boolean;
	nextContinuationToken?: string;
}

export const s3Client = new S3Client({
	region: env.AWS_REGION!,
	credentials: {
		accessKeyId: env.AWS_S3_ACCESS_KEY_ID!,
		secretAccessKey: env.AWS_S3_SECRET_ACCESS_KEY!
	}
});

export const BUCKET_NAME = env.AWS_S3_BUCKET_NAME;

export class BucketService {
	/**
	 * Upload a file to the S3 bucket
	 */
	static async upload({
		key,
		body,
		contentType,
		metadata
	}: UploadParams): Promise<PutObjectCommandOutput> {
		try {
			const command = new PutObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key,
				Body: body,
				ContentType: contentType,
				Metadata: metadata
			});

			return await s3Client.send(command);
		} catch (error) {
			console.error('Error uploading file to S3:', error);
			throw new Error(
				`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Download a file from the S3 bucket
	 */
	static async download(key: string): Promise<GetObjectCommandOutput> {
		try {
			const command = new GetObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key
			});

			return await s3Client.send(command);
		} catch (error) {
			console.error('Error downloading file from S3:', error);
			throw new Error(
				`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Delete a file from the S3 bucket
	 */
	static async delete(key: string): Promise<DeleteObjectCommandOutput> {
		try {
			const command = new DeleteObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key
			});

			return await s3Client.send(command);
		} catch (error) {
			console.error('Error deleting file from S3:', error);
			throw new Error(
				`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Check if a file exists in the S3 bucket
	 */
	static async exists(key: string): Promise<boolean> {
		try {
			const command = new HeadObjectCommand({
				Bucket: BUCKET_NAME,
				Key: key
			});

			await s3Client.send(command);
			return true;
		} catch (error) {
			// If the error is NoSuchKey, the file doesn't exist
			if (error instanceof Error && error.name === 'NoSuchKey') {
				return false;
			}
			// For other errors, re-throw
			throw error;
		}
	}

	/**
	 * List objects in the S3 bucket
	 */
	static async list(prefix: string): Promise<ListObjectsResult> {
		try {
			const command = new ListObjectsV2Command({
				Bucket: BUCKET_NAME,
				Prefix: prefix,
				MaxKeys: 100
			});

			const response = await s3Client.send(command);

			const objects: BucketObject[] = (response.Contents || []).map((obj) => ({
				key: obj.Key!,
				size: obj.Size!,
				lastModified: obj.LastModified!,
				etag: obj.ETag!
			}));

			return {
				objects,
				isTruncated: response.IsTruncated || false,
				nextContinuationToken: response.NextContinuationToken
			};
		} catch (error) {
			console.error('Error listing objects from S3:', error);
			throw new Error(
				`Failed to list objects: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}

	/**
	 * Generate a presigned URL for uploading or downloading files
	 */
	static async getPresignedUrl({
		key,
		expiresIn = 3600,
		operation
	}: PresignedUrlParams): Promise<string> {
		try {
			let command;

			if (operation === 'upload') {
				command = new PutObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key
				});
			} else {
				command = new GetObjectCommand({
					Bucket: BUCKET_NAME,
					Key: key
				});
			}

			return await getSignedUrl(s3Client, command, { expiresIn });
		} catch (error) {
			console.error('Error generating presigned URL:', error);
			throw new Error(
				`Failed to generate presigned URL: ${error instanceof Error ? error.message : 'Unknown error'}`
			);
		}
	}
}
