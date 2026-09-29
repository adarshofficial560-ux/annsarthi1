/**
 * Client-Side Image Downscaler & Compressor
 * Compresses camera and gallery photos in browser memory before sending over HTTP.
 * Keeps resolution sharp (up to 1024px) for Gemini Multimodal Vision while shrinking
 * file sizes from ~8MB to ~100KB, preventing Vercel 4.5MB payload limits and timeouts.
 */

export async function compressImageFile(
  file: File | Blob,
  maxDimension = 1024,
  quality = 0.82
): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('Canvas compression only available in browser context');
  }

  // Path 1: Fast Hardware-Accelerated ImageBitmap (Handles EXIF orientation natively)
  if (typeof createImageBitmap !== 'undefined') {
    try {
      const bitmap = await createImageBitmap(file);
      let { width, height } = bitmap;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();
        return canvas.toDataURL('image/jpeg', quality);
      }
    } catch {
      // Fallback to standard Image element path below
    }
  }

  // Path 2: Universal HTML5 Image Element Fallback
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read file for compression'));

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Failed to load image element'));

      img.onload = () => {
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
