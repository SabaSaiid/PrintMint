import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Sun, Sliders, Sparkles, RefreshCw, Palette } from 'lucide-react';

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

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-6">
      {/* Panel Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Lighting & Background Adjustments</h3>
        </div>

        <button
          onClick={resetAdjustments}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Background Options */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-emerald-400" /> Background Handling ({activePreset.backgroundColor.toUpperCase()})
        </label>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setBgOption('original')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all ${
              bgOption === 'original'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            Original
          </button>

          <button
            onClick={() => setBgOption('whiten')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all flex items-center justify-center gap-1 ${
              bgOption === 'whiten'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3" /> Whiten
          </button>

          <button
            onClick={() => setBgOption('remove')}
            className={`px-3 py-2 rounded-xl text-xs font-bold border text-center transition-all ${
              bgOption === 'remove'
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
            }`}
          >
            Full AI Remove
          </button>
        </div>

        {bgOption !== 'original' && (
          <div className="flex items-center gap-3 pt-2">
            <span className="text-xs text-slate-400">Target Fill Color:</span>
            <div className="flex items-center gap-2">
              {['#FFFFFF', '#F9F9FB', '#ECEEF0', '#EFF1F3', '#D0E3FF'].map((hex) => (
                <button
                  key={hex}
                  onClick={() => setBgHexOverride(hex)}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${
                    bgHexOverride === hex ? 'border-emerald-400 scale-110' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Image Sliders */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        {/* Brightness */}
        <div>
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
            </span>
            <span className="text-emerald-400 font-bold">{adjustments.brightness}%</span>
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
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" /> Contrast
            </span>
            <span className="text-emerald-400 font-bold">{adjustments.contrast}%</span>
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
          <div className="flex justify-between text-xs font-semibold text-slate-400 mb-1.5">
            <span className="flex items-center gap-1 text-slate-300">
              <Palette className="w-3.5 h-3.5 text-indigo-400" /> Color Saturation
            </span>
            <span className="text-emerald-400 font-bold">{adjustments.saturation}%</span>
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
    </div>
  );
};
