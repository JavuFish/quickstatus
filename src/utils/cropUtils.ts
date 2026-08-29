/**
 * Automatically crops an image (DataURL or URL) to 9:16 aspect ratio (center crop)
 * Outputting a high-quality JPEG DataURL.
 */
export async function cropImageTo9x16(imageUrl: string): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const originalWidth = img.naturalWidth || img.width;
        const originalHeight = img.naturalHeight || img.height;

        const targetAspect = 9 / 16;
        const currentAspect = originalWidth / originalHeight;

        // If it is already exactly or very close to 9:16, return original
        if (Math.abs(currentAspect - targetAspect) < 0.01) {
          resolve(imageUrl);
          return;
        }

        let cropWidth = originalWidth;
        let cropHeight = originalHeight;
        let cropX = 0;
        let cropY = 0;

        if (currentAspect > targetAspect) {
          // Image is wider than 9:16 -> crop left & right
          cropWidth = Math.round(originalHeight * targetAspect);
          cropX = Math.round((originalWidth - cropWidth) / 2);
        } else {
          // Image is taller than 9:16 -> crop top & bottom
          cropHeight = Math.round(originalWidth / targetAspect);
          cropY = Math.round((originalHeight - cropHeight) / 2);
        }

        const canvas = document.createElement("canvas");
        // Maintain high resolution (target standard 1080 x 1920 or native crop dimension)
        const targetOutputWidth = Math.max(1080, Math.min(cropWidth, 1080));
        const targetOutputHeight = Math.round(targetOutputWidth * (16 / 9));

        canvas.width = targetOutputWidth;
        canvas.height = targetOutputHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw cropped portion onto 9:16 canvas
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropWidth,
          cropHeight,
          0,
          0,
          targetOutputWidth,
          targetOutputHeight
        );

        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch (err) {
        console.warn("Auto 9:16 crop failed, using original:", err);
        resolve(imageUrl);
      }
    };
    img.onerror = () => {
      resolve(imageUrl);
    };
    img.src = imageUrl;
  });
}
