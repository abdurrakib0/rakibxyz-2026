/**
 * Client-side Smart Image Compressor
 * Resizes ultra-large images and encodes to modern WebP/JPEG format
 * Dramatically reduces file size (typically 80-95% smaller) while preserving high visual quality.
 */

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  reductionPercent: number;
  previewUrl: string;
}

export async function compressImage(
  file: File,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
    format?: 'image/webp' | 'image/jpeg';
  } = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    format = 'image/webp',
  } = options;

  // If already small SVG or not an image, return original
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      reductionPercent: 0,
      previewUrl: URL.createObjectURL(file),
    };
  }

  return new Promise((resolve, reject) => {
    const originalSize = file.size;
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio preserving dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          return resolve({
            file,
            originalSize,
            compressedSize: originalSize,
            reductionPercent: 0,
            previewUrl: URL.createObjectURL(file),
          });
        }

        // Use high quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP blob
        const targetMime = format;
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                originalSize,
                compressedSize: originalSize,
                reductionPercent: 0,
                previewUrl: URL.createObjectURL(file),
              });
            }

            const cleanFileName = file.name.replace(/\.[^/.]+$/, '') + '.webp';
            const compressedFile = new File([blob], cleanFileName, {
              type: targetMime,
              lastModified: Date.now(),
            });

            const compressedSize = compressedFile.size;
            const reductionPercent = Math.max(
              0,
              Math.round(((originalSize - compressedSize) / originalSize) * 100)
            );

            resolve({
              file: compressedFile,
              originalSize,
              compressedSize,
              reductionPercent,
              previewUrl: URL.createObjectURL(blob),
            });
          },
          targetMime,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for compression'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
