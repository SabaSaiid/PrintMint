/**
  * Computes the variance of the Laplacian operator over grayscale image pixels.
  * Low variance (< 100) indicates a blurry or out-of-focus image.
  */
export function computeBlurScore(imageData: ImageData): { score: number; isBlurry: boolean } {
  const { data, width, height } = imageData;
  const grayscale = new Float32Array(width * height);

  // Convert RGBA to Grayscale (Luminance)
  for (let i = 0; i < data.length; i += 4) {
    grayscale[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  // Apply 3x3 Laplacian Kernel:
  // [ 0,  1,  0 ]
  // [ 1, -4,  1 ]
  // [ 0,  1,  0 ]
  let sum = 0;
  let sumSq = 0;
  let count = 0;

  for (let y = 1; y < height - 1; y += 2) {
    // Sample every 2nd row for speed
    for (let x = 1; x < width - 1; x += 2) {
      const idx = y * width + x;

      const laplacian =
        grayscale[idx - width] +
        grayscale[idx - 1] -
        4 * grayscale[idx] +
        grayscale[idx + 1] +
        grayscale[idx + width];

      sum += laplacian;
      sumSq += laplacian * laplacian;
      count++;
    }
  }

  if (count === 0) return { score: 200, isBlurry: false };

  const mean = sum / count;
  const variance = sumSq / count - mean * mean;

  // Threshold for sharp passport photos is typically variance > 100
  const isBlurry = variance < 90;

  return {
    score: Math.round(variance),
    isBlurry,
  };
}
