import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

// Set up memory storage for multer
const storage = multer.memoryStorage();
export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Configure Cloudinary lazily to prevent crashing if credentials are not provided yet
function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret || cloudName === 'MY_CLOUDINARY_CLOUD_NAME') {
    return null;
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });

  return cloudinary;
}

export async function uploadToCloudinary(fileBuffer: Buffer, originalName: string): Promise<string> {
  const client = getCloudinary();

  if (!client) {
    console.log('[CLOUDINARY SIMULATION] Credentials not set. Falling back to Unsplash stock image.');
    // Fallback to a sleek product placeholder image
    return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600';
  }

  return new Promise((resolve, reject) => {
    const cleanName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
    const uploadStream = client.uploader.upload_stream(
      {
        folder: 'ecommerce_products',
        public_id: `${cleanName}_${Date.now()}`,
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          resolve(result?.secure_url || '');
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}
