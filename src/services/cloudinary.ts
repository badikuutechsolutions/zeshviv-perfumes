/**
 * Cloudinary upload service for product images.
 * Uses unsigned upload preset — no API secret needed in frontend.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn(
    'Cloudinary credentials missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env'
  );
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload an image file to Cloudinary.
 * Returns the secure URL and metadata.
 */
export async function uploadImage(file: File): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'zeshviv-perfumes');

  const response = await fetch(UPLOAD_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to upload image');
  }

  const data = await response.json();
  return {
    secure_url: data.secure_url,
    public_id: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    bytes: data.bytes,
  };
}

/**
 * Generate a Cloudinary transformation URL for optimized images.
 * Use this for product cards (smaller) vs detail pages (larger).
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: string; format?: string } = {}
): string {
  const { width = 400, height = 400, quality = 'auto', format = 'auto' } = options;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_${width},h_${height},c_fill,q_${quality},f_${format}/${publicId}`;
}

/**
 * Extract public_id from a full Cloudinary URL.
 */
export function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)\.\w+$/);
  return match ? match[1] : null;
}
