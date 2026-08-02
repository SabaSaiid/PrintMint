import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { renderPrintSheetCanvas } from '../../lib/print/layoutSheet';
import { generateSinglePhotoPdf, generatePrintSheetPdf, downloadBlob } from '../../lib/print/exportPdf';
import { whitenBackground } from '../../lib/background/whiten';
import { Download, Printer, FileText, CheckCircle2, RefreshCw, Grid, Layers } from 'lucide-react';
import { PrintSheetPreset } from '../../types';

export const PrintSheetComposer: React.FC = () => {
  const {
    imageUrl,
    croppedAreaPixels,
    activePreset,
    adjustments,
    bgOption,
    bgHexOverride,
    setStep,
  } = useEditorStore();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const croppedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activeSheetOption, setActiveSheetOption] = useState<'4x6' | '2x2' | 'a4'>('4x6');
  const [isExporting, setIsExporting] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Available Print Sheet Configurations
  const SHEET_PRESETS: Record<'4x6' | '2x2' | 'a4', PrintSheetPreset> = {
    '4x6': {
      id: '4x6_sheet',
      name: '4x6 Inch Photo Paper (6 Photos)',
      sheetWidthInches: 4,
      sheetHeightInches: 6,
      rows: 3,
      cols: 2,
      marginMm: 4,
      gapMm: 3,
    },
    '2x2': {
      id: '2x2_sheet',
      name: '4x6 Inch Grid (4 Photos)',
      sheetWidthInches: 4,
      sheetHeightInches: 6,
      rows: 2,
      cols: 2,
      marginMm: 8,
      gapMm: 4,
    },
    a4: {
      id: 'a4_sheet',
      name: 'A4 Sheet Tiled (12 Photos)',
      sheetWidthInches: 8.27,
      sheetHeightInches: 11.69,
      rows: 4,
      cols: 3,
      marginMm: 10,
      gapMm: 5,
    },
  };

  const currentSheetPreset = SHEET_PRESETS[activeSheetOption];

  // Render high-res cropped photo & composite sheet
  useEffect(() => {
    if (!imageUrl || !croppedAreaPixels) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = croppedAreaPixels.width;
      croppedCanvas.height = croppedAreaPixels.height;
      const ctx = croppedCanvas.getContext('2d');
      if (!ctx) return;

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

      let finalCropped = croppedCanvas;
      if (bgOption === 'whiten' || bgOption === 'remove') {
        finalCropped = whitenBackground(croppedCanvas, bgHexOverride);
      }

      croppedCanvasRef.current = finalCropped;

      if (previewCanvasRef.current) {
        const sheetCanvas = renderPrintSheetCanvas(finalCropped, activePreset, currentSheetPreset, 150);
        previewCanvasRef.current.width = sheetCanvas.width;
        previewCanvasRef.current.height = sheetCanvas.height;
        const sheetCtx = previewCanvasRef.current.getContext('2d');
        if (sheetCtx) {
          sheetCtx.drawImage(sheetCanvas, 0, 0);
        }
      }
    };
  }, [imageUrl, croppedAreaPixels, adjustments, bgOption, bgHexOverride, activePreset, currentSheetPreset]);

  // Download handlers
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
        currentSheetPreset
      );
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `printmint-${activePreset.id}-${currentSheetPreset.id}-sheet.pdf`);
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
            <Printer className="w-4 h-4" /> Print Sheet Composer
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Preview & Export Printable Layout</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate 300 DPI high-resolution JPGs or physical dimension PDF print sheets.
          </p>
        </div>

        <button
          onClick={() => setStep('editor')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-800 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Back to Crop Editor
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Sheet Preview */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center justify-between w-full mb-4">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Grid className="w-4 h-4 text-emerald-400" /> Print Preview ({currentSheetPreset.name})
            </span>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              {currentSheetPreset.rows * currentSheetPreset.cols} Photos / Sheet
            </span>
          </div>

          <div className="w-full max-w-md bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden">
            <canvas
              ref={previewCanvasRef}
              className="max-w-full max-h-[480px] rounded-lg shadow-xl border border-slate-700/50 object-contain"
            />
          </div>
        </div>

        {/* Right Column: Sheet Option Selectors & Downloads */}
        <div className="lg:col-span-5 space-y-6">
          {copiedNotification && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {copiedNotification}
            </div>
          )}

          {/* Layout Option Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <label className="text-xs font-bold text-slate-300 block">Select Print Sheet Size</label>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setActiveSheetOption('4x6')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activeSheetOption === '4x6'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>4x6" Sheet</div>
                <div className="text-[10px] opacity-80">6 Copies</div>
              </button>

              <button
                onClick={() => setActiveSheetOption('2x2')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activeSheetOption === '2x2'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>4x6" Grid</div>
                <div className="text-[10px] opacity-80">4 Copies</div>
              </button>

              <button
                onClick={() => setActiveSheetOption('a4')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activeSheetOption === 'a4'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>A4 Sheet</div>
                <div className="text-[10px] opacity-80">12 Copies</div>
              </button>
            </div>
          </div>

          {/* Export Printable PDF Sheet */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base">Printable Sheet (PDF)</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generates a 300 DPI physical PDF file with hairline cut guides for Walgreens, CVS, or home photo printer.
            </p>

            <button
              onClick={handleDownloadPrintSheetPdf}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" /> Download {currentSheetPreset.name}
            </button>
          </div>

          {/* Export Single Files */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-white text-base">Single Photo Files</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-resolution single file exports for online passport or visa application portals.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadSingleJpg}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Download JPG
              </button>

              <button
                onClick={handleDownloadSinglePdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs border border-slate-800 transition-all disabled:opacity-50"
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
