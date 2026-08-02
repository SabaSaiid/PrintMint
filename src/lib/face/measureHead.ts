import { FaceDetectionResult, PhotoPreset } from '../../types';

export interface AutoCropArea {
  x: number; // Crop box top-left X (pixels)
  y: number; // Crop box top-left Y (pixels)
  width: number; // Crop box width (pixels)
  height: number; // Crop box height (pixels)
}

export function calculateAutoCrop(
  imgW: number,
  imgH: number,
  face: FaceDetectionResult,
  preset: PhotoPreset
): AutoCropArea {
  if (!face.hasFace) {
    // Default center crop matching aspect ratio
    let cropH = imgH * 0.8;
    let cropW = cropH * preset.aspectRatio;

    if (cropW > imgW) {
      cropW = imgW * 0.8;
      cropH = cropW / preset.aspectRatio;
    }

    return {
      x: Math.round((imgW - cropW) / 2),
      y: Math.round((imgH - cropH) / 2),
      width: Math.round(cropW),
      height: Math.round(cropH),
    };
  }

  // Convert normalized face coordinates to actual pixel values
  const headTopYPx = face.headBounds.topY * imgH;
  const chinYPx = face.headBounds.chinY * imgH;
  const headHeightPx = Math.abs(chinYPx - headTopYPx);

  // Target head height ratio (midpoint of preset min and max, e.g. (0.70 + 0.80) / 2 = 0.75)
  const targetHeadRatio = (preset.headHeightMinRatio + preset.headHeightMaxRatio) / 2;

  // Desired crop height in pixels
  let cropH = headHeightPx / targetHeadRatio;
  let cropW = cropH * preset.aspectRatio;

  // Ensure crop box doesn't exceed image dimensions
  if (cropH > imgH || cropW > imgW) {
    const scale = Math.min(imgH / cropH, imgW / cropW);
    cropH *= scale * 0.95;
    cropW *= scale * 0.95;
  }

  // Calculate face center X (midpoint between eyes)
  const eyeCenterXPx = ((face.eyeCenterLeft.x + face.eyeCenterRight.x) / 2) * imgW;

  // Calculate target eye line Y
  const eyeCenterYPx = ((face.eyeCenterLeft.y + face.eyeCenterRight.y) / 2) * imgH;
  const targetEyeLineRatioFromTop = 1 - (preset.eyeLineMinRatio + preset.eyeLineMaxRatio) / 2;

  // Compute crop box origin (x, y)
  let cropX = eyeCenterXPx - cropW / 2;
  let cropY = eyeCenterYPx - cropH * targetEyeLineRatioFromTop;

  // Clamp within image bounds while preserving aspect ratio
  if (cropX < 0) cropX = 0;
  if (cropY < 0) cropY = 0;
  if (cropX + cropW > imgW) cropX = imgW - cropW;
  if (cropY + cropH > imgH) cropY = imgH - cropH;

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropW),
    height: Math.round(cropH),
  };
}
