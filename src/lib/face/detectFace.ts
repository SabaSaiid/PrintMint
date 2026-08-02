import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { FaceDetectionResult, LandmarkPoint } from '../../types';

let landmarkerInstance: FaceLandmarker | null = null;
let isInitializing = false;

async function getLandmarker(): Promise<FaceLandmarker | null> {
  if (landmarkerInstance) return landmarkerInstance;
  if (isInitializing) {
    // Wait briefly if already initializing
    let attempts = 0;
    while (isInitializing && attempts < 20) {
      await new Promise((r) => setTimeout(r, 200));
      attempts++;
      if (landmarkerInstance) return landmarkerInstance;
    }
  }

  try {
    isInitializing = true;
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
    );
    landmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      numFaces: 2,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
      outputFaceBlendshapes: true,
    });
    isInitializing = false;
    return landmarkerInstance;
  } catch (error) {
    console.warn('Failed to load FaceLandmarker with GPU delegate, attempting CPU fallback:', error);
    try {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm'
      );
      landmarkerInstance = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: 'CPU',
        },
        runningMode: 'IMAGE',
        numFaces: 2,
      });
      isInitializing = false;
      return landmarkerInstance;
    } catch (fallbackErr) {
      console.error('FaceLandmarker failed to load:', fallbackErr);
      isInitializing = false;
      return null;
    }
  }
}

export async function detectFaceInImage(
  imageSource: HTMLImageElement | HTMLCanvasElement
): Promise<FaceDetectionResult> {
  const landmarker = await getLandmarker();

  if (!landmarker) {
    // Return empty fallback if MediaPipe fails to load
    return createEmptyDetectionResult();
  }

  const results = landmarker.detect(imageSource);

  if (!results || !results.faceLandmarks || results.faceLandmarks.length === 0) {
    return createEmptyDetectionResult();
  }

  const faceCount = results.faceLandmarks.length;
  const landmarks = results.faceLandmarks[0].map((lm) => ({
    x: lm.x,
    y: lm.y,
    z: lm.z,
  }));

  // Key MediaPipe 478 Landmarks:
  // 10: Top of forehead center
  // 152: Bottom of chin center
  // 234: Left cheek / ear boundary
  // 454: Right cheek / ear boundary
  // 33: Outer corner left eye
  // 133: Inner corner left eye
  // 362: Inner corner right eye
  // 263: Outer corner right eye
  // 159 & 145: Top and bottom of left pupil / eyelid
  // 386 & 374: Top and bottom of right pupil / eyelid

  const topForehead = landmarks[10] || landmarks[0];
  const bottomChin = landmarks[152] || landmarks[landmarks.length - 1];
  const leftFaceEdge = landmarks[234] || landmarks[0];
  const rightFaceEdge = landmarks[454] || landmarks[landmarks.length - 1];

  // Calculate Eye Centers
  const leftEyeLeftCorner = landmarks[33];
  const leftEyeRightCorner = landmarks[133];
  const rightEyeLeftCorner = landmarks[362];
  const rightEyeRightCorner = landmarks[263];

  const eyeCenterLeft: LandmarkPoint = {
    x: (leftEyeLeftCorner.x + leftEyeRightCorner.x) / 2,
    y: (leftEyeLeftCorner.y + leftEyeRightCorner.y) / 2,
  };

  const eyeCenterRight: LandmarkPoint = {
    x: (rightEyeLeftCorner.x + rightEyeRightCorner.x) / 2,
    y: (rightEyeLeftCorner.y + rightEyeRightCorner.y) / 2,
  };

  // Estimate crown/hairline top (about 30-35% of chin-to-forehead distance above landmark 10)
  const chinToForeheadDist = Math.abs(bottomChin.y - topForehead.y);
  const estimatedCrownY = Math.max(0, topForehead.y - chinToForeheadDist * 0.35);

  const headHeight = Math.abs(bottomChin.y - estimatedCrownY);
  const headWidth = Math.abs(rightFaceEdge.x - leftFaceEdge.x);

  // Tilt Angle in degrees
  const deltaX = eyeCenterRight.x - eyeCenterLeft.x;
  const deltaY = eyeCenterRight.y - eyeCenterLeft.y;
  const tiltAngleDeg = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

  // Blink Check (Eye Aspect Ratio - EAR)
  const leftEyeHeight = Math.abs(landmarks[159].y - landmarks[145].y);
  const leftEyeWidth = Math.abs(landmarks[133].x - landmarks[33].x);
  const leftEarRatio = leftEyeWidth > 0 ? leftEyeHeight / leftEyeWidth : 0.3;

  const rightEyeHeight = Math.abs(landmarks[386].y - landmarks[374].y);
  const rightEyeWidth = Math.abs(landmarks[263].x - landmarks[362].x);
  const rightEarRatio = rightEyeWidth > 0 ? rightEyeHeight / rightEyeWidth : 0.3;

  // Threshold for eye open vs squinting/closed is typically EAR < 0.15
  const leftEyeOpen = leftEarRatio > 0.14;
  const rightEyeOpen = rightEarRatio > 0.14;

  // Calculate Bounding Box
  const xMin = Math.min(...landmarks.map((l) => l.x));
  const xMax = Math.max(...landmarks.map((l) => l.x));
  const yMin = Math.min(...landmarks.map((l) => l.y));
  const yMax = Math.max(...landmarks.map((l) => l.y));

  return {
    hasFace: true,
    multipleFacesFound: faceCount > 1,
    landmarks,
    boundingBox: {
      xMin,
      yMin,
      width: xMax - xMin,
      height: yMax - yMin,
    },
    headBounds: {
      topY: estimatedCrownY,
      chinY: bottomChin.y,
      leftX: leftFaceEdge.x,
      rightX: rightFaceEdge.x,
      headHeight,
      headWidth,
    },
    eyeCenterLeft,
    eyeCenterRight,
    tiltAngleDeg,
    eyeBlinkScore: {
      leftEyeOpen,
      rightEyeOpen,
    },
  };
}

function createEmptyDetectionResult(): FaceDetectionResult {
  return {
    hasFace: false,
    multipleFacesFound: false,
    landmarks: [],
    boundingBox: { xMin: 0, yMin: 0, width: 0, height: 0 },
    headBounds: { topY: 0, chinY: 0, leftX: 0, rightX: 0, headHeight: 0, headWidth: 0 },
    eyeCenterLeft: { x: 0.35, y: 0.4 },
    eyeCenterRight: { x: 0.65, y: 0.4 },
    tiltAngleDeg: 0,
    eyeBlinkScore: { leftEyeOpen: true, rightEyeOpen: true },
  };
}
