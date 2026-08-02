/**
 * Fast client-side threshold whitening for passport photo backgrounds.
 * Samples top corner pixels to determine background tint, then replaces light background pixels
 * with target color while leaving face/hair features untouched.
 */
export function whitenBackground(
  inputCanvas: HTMLCanvasElement,
  targetHex: string = '#FFFFFF'
): HTMLCanvasElement {
  const outputCanvas = document.createElement('canvas');
  outputCanvas.width = inputCanvas.width;
  outputCanvas.height = inputCanvas.height;

  const ctx = outputCanvas.getContext('2d');
  if (!ctx) return inputCanvas;

  ctx.drawImage(inputCanvas, 0, 0);
  const imgData = ctx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
  const data = imgData.data;

  // Convert target hex to RGB
  const targetR = parseInt(targetHex.slice(1, 3), 16) || 255;
  const targetG = parseInt(targetHex.slice(3, 5), 16) || 255;
  const targetB = parseInt(targetHex.slice(5, 7), 16) || 255;

  // Sample corner pixel luminances (top-left, top-right)
  const topLeftR = data[0];
  const topLeftG = data[1];
  const topLeftB = data[2];

  const topRightIdx = (outputCanvas.width - 1) * 4;
  const topRightR = data[topRightIdx];
  const topRightG = data[topRightIdx + 1];
  const topRightB = data[topRightIdx + 2];

  const bgAvgR = (topLeftR + topRightR) / 2;
  const bgAvgG = (topLeftG + topRightG) / 2;
  const bgAvgB = (topLeftB + topRightB) / 2;

  // Threshold whitening loop
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;

    // Check distance from sampled background color
    const dist = Math.sqrt(
      Math.pow(r - bgAvgR, 2) + Math.pow(g - bgAvgG, 2) + Math.pow(b - bgAvgB, 2)
    );

    // If pixel is high luminance (> 180) and close to background tint, whiten it
    if (luma > 170 && dist < 70) {
      data[i] = targetR;
      data[i + 1] = targetG;
      data[i + 2] = targetB;
    } else if (luma > 195) {
      // General high-light background replacement
      const blend = (luma - 195) / (255 - 195);
      data[i] = Math.round(r * (1 - blend) + targetR * blend);
      data[i + 1] = Math.round(g * (1 - blend) + targetG * blend);
      data[i + 2] = Math.round(b * (1 - blend) + targetB * blend);
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return outputCanvas;
}
