import { create } from 'zustand';
import {
  PhotoPreset,
  FaceDetectionResult,
  QualityAnalysis,
  ComplianceCheck,
  ImageAdjustments,
  PrintSheetPreset,
} from '../types';
import { ALL_PRESETS } from '../lib/presets/presetUtils';

export type AppStep = 'upload' | 'preset' | 'editor' | 'compliance' | 'export';

interface EditorState {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;

  // Webcam Modal
  isWebcamModalOpen: boolean;
  setWebcamModalOpen: (open: boolean) => void;

  // Custom Presets
  customPresets: PhotoPreset[];
  addCustomPreset: (preset: PhotoPreset) => void;

  // Image Source
  imageFile: File | null;
  imageUrl: string | null;
  imageDimensions: { width: number; height: number } | null;
  setImageFile: (file: File | null, url: string | null, dimensions?: { width: number; height: number }) => void;

  // Active Preset
  activePreset: PhotoPreset;
  setActivePreset: (preset: PhotoPreset) => void;

  // Detection & Auto-Crop
  isDetectingFace: boolean;
  faceResult: FaceDetectionResult | null;
  setFaceResult: (result: FaceDetectionResult | null) => void;
  setIsDetectingFace: (isDetecting: boolean) => void;

  // Crop & Adjustments
  crop: { x: number; y: number }; // react-easy-crop relative offset
  zoom: number;
  rotation: number;
  croppedAreaPixels: { x: number; y: number; width: number; height: number } | null;
  setCrop: (crop: { x: number; y: number }) => void;
  setZoom: (zoom: number) => void;
  setRotation: (rotation: number) => void;
  setCroppedAreaPixels: (area: { x: number; y: number; width: number; height: number }) => void;

  // Color & Image Adjustments
  adjustments: ImageAdjustments;
  setAdjustments: (fn: (prev: ImageAdjustments) => ImageAdjustments) => void;
  resetAdjustments: () => void;

  // Background Options
  bgOption: 'original' | 'whiten' | 'remove';
  bgHexOverride: string;
  isAIProcessingBg: boolean;
  aiBgProgress: number;
  setBgOption: (option: 'original' | 'whiten' | 'remove') => void;
  setBgHexOverride: (hex: string) => void;
  setIsAIProcessingBg: (processing: boolean) => void;
  setAiBgProgress: (progress: number) => void;

  // Quality & Compliance
  qualityAnalysis: QualityAnalysis | null;
  complianceChecks: ComplianceCheck[];
  setQualityAnalysis: (analysis: QualityAnalysis | null) => void;
  setComplianceChecks: (checks: ComplianceCheck[]) => void;

  // Print Layout
  printSheetPreset: PrintSheetPreset;
  setPrintSheetPreset: (preset: PrintSheetPreset) => void;

  // Reset tool
  resetAll: () => void;
}

const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
  zoom: 1,
  cropX: 0,
  cropY: 0,
};

const DEFAULT_PRINT_PRESET: PrintSheetPreset = {
  id: '4x6_grid',
  name: '4x6 Inch Print Sheet (6 photos)',
  paperFormat: '4x6',
  sheetWidthInches: 4,
  sheetHeightInches: 6,
  rows: 3,
  cols: 2,
  marginMm: 5,
  gapMm: 3,
  showCutMarks: true,
  showPhotoBorder: true,
  cutMarkColorHex: '#9CA3AF',
};

const SAVED_CUSTOM_PRESETS_KEY = 'printmint_custom_presets';

const loadSavedCustomPresets = (): PhotoPreset[] => {
  try {
    const raw = localStorage.getItem(SAVED_CUSTOM_PRESETS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const useEditorStore = create<EditorState>((set, get) => ({
  currentStep: 'upload',
  setStep: (step) => set({ currentStep: step }),

  isWebcamModalOpen: false,
  setWebcamModalOpen: (open) => set({ isWebcamModalOpen: open }),

  customPresets: loadSavedCustomPresets(),
  addCustomPreset: (preset) => {
    const updated = [...get().customPresets, preset];
    set({ customPresets: updated });
    try {
      localStorage.setItem(SAVED_CUSTOM_PRESETS_KEY, JSON.stringify(updated));
    } catch (e) {}
  },

  imageFile: null,
  imageUrl: null,
  imageDimensions: null,
  setImageFile: (file, url, dimensions) =>
    set({
      imageFile: file,
      imageUrl: url,
      imageDimensions: dimensions || null,
      faceResult: null,
      qualityAnalysis: null,
      complianceChecks: [],
    }),

  activePreset: ALL_PRESETS[0],
  setActivePreset: (preset) => set({ activePreset: preset }),

  isDetectingFace: false,
  faceResult: null,
  setFaceResult: (result) => set({ faceResult: result }),
  setIsDetectingFace: (isDetecting) => set({ isDetectingFace: isDetecting }),

  crop: { x: 0, y: 0 },
  zoom: 1,
  rotation: 0,
  croppedAreaPixels: null,
  setCrop: (crop) => set({ crop }),
  setZoom: (zoom) => set({ zoom }),
  setRotation: (rotation) => set({ rotation }),
  setCroppedAreaPixels: (area) => set({ croppedAreaPixels: area }),

  adjustments: DEFAULT_ADJUSTMENTS,
  setAdjustments: (fn) => set((state) => ({ adjustments: fn(state.adjustments) })),
  resetAdjustments: () => set({ adjustments: DEFAULT_ADJUSTMENTS }),

  bgOption: 'original',
  bgHexOverride: '#FFFFFF',
  isAIProcessingBg: false,
  aiBgProgress: 0,
  setBgOption: (option) => set({ bgOption: option }),
  setBgHexOverride: (hex) => set({ bgHexOverride: hex }),
  setIsAIProcessingBg: (processing) => set({ isAIProcessingBg: processing }),
  setAiBgProgress: (progress) => set({ aiBgProgress: progress }),

  qualityAnalysis: null,
  complianceChecks: [],
  setQualityAnalysis: (analysis) => set({ qualityAnalysis: analysis }),
  setComplianceChecks: (checks) => set({ complianceChecks: checks }),

  printSheetPreset: DEFAULT_PRINT_PRESET,
  setPrintSheetPreset: (preset) => set({ printSheetPreset: preset }),

  resetAll: () =>
    set({
      currentStep: 'upload',
      imageFile: null,
      imageUrl: null,
      imageDimensions: null,
      faceResult: null,
      qualityAnalysis: null,
      complianceChecks: [],
      crop: { x: 0, y: 0 },
      zoom: 1,
      rotation: 0,
      croppedAreaPixels: null,
      adjustments: DEFAULT_ADJUSTMENTS,
      bgOption: 'original',
      isAIProcessingBg: false,
      aiBgProgress: 0,
    }),
}));
