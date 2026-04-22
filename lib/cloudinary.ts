import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(
  file: Buffer,
  fileName: string
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "koprubaşı-gazete",
        public_id: `haber_${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, "_")}`,
        transformation: [{ width: 1200, height: 800, crop: "limit" }],
      },
      (error, result) => {
        if (error || !result) {
          reject(error || new Error("Yükleme başarısız"));
        } else {
          resolve({ url: result.secure_url, publicId: result.public_id });
        }
      }
    );
    stream.end(file);
  });
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

// URL'den doğrudan Cloudinary'ye yükler. Haber ajanı RSS'ten bulduğu görseli kendi CDN'imize taşımak için kullanır.
export async function uploadImageFromUrl(url: string): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder: "koprubaşı-gazete/ajan",
      public_id: `ajan_${Date.now()}`,
      transformation: [{ width: 1200, height: 800, crop: "limit" }],
      timeout: 15000,
    });
    return result.secure_url;
  } catch {
    return null;
  }
}

export default cloudinary;
