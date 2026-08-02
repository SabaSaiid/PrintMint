import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { renderPrintSheetCanvas } from '../../lib/print/layoutSheet';
import { generateSinglePhotoPdf, generatePrintSheetPdf, downloadBlob } from '../../lib/print/exportPdf';
import { whitenBackground } from '../../lib/background/whiten';
import { Download, Printer, FileText, CheckCircle2, RefreshCw } from 'lucide-react';

export const PrintSheetComposer: React.FC = () => {
  const {
    imageUrl,
    croppedAreaPixels,
    activePreset,
    adjustments,
    bgOption,
    bgHexOverride,
    printSheetPreset,
    setStep,
  } = useEditorStore();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const croppedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [isExporting, setIsExporting] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Render high-res cropped photo canvas whenever parameters change
  useEffect(() => {
    if (!imageUrl || !croppedAreaPixels) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      // 1. Create base cropped canvas
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = croppedAreaPixels.width;
      croppedCanvas.height = croppedAreaPixels.height;
      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) return;

      // Apply CSS Filters (Brightness, Contrast, Saturation)
      ctx.filter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;
      ctx.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );
      ctx.filter = 'none';

      // 2. Apply Background Whitening if selected
      let finalCropped = croppedCanvas;
      if (bgOption === 'whiten' || bgOption === 'remove') {
        finalCropped = whitenBackground(croppedCanvas, bgHexOverride);
      }

      croppedCanvasRef.current = finalCropped;

      // 3. Render 300 DPI composite print sheet onto preview canvas
      if (previewCanvasRef.current) {
        const sheetCanvas = renderPrintSheetCanvas(finalCropped, activePreset, printSheetPreset, 150); // 150 DPI for UI preview
        previewCanvasRef.current.width = sheetCanvas.width;
        previewCanvasRef.current.height = sheetCanvas.height;
        const sheetCtx = previewCanvasRef.current.getContext('2d');
        if (sheetCtx) {
          sheetCtx.drawImage(sheetCanvas, 0, 0);
        }
      }
    };
  }, [imageUrl, croppedAreaPixels, adjustments, bgOption, bgHexOverride, activePreset, printSheetPreset]);

  // Export handlers
  const handleDownloadSingleJpg = () => {
    if (!croppedCanvasRef.current) return;
    croppedCanvasRef.current.toBlob((blob) => {
      if (blob) {
        downloadBlob(blob, `printmint-${activePreset.id}-single.jpg`);
        notify('Single JPG downloaded!');
      }
    }, 'image/jpeg', 0.95);
  };

  const handleDownloadSinglePdf = async () => {
    if (!croppedCanvasRef.current) return;
    setIsExporting(true);
    try {
      const pdfBytes = await generateSinglePhotoPdf(croppedCanvasRef.current, activePreset);
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `printmint-${activePreset.id}-single.pdf`);
      notify('Single PDF downloaded!');
    } catch (e) {
      console.error('PDF Export Error:', e);
    }
    setIsExporting(false);
  };

  const handleDownloadPrintSheetPdf = async () => {
    if (!croppedCanvasRef.current) return;
    setIsExporting(true);
    try {
      const pdfBytes = await generatePrintSheetPdf(
        croppedCanvasRef.current,
        activePreset,
        printSheetPreset
      );
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `printmint-${activePreset.id}-${printSheetPreset.id}-sheet.pdf`);
      notify('Print Sheet PDF downloaded!');
    } catch (e) {
      console.error('PDF Sheet Export Error:', e);
    }
    setIsExporting(false);
  };

  const notify = (msg: string) => {
    setCopiedNotification(msg);
    setTimeout(() => setCopiedNotification(null), 3000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Printer className="w-4 h-4" /> Print Sheet Generator & Exporter
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Preview & Download Print Layout</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Export exact 300 DPI high-resolution JPGs or physical dimension PDF print sheets.
          </p>
        </div>

        <button
          onClick={() => setStep('editor')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Back to Crop Editor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Canvas Sheet Preview */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-bold text-slate-300">
              Print Sheet Layout ({printSheetPreset.sheetWidthInches}x{printSheetPreset.sheetHeightInches} inches)
            </span>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {printSheetPreset.rows * printSheetPreset.cols} Photos per sheet
            </span>
          </div>

          <div className="w-full max-w-md bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
            <canvas
              ref={previewCanvasRef}
              className="max-w-full max-h-[480px] rounded-lg shadow-lg border border-slate-700/50 object-contain"
            />
          </div>
        </div>

        {/* Right Column: Download & Preset Options */}
        <div className="lg:col-span-5 space-y-6">
          {/* Notification toast */}
          {copiedNotification && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {copiedNotification}
            </div>
          )}

          {/* Export Print Sheet Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-white text-base">Printable Sheet (PDF)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a 4x6" photo paper document with cut markers, suitable for local printing or printing at Walgreens, CVS, or home.
            </p>

            <button
              onClick={handleDownloadPrintSheetPdf}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" /> Download 4x6" Print Sheet (PDF)
            </button>
          </div>

          {/* Export Single Photo Files Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-extrabold text-white text-base">Single Photo Export</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export high-resolution single photo files for online passport/visa application uploads.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadSingleJpg}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Download JPG
              </button>

              <button
                onClick={handleDownloadSinglePdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" /> Single PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
