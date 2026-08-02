import React, { useState, useRef, useCallback, useEffect } from 'react';
import { SlidersHorizontal, Eye } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalUrl: string;
  processedCanvas: HTMLCanvasElement | null;
  aspectRatio: number;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalUrl,
  processedCanvas,
  aspectRatio,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0-100
  const [isDragging, setIsDragging] = useState(false);
  const [processedDataUrl, setProcessedDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (processedCanvas) {
      setProcessedDataUrl(processedCanvas.toDataURL('image/png'));
    }
  }, [processedCanvas]);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      let percentage = (x / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;
      setSliderPosition(percentage);
    },
    []
  );

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) handleMove(e.clientX);
    };
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches[0]) handleMove(e.touches[0].clientX);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleGlobalTouchMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, handleMove]);

  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="flex items-center justify-between w-full mb-2 text-xs font-bold text-slate-400 px-1">
        <span className="flex items-center gap-1 text-slate-300">
          <Eye className="w-3.5 h-3.5 text-amber-400" /> BEFORE (RAW)
        </span>
        <span className="text-emerald-400">AFTER (PROCESSED)</span>
      </div>

      <div
        ref={containerRef}
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-emerald-500/40 bg-slate-950 shadow-2xl cursor-ew-resize"
        style={{ aspectRatio: `${aspectRatio}` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        {/* Processed (After) Image Layer - Full Background */}
        {processedDataUrl ? (
          <img
            src={processedDataUrl}
            alt="Processed Passport Output"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 text-xs text-slate-500">
            Rendering preview...
          </div>
        )}

        {/* Original (Before) Image Layer - Clipped via Slider */}
        <div
          className="absolute top-0 bottom-0 left-0 overflow-hidden border-r-2 border-emerald-400 shadow-2xl"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalUrl}
            alt="Original Upload"
            className="absolute top-0 left-0 max-w-none h-full object-cover"
            style={{ width: containerRef.current ? containerRef.current.clientWidth : '100%' }}
          />

          <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-400 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded border border-amber-500/30">
            Original Photo
          </span>
        </div>

        {/* Floating Processed Label */}
        <span className="absolute top-3 right-3 bg-slate-950/80 text-emerald-400 font-extrabold text-[10px] uppercase px-2 py-0.5 rounded border border-emerald-500/30">
          Processed Output
        </span>

        {/* Split Handle Divider Line & Grip */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center"
          style={{ left: `calc(${sliderPosition}% - 16px)` }}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shadow-xl border-2 border-white transform hover:scale-110 transition-transform">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-2">Drag slider left/right to compare before and after</p>
    </div>
  );
};
