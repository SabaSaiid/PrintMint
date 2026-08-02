import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Sun, Sliders, Sparkles, RefreshCw, Palette, Layers, Info } from 'lucide-react';

export const AdjustmentPanel: React.FC = () => {
  const {
    adjustments,
    setAdjustments,
    resetAdjustments,
    bgOption,
    setBgOption,
    bgHexOverride,
    setBgHexOverride,
    activePreset,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'background' | 'lighting'>('background');

  const bgSwatches = [
    { name: 'Pure White (US/India)', hex: '#FFFFFF' },
    { name: 'Off-White (OCI)', hex: '#F9F9FB' },
    { name: 'Light Grey (UK)', hex: '#ECEEF0' },
    { name: 'EU Light Grey', hex: '#EFF1F3' },
    { name: 'Soft Blue', hex: '#D0E3FF' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-2xl">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'background'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Background
          </button>

          <button
            onClick={() => setActiveTab('lighting')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lighting'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Lighting & Color
          </button>
        </div>

        <button
          onClick={resetAdjustments}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Tab 1: Background Handling */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">
                Background Mode ({activePreset.backgroundColor.toUpperCase()})
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setBgOption('original')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  bgOption === 'original'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Original
              </button>

              <button
                onClick={() => setBgOption('whiten')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  bgOption === 'whiten'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Whiten
              </button>

              <button
                onClick={() => setBgOption('remove')}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  bgOption === 'remove'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                Full AI Remove
              </button>
            </div>
          </div>

          {/* Preset Color Swatches */}
          {bgOption !== 'original' && (
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 block">Target Color Swatch</span>
              <div className="grid grid-cols-1 gap-2">
                {bgSwatches.map((swatch) => (
                  <button
                    key={swatch.hex}
                    onClick={() => setBgHexOverride(swatch.hex)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs border transition-all ${
                      bgHexOverride === swatch.hex
                        ? 'bg-slate-800 border-emerald-400 text-emerald-300 font-bold'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <span>{swatch.name}</span>
                    <span
                      className="w-5 h-5 rounded-full border border-slate-600 shadow-sm"
                      style={{ backgroundColor: swatch.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              Threshold whitening operates instantly on Canvas 2D without sending photos off your device.
            </span>
          </div>
        </div>
      )}

      {/* Tab 2: Lighting & Color Sliders */}
      {activeTab === 'lighting' && (
        <div className="space-y-5">
          {/* Brightness */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
              </span>
              <span className="text-emerald-400 font-mono">{adjustments.brightness}%</span>
            </div>
            <input
              type="range"
              min={70}
              max={140}
              value={adjustments.brightness}
              onChange={(e) =>
                setAdjustments((prev) => ({ ...prev, brightness: parseInt(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Contrast */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Contrast
              </span>
              <span className="text-emerald-400 font-mono">{adjustments.contrast}%</span>
            </div>
            <input
              type="range"
              min={70}
              max={140}
              value={adjustments.contrast}
              onChange={(e) =>
                setAdjustments((prev) => ({ ...prev, contrast: parseInt(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>

          {/* Saturation */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" /> Color Saturation
              </span>
              <span className="text-emerald-400 font-mono">{adjustments.saturation}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={150}
              value={adjustments.saturation}
              onChange={(e) =>
                setAdjustments((prev) => ({ ...prev, saturation: parseInt(e.target.value) }))
              }
              className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
          </div>
        </div>
      )}
    </div>
  );
};
