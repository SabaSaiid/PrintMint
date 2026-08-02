import { ComplianceCheck, FaceDetectionResult, PhotoPreset, QualityAnalysis } from '../../types';

export function evaluateCompliance(
  preset: PhotoPreset,
  face: FaceDetectionResult | null,
  quality: QualityAnalysis | null
): ComplianceCheck[] {
  const checks: ComplianceCheck[] = [];

  // 1. Face Detection Check
  if (!face || !face.hasFace) {
    checks.push({
      id: 'face_detected',
      category: 'face',
      title: 'Face Detection',
      passed: false,
      severity: 'error',
      reason: 'No face detected in the photo.',
      recommendation: 'Upload a clear, front-facing portrait photo where your face is completely visible.',
    });
  } else if (face.multipleFacesFound) {
    checks.push({
      id: 'face_detected',
      category: 'face',
      title: 'Multiple Faces',
      passed: false,
      severity: 'error',
      reason: 'Multiple faces detected in the image.',
      recommendation: 'Passport authorities reject group photos. Crop or upload a solo photo of yourself.',
    });
  } else {
    checks.push({
      id: 'face_detected',
      category: 'face',
      title: 'Face Detection',
      passed: true,
      severity: 'pass',
      reason: 'Single front-facing face detected successfully.',
      recommendation: 'Face position is ready for compliance framing.',
    });
  }

  // 2. Head Size & Coverage Ratio Check
  if (face && face.hasFace) {
    const headRatio = face.headBounds.headHeight;
    const minRatio = preset.headHeightMinRatio;
    const maxRatio = preset.headHeightMaxRatio;

    if (headRatio >= minRatio && headRatio <= maxRatio) {
      checks.push({
        id: 'head_size',
        category: 'geometry',
        title: 'Head Proportion & Coverage',
        passed: true,
        severity: 'pass',
        reason: `Head size occupies ${(headRatio * 100).toFixed(0)}% of frame, within the allowed ${(minRatio * 100).toFixed(0)}-${(maxRatio * 100).toFixed(0)}% range for ${preset.name}.`,
        recommendation: 'Head sizing is compliant.',
      });
    } else if (headRatio < minRatio) {
      checks.push({
        id: 'head_size',
        category: 'geometry',
        title: 'Head Too Small',
        passed: false,
        severity: 'warning',
        reason: `Head occupies only ${(headRatio * 100).toFixed(0)}% of frame height (Minimum required is ${(minRatio * 100).toFixed(0)}%).`,
        recommendation: 'Use the zoom control to enlarge your face so it fills more of the frame.',
      });
    } else {
      checks.push({
        id: 'head_size',
        category: 'geometry',
        title: 'Head Too Large',
        passed: false,
        severity: 'warning',
        reason: `Head occupies ${(headRatio * 100).toFixed(0)}% of frame height (Maximum allowed is ${(maxRatio * 100).toFixed(0)}%).`,
        recommendation: 'Zoom out slightly so your hair and chin fit within the green guide lines.',
      });
    }
  }

  // 3. Head Tilt & Orientation Check
  if (face && face.hasFace) {
    const absTilt = Math.abs(face.tiltAngleDeg);
    if (absTilt <= 3) {
      checks.push({
        id: 'head_tilt',
        category: 'geometry',
        title: 'Head Alignment & Tilt',
        passed: true,
        severity: 'pass',
        reason: `Head is upright with an acceptable tilt angle of ${absTilt.toFixed(1)}°.`,
        recommendation: 'Head pose is straight.',
      });
    } else if (absTilt <= 7) {
      checks.push({
        id: 'head_tilt',
        category: 'geometry',
        title: 'Slight Head Tilt',
        passed: false,
        severity: 'warning',
        reason: `Head is tilted by ${absTilt.toFixed(1)}°. Passport standards require a straight, level head pose.`,
        recommendation: 'Use the rotation slider in the editor to level your eyes horizon.',
      });
    } else {
      checks.push({
        id: 'head_tilt',
        category: 'geometry',
        title: 'Severe Head Tilt',
        passed: false,
        severity: 'error',
        reason: `Head is severely tilted (${absTilt.toFixed(1)}°). Official guidelines strictly mandate straight-on pose.`,
        recommendation: 'Rotate the image straight or take a new photo with a level camera angle.',
      });
    }
  }

  // 4. Eyes Open & Visibility Check
  if (face && face.hasFace) {
    const { leftEyeOpen, rightEyeOpen } = face.eyeBlinkScore;
    if (leftEyeOpen && rightEyeOpen) {
      checks.push({
        id: 'eyes_open',
        category: 'face',
        title: 'Eyes Open & Visible',
        passed: true,
        severity: 'pass',
        reason: 'Both eyes are open and clearly detected.',
        recommendation: 'Eye visibility meets passport requirements.',
      });
    } else {
      checks.push({
        id: 'eyes_open',
        category: 'face',
        title: 'Eyes Squinting or Closed',
        passed: false,
        severity: 'error',
        reason: 'One or both eyes appear to be closed or obstructed.',
        recommendation: 'Upload a photo where your eyes are fully open, looking directly into the camera lens.',
      });
    }
  }

  // 5. Image Sharpness / Blur Check
  if (quality) {
    if (!quality.isBlurry) {
      checks.push({
        id: 'sharpness',
        category: 'quality',
        title: 'Image Sharpness',
        passed: true,
        severity: 'pass',
        reason: `High image clarity (Blur score: ${quality.blurScore}).`,
        recommendation: 'Photo is sharp and in focus.',
      });
    } else {
      checks.push({
        id: 'sharpness',
        category: 'quality',
        title: 'Blurry Photo Warning',
        passed: false,
        severity: 'warning',
        reason: `Low image sharpness detected (Blur score: ${quality.blurScore}). Out-of-focus prints will be rejected.`,
        recommendation: 'Upload a higher resolution, sharp photo taken under good lighting.',
      });
    }
  }

  // 6. Lighting & Exposure Check
  if (quality) {
    const { isUnderexposed, isOverexposed, hasDirectionalShadow, meanBrightness } = quality.lightingStatus;
    if (isUnderexposed) {
      checks.push({
        id: 'lighting',
        category: 'lighting',
        title: 'Photo Too Dark',
        passed: false,
        severity: 'warning',
        reason: `Image mean brightness is low (${meanBrightness}/255). Facial features must be clearly illuminated.`,
        recommendation: 'Increase brightness in the adjustment panel or upload a better-lit photo.',
      });
    } else if (isOverexposed) {
      checks.push({
        id: 'lighting',
        category: 'lighting',
        title: 'Photo Overexposed',
        passed: false,
        severity: 'warning',
        reason: `Image mean brightness is high (${meanBrightness}/255), causing washed-out facial details.`,
        recommendation: 'Reduce brightness or increase contrast in adjustments.',
      });
    } else if (hasDirectionalShadow) {
      checks.push({
        id: 'lighting',
        category: 'lighting',
        title: 'Uneven Face Lighting / Shadow',
        passed: false,
        severity: 'warning',
        reason: 'Harsh shadows detected across one side of the face.',
        recommendation: 'Passport photos require balanced frontal lighting without heavy side shadows.',
      });
    } else {
      checks.push({
        id: 'lighting',
        category: 'lighting',
        title: 'Lighting & Exposure',
        passed: true,
        severity: 'pass',
        reason: `Well-balanced lighting level (${meanBrightness}/255).`,
        recommendation: 'Illumination is clear and shadow-free.',
      });
    }
  }

  // 7. Background Specification Notice
  checks.push({
    id: 'bg_spec',
    category: 'background',
    title: `Background Rule: ${preset.backgroundColor.toUpperCase()}`,
    passed: true,
    severity: 'pass',
    reason: `Requirement for ${preset.name}: ${preset.notes}`,
    recommendation: 'Use the Background Whitening tool to ensure a clean, compliant backdrop.',
  });

  // 8. Clothing Contrast Check
  if (quality?.clothingContrastStatus) {
    if (quality.clothingContrastStatus.hasLowContrast) {
      checks.push({
        id: 'clothing_contrast',
        category: 'background',
        title: 'Clothing Contrast Warning',
        passed: false,
        severity: 'warning',
        reason: 'Low contrast between clothing and background (white/light shirt on light background).',
        recommendation: quality.clothingContrastStatus.recommendation,
      });
    } else {
      checks.push({
        id: 'clothing_contrast',
        category: 'background',
        title: 'Clothing Contrast',
        passed: true,
        severity: 'pass',
        reason: 'Good contrast between clothing shoulders and background.',
        recommendation: 'Shoulder contours are clearly defined.',
      });
    }
  }

  return checks;
}
