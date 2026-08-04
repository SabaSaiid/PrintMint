import React, { useEffect, useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { renderPrintSheetCanvas } from '../../lib/print/layoutSheet';
import { generateSinglePhotoPdf, generatePrintSheetPdf, downloadBlob } from '../../lib/print/exportPdf';
import { generateAuditCertificatePdf } from '../../lib/print/auditReportPdf';
import { compressImageToTargetKB } from '../../lib/export/compressor';
import { whitenBackground } from '../../lib/background/whiten';
import { FamilyBatchModal } from './FamilyBatchModal';
import { Download, Printer, FileText, CheckCircle2, RefreshCw, Grid, Scissors, Sparkles, Users, Award, ShieldCheck, Gauge } from 'lucide-react';
import { PrintSheetPreset, PaperFormat } from '../../types';

export const PrintSheetComposer: React.FC = () => {
  const {
    imageUrl,
    croppedAreaPixels,
    activePreset,
    adjustments,
    bgOption,
    bgHexOverride,
    setStep,
    qualityAnalysis,
    complianceChecks,
  } = useEditorStore();

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const croppedCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [activePaperFormat, setActivePaperFormat] = useState<PaperFormat>('4x6');
  const [showCutMarks, setShowCutMarks] = useState(true);
  const [showPhotoBorder, setShowPhotoBorder] = useState(true);
  const [targetKBLimit, setTargetKBLimit] = useState<number>(240);
  const [compressedKBResult, setCompressedKBResult] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [isFamilyModalOpen, setIsFamilyModalOpen] = useState(false);

  // Available Print Sheet Configurations by paper format
  const SHEET_PRESETS_MAP: Record<PaperFormat, PrintSheetPreset> = {
    '4x6': {
      id: '4x6_sheet',
      name: '4x6 Inch Photo Paper (6 Photos)',
      paperFormat: '4x6',
      sheetWidthInches: 4,
      sheetHeightInches: 6,
      rows: 3,
      cols: 2,
      marginMm: 4,
      gapMm: 3,
      showCutMarks,
      showPhotoBorder,
    },
    '5x7': {
      id: '5x7_sheet',
      name: '5x7 Inch Photo Paper (8 Photos)',
      paperFormat: '5x7',
      sheetWidthInches: 5,
      sheetHeightInches: 7,
      rows: 4,
      cols: 2,
      marginMm: 5,
      gapMm: 3,
      showCutMarks,
      showPhotoBorder,
    },
    A4: {
      id: 'a4_sheet',
      name: 'A4 Standard Sheet (16 Photos)',
      paperFormat: 'A4',
      sheetWidthInches: 8.27,
      sheetHeightInches: 11.69,
      rows: 4,
      cols: 4,
      marginMm: 8,
      gapMm: 4,
      showCutMarks,
      showPhotoBorder,
    },
    letter: {
      id: 'letter_sheet',
      name: 'US Letter Paper (16 Photos)',
      paperFormat: 'letter',
      sheetWidthInches: 8.5,
      sheetHeightInches: 11,
      rows: 4,
      cols: 4,
      marginMm: 8,
      gapMm: 4,
      showCutMarks,
      showPhotoBorder,
    },
  };

  const currentSheetPreset = {
    ...SHEET_PRESETS_MAP[activePaperFormat],
    showCutMarks,
    showPhotoBorder,
  };

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
  }, [
    imageUrl,
    croppedAreaPixels,
    adjustments,
    bgOption,
    bgHexOverride,
    activePreset,
    activePaperFormat,
    showCutMarks,
    showPhotoBorder,
  ]);

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

  const handleDownloadCompressedJpg = async () => {
    if (!croppedCanvasRef.current) return;
    setIsExporting(true);
    try {
      const result = await compressImageToTargetKB(croppedCanvasRef.current, targetKBLimit);
      setCompressedKBResult(result.actualKB);
      downloadBlob(result.blob, `printmint-${activePreset.id}-${result.actualKB}KB.jpg`);
      notify(`Compressed JPG (${result.actualKB} KB) downloaded!`);
    } catch (e) {
      console.error('Compression error:', e);
    }
    setIsExporting(false);
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
      downloadBlob(blob, `printmint-${activePreset.id}-${activePaperFormat}-sheet.pdf`);
      notify('Print Sheet PDF downloaded!');
    } catch (e) {
      console.error('PDF Sheet Export Error:', e);
    }
    setIsExporting(false);
  };

  const handleDownloadAuditReportPdf = async () => {
    if (!croppedCanvasRef.current) return;
    setIsExporting(true);
    try {
      const pdfBytes = await generateAuditCertificatePdf(
        croppedCanvasRef.current,
        activePreset,
        qualityAnalysis,
        complianceChecks
      );
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      downloadBlob(blob, `printmint-compliance-audit-certificate.pdf`);
      notify('Compliance Audit Certificate PDF downloaded!');
    } catch (e) {
      console.error('Audit PDF Export Error:', e);
    }
    setIsExporting(false);
  };

  const handleDownloadAllBundle = async () => {
    handleDownloadSingleJpg();
    await new Promise((r) => setTimeout(r, 400));
    await handleDownloadSinglePdf();
    await new Promise((r) => setTimeout(r, 400));
    await handleDownloadPrintSheetPdf();
    notify('All formats downloaded!');
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
            Generate 300 DPI high-resolution JPGs, portal-constrained files (&lt; 240 KB), &amp; PDF sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFamilyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all"
          >
            <Users className="w-4 h-4 text-emerald-400" /> Family Batch Print Sheet
          </button>

          <button
            onClick={handleDownloadAllBundle}
            disabled={isExporting}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-950" /> Download All Bundle
          </button>
        </div>
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

          {/* Cutting Guides Toggle Options */}
          <div className="mt-5 w-full flex items-center justify-between px-4 py-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
            <span className="font-bold flex items-center gap-1.5">
              <Scissors className="w-4 h-4 text-emerald-400" /> Cutting Options
            </span>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutMarks}
                  onChange={(e) => setShowCutMarks(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Corner Crop Marks</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhotoBorder}
                  onChange={(e) => setShowPhotoBorder(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                />
                <span>Photo Hairline Border</span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Sheet Option Selectors & Downloads */}
        <div className="lg:col-span-5 space-y-6">
          {copiedNotification && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {copiedNotification}
            </div>
          )}

          {/* Single High-Res Photo Exports */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-400" /> Single Photo High-Res Exports
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleDownloadSingleJpg}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" /> Single JPG (300 DPI)
              </button>
              <button
                onClick={handleDownloadSinglePdf}
                disabled={isExporting}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" /> Single PDF
              </button>
            </div>
          </div>

          {/* Online Application File Size Compressor (< 240KB / 300KB) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" /> Target Portal File Size Limit
              </span>
              {compressedKBResult && (
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  Size: {compressedKBResult} KB
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTargetKBLimit(240)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  targetKBLimit === 240
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                &lt; 240 KB (US)
              </button>
              <button
                onClick={() => setTargetKBLimit(300)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  targetKBLimit === 300
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                &lt; 300 KB (India)
              </button>
              <button
                onClick={() => setTargetKBLimit(500)}
                className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                  targetKBLimit === 500
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                &lt; 500 KB
              </button>
            </div>

            <button
              onClick={handleDownloadCompressedJpg}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 transition-all disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" /> Download Constrained JPG (&lt; {targetKBLimit} KB)
            </button>
          </div>

          {/* Official Audit Certificate PDF Download */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" /> Compliance Audit Certificate
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Official PDF verification report containing exact 300 DPI mm dimensions, face coverage %, eye alignment, & audit status.
            </p>

            <button
              onClick={handleDownloadAuditReportPdf}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-amber-400" /> Download Audit Certificate (PDF)
            </button>
          </div>

          {/* Layout Option Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-2xl">
            <label className="text-xs font-bold text-slate-300 block">Select Paper Format</label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setActivePaperFormat('4x6')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activePaperFormat === '4x6'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>4x6"</div>
                <div className="text-[10px] opacity-80">6 Photos</div>
              </button>

              <button
                onClick={() => setActivePaperFormat('5x7')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activePaperFormat === '5x7'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>5x7"</div>
                <div className="text-[10px] opacity-80">8 Photos</div>
              </button>

              <button
                onClick={() => setActivePaperFormat('A4')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activePaperFormat === 'A4'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>A4</div>
                <div className="text-[10px] opacity-80">16 Photos</div>
              </button>

              <button
                onClick={() => setActivePaperFormat('letter')}
                className={`p-3 rounded-2xl text-xs font-bold border transition-all text-center ${
                  activePaperFormat === 'letter'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>Letter</div>
                <div className="text-[10px] opacity-80">16 Photos</div>
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
        </div>
      </div>

      <FamilyBatchModal
        isOpen={isFamilyModalOpen}
        onClose={() => setIsFamilyModalOpen(false)}
      />
    </div>
  );
};
