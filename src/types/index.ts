export type CountryCode = 'US' | 'UK' | 'IN' | 'EU' | 'CA' | 'AU' | 'JP' | 'CN' | 'SG' | 'CUSTOM';

export type DocumentType = 'passport' | 'oci' | 'visa' | 'id_card' | 'custom';

export interface PhotoPreset {
  id: string;
  name: string;
  country: string;
  countryCode: CountryCode;
  docType: DocumentType;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  headHeightMinRatio: number; // e.g. 0.70 (70% of photo height)
  headHeightMaxRatio: number; // e.g. 0.80 (80% of photo height)
  eyeLineMinRatio: number; // eye position from bottom (0.50 - 0.70)
  eyeLineMaxRatio: number;
  backgroundColor: 'white' | 'off-white' | 'light-blue' | 'light-grey' | 'any';
  bgHex: string;
  notes: string;
  lastUpdated: string; // ISO date string e.g. '2025-09-01'
  officialSourceUrl?: string;
  isCustom?: boolean;
}

export interface LandmarkPoint {
  x: number; // normalized 0-1
  y: number; // normalized 0-1
  z?: number;
}

export interface FaceDetectionResult {
  hasFace: boolean;
  multipleFacesFound: boolean;
  landmarks: LandmarkPoint[];
  boundingBox: {
    xMin: number;
    yMin: number;
    width: number;
    height: number;
  };
  headBounds: {
    topY: number; // forehead/crown top estimated
    chinY: number; // chin bottom
    leftX: number;
    rightX: number;
    headHeight: number;
    headWidth: number;
  };
  eyeCenterLeft: LandmarkPoint;
  eyeCenterRight: LandmarkPoint;
  tiltAngleDeg: number; // rotation roll in degrees
  eyeBlinkScore: {
    leftEyeOpen: boolean;
    rightEyeOpen: boolean;
  };
}

export interface QualityAnalysis {
  blurScore: number; // Variance of Laplacian (higher is sharper, threshold e.g. < 100 is blurry)
  isBlurry: boolean;
  blurSeverity: 'good' | 'warning' | 'fail';
  
  tiltAngleDeg: number;
  isTilted: boolean;
  tiltSeverity: 'good' | 'warning' | 'fail';

  faceHeightRatio: number;
  isFaceSizeCompliant: boolean;
  faceSizeSeverity: 'good' | 'warning' | 'fail';

  lightingStatus: {
    meanBrightness: number;
    isUnderexposed: boolean;
    isOverexposed: boolean;
    hasDirectionalShadow: boolean;
    lightingSeverity: 'good' | 'warning' | 'fail';
  };

  eyeClosureStatus: {
    eyesClosed: boolean;
    severity: 'good' | 'warning' | 'fail';
  };

  clothingContrastStatus?: {
    hasLowContrast: boolean;
    contrastRatio: number;
    severity: 'good' | 'warning' | 'fail';
    recommendation: string;
  };
}

export interface ComplianceCheck {
  id: string;
  category: 'face' | 'background' | 'lighting' | 'geometry' | 'quality';
  title: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'pass';
  reason: string;
  recommendation: string;
}

export type PaperFormat = '4x6' | '5x7' | 'A4' | 'letter';

export interface PrintSheetPreset {
  id: string;
  name: string;
  paperFormat: PaperFormat;
  sheetWidthInches: number; // e.g. 4
  sheetHeightInches: number; // e.g. 6
  rows: number;
  cols: number;
  marginMm: number;
  gapMm: number;
  showCutMarks?: boolean;
  cutMarkColorHex?: string;
  showPhotoBorder?: boolean;
}

export interface ImageAdjustments {
  brightness: number; // 100 default
  contrast: number; // 100 default
  saturation: number; // 100 default
  rotation: number; // 0 deg
  zoom: number; // 1
  cropX: number; // normalized or px
  cropY: number;
}

export interface FamilyMemberRecord {
  id: string;
  name: string;
  dataUrl: string;
  copies: number;
}

export interface AppSettings {
  defaultPaperFormat: PaperFormat;
  autoCenterOnLoad: boolean;
  guideOpacity: number; // 0.1 to 1.0
  guideStyle: 'solid' | 'dashed' | 'neon';
  targetKBLimitDefault: number; // 240 | 300 | 500
  dpiQuality: 300 | 600;
  showCutMarksDefault: boolean;
  showPhotoBorderDefault: boolean;
}


