import { PhotoPreset } from '../../types';
import presetsData from './presets.json';

export const ALL_PRESETS: PhotoPreset[] = presetsData as PhotoPreset[];

export function getPresetById(id: string): PhotoPreset {
  const found = ALL_PRESETS.find((p) => p.id === id);
  return found || ALL_PRESETS[0];
}

export function calculateMmToPixels(mm: number, dpi: number = 300): number {
  // 1 inch = 25.4 mm
  const inches = mm / 25.4;
  return Math.round(inches * dpi);
}
