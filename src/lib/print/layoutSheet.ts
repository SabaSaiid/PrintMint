import { PhotoPreset, PrintSheetPreset } from '../../types';

export function renderPrintSheetCanvas(
  croppedCanvas: HTMLCanvasElement,
  photoPreset: PhotoPreset,
  sheetPreset: PrintSheetPreset,
  dpi: number = 300
): HTMLCanvasElement {
  // Convert inches to pixels (at target DPI)
  const sheetWidthPx = Math.round(sheetPreset.sheetWidthInches * dpi);
  const sheetHeightPx = Math.round(sheetPreset.sheetHeightInches * dpi);

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
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(posX, posY, photoWidthPx, photoHeightPx);

      // Corner crop markers
      const markerLen = Math.round(15 * (dpi / 300));
      ctx.strokeStyle = '#9CA3AF';
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

  return canvas;
}
