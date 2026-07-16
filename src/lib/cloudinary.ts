export const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "";
export const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "";

export function isCloudinaryConfigured() {
  return Boolean(cloudinaryCloudName && cloudinaryUploadPreset);
}

interface UploadImageOptions {
  convertToWebp?: boolean;
  webpQuality?: number;
}

export async function convertImageFileToWebp(file: File, quality = 0.7): Promise<File> {
  if (!/^image\/(png|jpe?g)$/i.test(file.type)) return file;

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Không đọc được ảnh để chuyển sang WebP."));
      element.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context || !canvas.width || !canvas.height) {
      throw new Error("Không thể xử lý kích thước ảnh.");
    }
    context.drawImage(image, 0, 0);

    const normalizedQuality = Math.min(1, Math.max(0, quality));
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result?.type === "image/webp") resolve(result);
        else reject(new Error("Trình duyệt không thể xuất ảnh WebP."));
      }, "image/webp", normalizedQuality);
    });
    const webpName = `${file.name.replace(/\.[^/.]+$/, "")}.webp`;
    return new File([blob], webpName, { type: "image/webp", lastModified: file.lastModified });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function uploadImageToCloudinary(file: File, options: UploadImageOptions = {}): Promise<string> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary chưa được cấu hình.");
  }

  const uploadFile = options.convertToWebp
    ? await convertImageFileToWebp(file, options.webpQuality ?? 0.7)
    : file;
  const formData = new FormData();
  formData.append("file", uploadFile);
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
