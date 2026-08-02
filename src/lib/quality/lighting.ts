export interface LightingAnalysisResult {
  meanBrightness: number; // 0 - 255
  isUnderexposed: boolean; // mean < 70
  isOverexposed: boolean; // mean > 205
  hasDirectionalShadow: boolean; // Left vs Right face luminance difference > 25%
}

export function analyzeLighting(imageData: ImageData): LightingAnalysisResult {
  const { data, width, height } = imageData;
  let totalLuminance = 0;
  let pixelCount = 0;

  let leftSum = 0;
  let leftCount = 0;

  let rightSum = 0;
  let rightCount = 0;

  const halfWidth = width / 2;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;

      totalLuminance += luma;
      pixelCount++;

      if (x < halfWidth) {
        leftSum += luma;
        leftCount++;
      } else {
        rightSum += luma;
        rightCount++;
      }
    }
  }

  const meanBrightness = pixelCount > 0 ? Math.round(totalLuminance / pixelCount) : 128;
  const leftMean = leftCount > 0 ? leftSum / leftCount : meanBrightness;
  const rightMean = rightCount > 0 ? rightSum / rightCount : meanBrightness;

  const shadowDiff = Math.abs(leftMean - rightMean);

  return {
    meanBrightness,
    isUnderexposed: meanBrightness < 75,
    isOverexposed: meanBrightness > 210,
    hasDirectionalShadow: shadowDiff > 35,
  };
}
