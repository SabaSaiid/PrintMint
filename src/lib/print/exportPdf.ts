import { PDFDocument } from 'pdf-lib';
import { PhotoPreset, PrintSheetPreset } from '../../types';
import { renderPrintSheetCanvas } from './layoutSheet';

export async function generateSinglePhotoPdf(
  croppedCanvas: HTMLCanvasElement,
  preset: PhotoPreset
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Convert mm to PDF points (1 inch = 72 points = 25.4 mm)
  const widthPoints = (preset.widthMm / 25.4) * 72;
  const heightPoints = (preset.heightMm / 25.4) * 72;

  const page = pdfDoc.addPage([widthPoints, heightPoints]);

  const jpegDataUrl = croppedCanvas.toDataURL('image/jpeg', 0.95);
  const imageBytes = await fetch(jpegDataUrl).then((res) => res.arrayBuffer());
  const embeddedImage = await pdfDoc.embedJpg(imageBytes);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: widthPoints,
    height: heightPoints,
  });

  return await pdfDoc.save();
}

export async function generatePrintSheetPdf(
  croppedCanvas: HTMLCanvasElement,
  photoPreset: PhotoPreset,
  sheetPreset: PrintSheetPreset
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  // Sheet dimensions in PDF points (1 inch = 72 pt)
  const sheetWidthPoints = sheetPreset.sheetWidthInches * 72;
  const sheetHeightPoints = sheetPreset.sheetHeightInches * 72;

  const page = pdfDoc.addPage([sheetWidthPoints, sheetHeightPoints]);

  // Render high-res 300 DPI canvas
  const compositeCanvas = renderPrintSheetCanvas(croppedCanvas, photoPreset, sheetPreset, 300);

  const jpegDataUrl = compositeCanvas.toDataURL('image/jpeg', 0.95);
  const imageBytes = await fetch(jpegDataUrl).then((res) => res.arrayBuffer());
  const embeddedImage = await pdfDoc.embedJpg(imageBytes);

  page.drawImage(embeddedImage, {
    x: 0,
    y: 0,
    width: sheetWidthPoints,
    height: sheetHeightPoints,
  });

  return await pdfDoc.save();
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
