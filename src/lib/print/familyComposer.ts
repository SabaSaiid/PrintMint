import { PhotoPreset, PrintSheetPreset } from '../../types';

export interface FamilyMemberItem {
  id: string;
  name: string;
  canvas: HTMLCanvasElement;
  copies: number;
}

export function renderFamilyPrintSheetCanvas(
  members: FamilyMemberItem[],
  photoPreset: PhotoPreset,
  sheetPreset: PrintSheetPreset,
  dpi: number = 300
): HTMLCanvasElement {
  const inchesW = sheetPreset.sheetWidthInches || 4;
  const inchesH = sheetPreset.sheetHeightInches || 6;

  const sheetWidthPx = Math.round(inchesW * dpi);
  const sheetHeightPx = Math.round(inchesH * dpi);

  const canvas = document.createElement('canvas');
  canvas.width = sheetWidthPx;
  canvas.height = sheetHeightPx;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Fill pure white paper background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, sheetWidthPx, sheetHeightPx);

  const mmToPx = (mm: number) => Math.round((mm / 25.4) * dpi);
  const photoWidthPx = mmToPx(photoPreset.widthMm);
  const photoHeightPx = mmToPx(photoPreset.heightMm);

  const marginPx = mmToPx(sheetPreset.marginMm);
  const gapPx = mmToPx(sheetPreset.gapMm);

  const rows = sheetPreset.rows;
  const cols = sheetPreset.cols;

  // Flatten members list by copies count
  const printQueue: { name: string; canvas: HTMLCanvasElement }[] = [];
  members.forEach((m) => {
    for (let i = 0; i < m.copies; i++) {
      printQueue.push({ name: m.name, canvas: m.canvas });
    }
  });

  let queueIdx = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (queueIdx >= printQueue.length) break;

      const posX = marginPx + c * (photoWidthPx + gapPx);
      const posY = marginPx + r * (photoHeightPx + gapPx);

      if (posX + photoWidthPx > sheetWidthPx || posY + photoHeightPx > sheetHeightPx) continue;

      const item = printQueue[queueIdx];

      // Draw photo
      ctx.drawImage(item.canvas, posX, posY, photoWidthPx, photoHeightPx);

      // Light hairline border
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1;
      ctx.strokeRect(posX, posY, photoWidthPx, photoHeightPx);

      // Name Label tag at top corner of photo
      ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
      ctx.fillRect(posX + 4, posY + 4, Math.min(100, photoWidthPx - 8), 16);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText(item.name.substring(0, 14), posX + 8, posY + 15);

      // Corner crop markers
      const markerLen = Math.round(15 * (dpi / 300));
      ctx.strokeStyle = '#9CA3AF';
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(posX - 4, posY);
      ctx.lineTo(posX - 4 - markerLen, posY);
      ctx.moveTo(posX, posY - 4);
      ctx.lineTo(posX, posY - 4 - markerLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(posX + photoWidthPx + 4, posY + photoHeightPx);
      ctx.lineTo(posX + photoWidthPx + 4 + markerLen, posY + photoHeightPx);
      ctx.moveTo(posX + photoWidthPx, posY + photoHeightPx + 4);
      ctx.lineTo(posX + photoWidthPx, posY + photoHeightPx + 4 + markerLen);
      ctx.stroke();

      queueIdx++;
    }
  }

  return canvas;
}
