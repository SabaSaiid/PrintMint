import { PhotoPreset, PrintSheetPreset, PaperFormat } from '../../types';

export const PAPER_FORMAT_SPECS: Record<PaperFormat, { widthInches: number; heightInches: number; name: string }> = {
  '4x6': { widthInches: 4, heightInches: 6, name: '4 x 6 Inches (10x15 cm)' },
  '5x7': { widthInches: 5, heightInches: 7, name: '5 x 7 Inches (13x18 cm)' },
  'A4': { widthInches: 8.27, heightInches: 11.69, name: 'A4 Standard (210x297 mm)' },
  'letter': { widthInches: 8.5, heightInches: 11, name: 'US Letter (8.5x11 Inches)' },
};

export function renderPrintSheetCanvas(
  croppedCanvas: HTMLCanvasElement,
  photoPreset: PhotoPreset,
  sheetPreset: PrintSheetPreset,
  dpi: number = 300
): HTMLCanvasElement {
  const paperSpec = PAPER_FORMAT_SPECS[sheetPreset.paperFormat || '4x6'] || {
    widthInches: sheetPreset.sheetWidthInches || 4,
    heightInches: sheetPreset.sheetHeightInches || 6,
  };

  // Convert inches to pixels (at target DPI)
  const sheetWidthPx = Math.round(paperSpec.widthInches * dpi);
  const sheetHeightPx = Math.round(paperSpec.heightInches * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = sheetWidthPx;
  canvas.height = sheetHeightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Fill pure white paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

  // Convert mm to pixels
  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);

  const photoWidthPx = mmToPx(photoPreset.widthMm);
  const photoHeightPx = mmToPx(photoPreset.heightMm);

  const marginPx = mmToPx(sheetPreset.marginMm);
  const gapPx = mmToPx(sheetPreset.gapMm);

  const rows = sheetPreset.rows;
  const cols = sheetPreset.cols;

  const showCutMarks = sheetPreset.showCutMarks !== false;
  const showPhotoBorder = sheetPreset.showPhotoBorder !== false;
  const cutMarkColor = sheetPreset.cutMarkColorHex || '#9CA3AF';

  // Draw photos grid
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const posX = marginPx + c * (photoWidthPx + gapPx);
      const posY = marginPx + r * (photoHeightPx + gapPx);

      // Skip if exceeds sheet bounds
      if (posX + photoWidthPx > sheetWidthPx || posY + photoHeightPx > sheetHeightPx) continue;

      // Draw photo
      ctx.drawImage(croppedCanvas, posX, posY, photoWidthPx, photoHeightPx);

      // Draw light 1px hairline border for cutting guide
      if (showPhotoBorder) {
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 1;
        ctx.strokeRect(posX, posY, photoWidthPx, photoHeightPx);
      }

      // Corner crop markers
      if (showCutMarks) {
        const markerLen = Math.round(15 * (dpi / 300));
        ctx.strokeStyle = cutMarkColor;
        ctx.lineWidth = 1.5;

        // Top-Left corner marker
        ctx.beginPath();
        ctx.moveTo(posX - 4, posY);
        ctx.lineTo(posX - 4 - markerLen, posY);
        ctx.moveTo(posX, posY - 4);
        ctx.lineTo(posX, posY - 4 - markerLen);
        ctx.stroke();

        // Bottom-Right corner marker
        ctx.beginPath();
        ctx.moveTo(posX + photoWidthPx + 4, posY + photoHeightPx);
        ctx.lineTo(posX + photoWidthPx + 4 + markerLen, posY + photoHeightPx);
        ctx.moveTo(posX + photoWidthPx, posY + photoHeightPx + 4);
        ctx.lineTo(posX + photoWidthPx, posY + photoHeightPx + 4 + markerLen);
        ctx.stroke();
      }
    }
  }

  return canvas;
}
