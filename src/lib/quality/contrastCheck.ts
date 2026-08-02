export interface ClothingContrastResult {
  hasLowContrast: boolean;
  contrastRatio: number;
  recommendation: string;
}

/**
 * Analyzes pixel samples in the lower left & right shoulder regions of the photo
 * to verify if clothing contrast against background meets government specs.
 * Light/white clothing on white background causes passport office rejection.
 */
export function checkClothingContrast(
  imageData: ImageData,
  bgHex: string = '#FFFFFF'
): ClothingContrastResult {
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;

  const bgR = parseInt(bgHex.slice(1, 3), 16) || 255;
  const bgG = parseInt(bgHex.slice(3, 5), 16) || 255;
  const bgB = parseInt(bgHex.slice(5, 7), 16) || 255;
  const bgLuma = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

  // Sample shoulder region pixels (lower 20% of frame, left 25% and right 25%)
  const startY = Math.floor(height * 0.75);
  const endY = Math.floor(height * 0.95);

  let totalLuma = 0;
  let sampleCount = 0;

  // Sample left shoulder
  for (let y = startY; y < endY; y += 4) {
    for (let x = Math.floor(width * 0.1); x < Math.floor(width * 0.35); x += 4) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuma += luma;
      sampleCount++;
    }
  }

  // Sample right shoulder
  for (let y = startY; y < endY; y += 4) {
    for (let x = Math.floor(width * 0.65); x < Math.floor(width * 0.9); x += 4) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      totalLuma += luma;
      sampleCount++;
    }
  }

  const avgShoulderLuma = sampleCount > 0 ? totalLuma / sampleCount : 128;
  const diff = Math.abs(bgLuma - avgShoulderLuma);
  const contrastRatio = Math.round((diff / 255) * 100);

  const hasLowContrast = contrastRatio < 18 && bgLuma > 200; // light background & high shoulder luma

  return {
    hasLowContrast,
    contrastRatio,
    recommendation: hasLowContrast
      ? 'Low clothing-to-background contrast detected. Wearing a white or light-colored shirt on a light background can cause application rejection at passport control. We recommend wearing a dark or contrasting shirt.'
      : 'Good clothing contrast relative to background.',
  };
}
