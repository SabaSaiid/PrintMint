import React, { useState, useEffect, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { useEditorStore } from '../../store/useEditorStore';
import { RotateCw, ZoomIn, Target, RefreshCw, Compass, ShieldCheck, Eye, X, Maximize2 } from 'lucide-react';
import { calculateAutoCrop } from '../../lib/face/measureHead';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { whitenBackground } from '../../lib/background/whiten';

export const CropCanvas: React.FC = () => {
  const {
    imageUrl,
    imageDimensions,
    activePreset,
    faceResult,
    crop,
    zoom,
    rotation,
    croppedAreaPixels,
    adjustments,
    bgOption,
    bgHexOverride,
    setCrop,
    setZoom,
    setRotation,
    setCroppedAreaPixels,
  } = useEditorStore();

  const [showGuides, setShowGuides] = useState(true);
  const [showBeforeAfterModal, setShowBeforeAfterModal] = useState(false);
  const [processedCanvas, setProcessedCanvas] = useState<HTMLCanvasElement | null>(null);

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

      setProcessedCanvas(finalCropped);
    };
  }, [imageUrl, croppedAreaPixels, adjustments, bgOption, bgHexOverride]);

  if (!imageUrl) return null;

  const handleCropComplete = (_croppedArea: unknown, croppedAreaPixels: { x: number; y: number; width: number; height: number }) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleAutoCenterFace = () => {
    if (imageDimensions && faceResult) {
      const autoCropBox = calculateAutoCrop(
        imageDimensions.width,
        imageDimensions.height,
        faceResult,
        activePreset
      );
      setCroppedAreaPixels(autoCropBox);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    }
  };

  const handleLevelHorizon = () => {
    setRotation(0);
  };

  // Derive HUD metrics
  const headRatioPercent = faceResult?.hasFace
    ? Math.round(faceResult.headBounds.headHeight * 100)
    : null;
  const tiltAngle = faceResult?.hasFace ? faceResult.tiltAngleDeg.toFixed(1) : '0.0';

  return (
    <div className="relative rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
      {/* Top Canvas Controls Bar */}
      <div className="px-4 py-3 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Maximize2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Interactive Crop Box
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800">
            {activePreset.widthMm} × {activePreset.heightMm} mm
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBeforeAfterModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" /> Compare Before/After
          </button>

          <button
            onClick={() => setShowGuides(!showGuides)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              showGuides
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> {showGuides ? 'Guides On' : 'Guides Off'}
          </button>

          {faceResult?.hasFace && (
            <button
              onClick={handleAutoCenterFace}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Auto-Center
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Crop Area */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] bg-slate-950 flex items-center justify-center select-none overflow-hidden">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={activePreset.aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={handleCropComplete}
          showGrid={false}
          style={{
            containerStyle: { backgroundColor: '#020617' },
            cropAreaStyle: {
              border: '2px solid #10B981',
              boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.8)',
            },
          }}
        />

        {/* Real-time Canvas HUD Badges */}
        <div className="absolute top-3 left-3 pointer-events-none flex flex-col gap-1.5 z-10">
          {headRatioPercent !== null && (
            <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200 flex items-center gap-1.5 shadow-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Head: <strong className="text-emerald-400">{headRatioPercent}%</strong></span>
            </div>
          )}

          <div className="bg-slate-950/85 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-200 flex items-center gap-1.5 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Roll Tilt: <strong className="text-cyan-400">{tiltAngle}°</strong></span>
          </div>
        </div>

        {/* HUD Status Top-Right */}
        <div className="absolute top-3 right-3 pointer-events-none z-10">
          {headRatioPercent !== null && (
            <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-lg flex items-center gap-1.5 ${
              headRatioPercent >= activePreset.headHeightMinRatio * 100 && headRatioPercent <= activePreset.headHeightMaxRatio * 100
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                headRatioPercent >= activePreset.headHeightMinRatio * 100 && headRatioPercent <= activePreset.headHeightMaxRatio * 100
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-amber-400 animate-pulse'
              }`} />
              {headRatioPercent >= activePreset.headHeightMinRatio * 100 && headRatioPercent <= activePreset.headHeightMaxRatio * 100
                ? 'Height Compliant'
                : 'Adjust Framing'}
            </div>
          )}
        </div>

        {/* Passport Compliance Guidelines & Oval Target Overlay */}
        {showGuides && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0">
            <div
              className="relative border border-emerald-400/50"
              style={{
                aspectRatio: `${activePreset.aspectRatio}`,
                height: '75%',
                maxHeight: '380px',
              }}
            >
              {/* Vertical Center Hairline */}
              <div className="absolute left-1/2 top-0 bottom-0 border-l border-emerald-500/30 border-dashed" />

              {/* Target Head Zone Box */}
              <div
                className="absolute left-4 right-4 border-2 border-dashed border-emerald-400/80 bg-emerald-500/5 rounded-xl flex items-center justify-center"
                style={{
                  top: `${(1 - activePreset.headHeightMaxRatio) * 50}%`,
                  height: `${activePreset.headHeightMaxRatio * 100}%`,
                }}
              >
                {/* SVG Target Oval Guide Contour */}
                <svg className="w-full h-full opacity-40 text-emerald-400" viewBox="0 0 100 120" preserveAspectRatio="none">
                  <ellipse cx="50" cy="55" rx="35" ry="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3,3" />
                  <ellipse cx="50" cy="52" rx="12" ry="4" fill="none" stroke="currentColor" strokeWidth="1" />
                </svg>

                <span className="absolute text-[10px] uppercase font-extrabold tracking-wider text-emerald-400 bg-slate-950/90 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  Head Zone ({(activePreset.headHeightMinRatio * 100).toFixed(0)}-{(activePreset.headHeightMaxRatio * 100).toFixed(0)}%)
                </span>
              </div>

              {/* Target Eye-Line */}
              <div
                className="absolute left-0 right-0 border-b-2 border-cyan-400/90 shadow-[0_0_8px_rgba(34,211,238,0.5)]"
                style={{
                  top: `${((1 - activePreset.eyeLineMaxRatio) * 100).toFixed(0)}%`,
                }}
              >
                <span className="absolute right-2 -top-5 text-[9px] font-bold text-cyan-300 bg-slate-950/90 px-1.5 py-0.5 rounded border border-cyan-500/40">
                  Target Eye Level
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Sliders & Quick Buttons */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Zoom Control */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <ZoomIn className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Zoom & Framing</span>
              <span className="text-emerald-400 font-mono">{zoom.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={1}
              max={3}
              step={0.02}
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>

        {/* Rotation Control */}
        <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
          <RotateCw className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
              <span>Level Tilt Angle</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLevelHorizon}
                  className="text-[9px] uppercase font-bold text-slate-400 hover:text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded"
                >
                  0°
                </button>
                <span className="text-cyan-400 font-mono">{rotation.toFixed(1)}°</span>
              </div>
            </div>
            <input
              type="range"
              min={-20}
              max={20}
              step={0.5}
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Before / After Comparison Modal */}
      {showBeforeAfterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" /> Interactive Before / After Comparison
              </h3>
              <button
                onClick={() => setShowBeforeAfterModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <BeforeAfterSlider
              originalUrl={imageUrl}
              processedCanvas={processedCanvas}
              aspectRatio={activePreset.aspectRatio}
            />
          </div>
        </div>
      )}
    </div>
  );
};
