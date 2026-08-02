import { removeBackground } from '@imgly/background-removal';
import { whitenBackground } from './whiten';

export interface AIBackgroundProgress {
  progress: number; // 0 to 1
  stage: string;
}

/**
 * Removes background using client-side AI ML model (@imgly/background-removal)
 * and composite subject onto solid targetHex background canvas.
 */
export async function removeBackgroundAI(
  imageSource: Blob | File | string,
  targetHex: string = '#FFFFFF',
  onProgress?: (info: AIBackgroundProgress) => void
): Promise<string> {
  try {
    const blob = await removeBackground(imageSource, {
      progress: (key: string, current: number, total: number) => {
        if (onProgress && total > 0) {
          onProgress({
            stage: key,
            progress: Math.min(1, current / total),
          });
        }
      },
    });

    // Create an image from the transparent PNG blob
    const imgUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.src = imgUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // Composite onto solid background color canvas
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return imgUrl;

    // Fill background color
    ctx.fillStyle = targetHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw transparent foreground subject
    ctx.drawImage(img, 0, 0);

    URL.revokeObjectURL(imgUrl);
    return canvas.toDataURL('image/png');
  } catch (err) {
    console.warn('AI background removal model fallback to threshold whitening:', err);

    // Fallback: draw image to canvas and perform threshold whiten
    const img = new Image();
    const inputUrl = typeof imageSource === 'string' ? imageSource : URL.createObjectURL(imageSource);
    img.src = inputUrl;

    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(img, 0, 0);
      const whitenedCanvas = whitenBackground(canvas, targetHex);
      return whitenedCanvas.toDataURL('image/jpeg', 0.95);
    }

    return inputUrl;
  }
}
