import { FaceDetectionResult, QualityAnalysis, PhotoPreset, ImageAdjustments } from '../../types';

export interface AutoFixRecommendation {
  rotation: number;
  zoom: number;
  crop: { x: number; y: number };
  adjustments: Partial<ImageAdjustments>;
}

/**
 * Calculates optimal head leveling rotation, target zoom, and centered crop offsets
 * based on MediaPipe face landmarks and active document spec bounds.
 */
export function calculateAutoFix(
  faceResult: FaceDetectionResult | null,
  preset: PhotoPreset,
  currentAdjustments: ImageAdjustments
): AutoFixRecommendation {
  const result: AutoFixRecommendation = {
    rotation: currentAdjustments.rotation,
    zoom: currentAdjustments.zoom,
    crop: { x: currentAdjustments.cropX, y: currentAdjustments.cropY },
    adjustments: {},
  };

  if (!faceResult || !faceResult.hasFace) {
    return result;
  }

  // 1. Auto-Tilt Leveling: align eyes horizontally
  // tiltAngleDeg is clockwise tilt, so counter-rotate by -tiltAngleDeg
  const calculatedTilt = -faceResult.tiltAngleDeg;
  // Round to nearest 0.5 degrees for stability
  result.rotation = Math.round(calculatedTilt * 2) / 2;

  // 2. Auto-Scale & Auto-Center Calculation
  // Calculate target head height ratio (midpoint of min and max allowed ratio)
  const targetHeadRatio = (preset.headHeightMinRatio + preset.headHeightMaxRatio) / 2;
  const currentHeadRatio = faceResult.headBounds.headHeight; // ratio relative to full image height

  if (currentHeadRatio > 0) {
    // Required zoom multiplier so face occupies targetHeadRatio of frame
    // In react-easy-crop, zoom = 1 represents full fit, larger zoom zooms in.
    const idealZoom = targetHeadRatio / currentHeadRatio;
    result.zoom = Math.max(1, Math.min(4, Math.round(idealZoom * 100) / 100));
  }

  // 3. Center Crop Offsets
  // Head center in normalized 0-1 coordinates
  const headCenterX = (faceResult.headBounds.leftX + faceResult.headBounds.rightX) / 2;
  const headCenterY = (faceResult.headBounds.topY + faceResult.headBounds.chinY) / 2;

  // Eye line position target (0.50 - 0.70 from bottom -> means 0.30 - 0.50 from top)
  const targetEyeYFromTop = 1.0 - (preset.eyeLineMinRatio + preset.eyeLineMaxRatio) / 2;
  const currentEyeYFromTop = (faceResult.eyeCenterLeft.y + faceResult.eyeCenterRight.y) / 2;

  // Translate relative to center (0,0) in react-easy-crop percentage coordinates
  const offsetXPercent = (0.5 - headCenterX) * 100;
  const offsetYPercent = (targetEyeYFromTop - currentEyeYFromTop) * 100;

  result.crop = {
    x: Math.round(offsetXPercent * 10) / 10,
    y: Math.round(offsetYPercent * 10) / 10,
  };

  return result;
}

/**
 * Calculates optimal lighting/exposure auto-adjustments.
 */
export function calculateAutoLightingFix(
  qualityAnalysis: QualityAnalysis | null,
  current: ImageAdjustments
): ImageAdjustments {
  let brightness = current.brightness;
  let contrast = current.contrast;
  let saturation = current.saturation;

  if (qualityAnalysis?.lightingStatus) {
    const { meanBrightness, isUnderexposed, isOverexposed, hasDirectionalShadow } = qualityAnalysis.lightingStatus;

    if (isUnderexposed || meanBrightness < 100) {
      // Increase brightness
      brightness = Math.min(140, Math.round(100 + (125 - meanBrightness) * 0.5));
      contrast = Math.min(130, contrast + 5);
    } else if (isOverexposed || meanBrightness > 200) {
      // Reduce brightness
      brightness = Math.max(75, Math.round(100 - (meanBrightness - 180) * 0.4));
      contrast = Math.max(85, contrast - 5);
    } else {
      brightness = 100;
    }

    if (hasDirectionalShadow) {
      contrast = Math.min(125, contrast + 10);
    }
  }

  return {
    ...current,
    brightness,
    contrast,
    saturation,
  };
}
