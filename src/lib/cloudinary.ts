export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
export const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export function isCloudinaryConfigured() {
  return Boolean(cloudinaryCloudName && cloudinaryUploadPreset);
}

export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary chưa được cấu hình.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Không thể tải ảnh lên Cloudinary.");
  }

  const result = await response.json();

  if (!result.secure_url) {
    throw new Error("Cloudinary không trả về URL ảnh.");
  }

  return result.secure_url;
}
