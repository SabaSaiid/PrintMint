import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Sun, Sliders, Sparkles, RefreshCw, Palette, Layers, Info, Wand2, RotateCw, ZoomIn, CheckCircle } from 'lucide-react';
import { calculateAutoFix, calculateAutoLightingFix } from '../../lib/quality/autoFix';
import { removeBackgroundAI } from '../../lib/background/aiBackground';

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
    faceResult,
    qualityAnalysis,
    setRotation,
    setZoom,
    setCrop,
    imageFile,
    setImageFile,
    imageUrl,
    imageDimensions,
    isAIProcessingBg,
    setIsAIProcessingBg,
    aiBgProgress,
    setAiBgProgress,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'autofix' | 'background' | 'lighting'>('autofix');

  const bgSwatches = [
    { name: 'Pure White (US/India)', hex: '#FFFFFF' },
    { name: 'Off-White (OCI)', hex: '#F9F9FB' },
    { name: 'Light Grey (UK)', hex: '#ECEEF0' },
    { name: 'EU Light Grey', hex: '#EFF1F3' },
    { name: 'Soft Blue', hex: '#D0E3FF' },
  ];

  // 1-Click Auto-Fix Handlers
  const handleAutoLevelTilt = () => {
    const fix = calculateAutoFix(faceResult, activePreset, adjustments);
    setRotation(fix.rotation);
  };

  const handleAutoCenterScale = () => {
    const fix = calculateAutoFix(faceResult, activePreset, adjustments);
    setZoom(fix.zoom);
    setCrop(fix.crop);
  };

  const handleAutoLighting = () => {
    const newLighting = calculateAutoLightingFix(qualityAnalysis, adjustments);
    setAdjustments(() => newLighting);
  };

  const handleFullAutoFix = () => {
    handleAutoLevelTilt();
    handleAutoCenterScale();
    handleAutoLighting();
  };

  const handleTriggerAIRemoval = async () => {
    if (!imageFile && !imageUrl) return;
    setBgOption('remove');
    setIsAIProcessingBg(true);
    setAiBgProgress(0.1);

    try {
      const source = imageFile || imageUrl!;
      const processedDataUrl = await removeBackgroundAI(source, bgHexOverride, (info) => {
        setAiBgProgress(info.progress);
      });

      // Convert processed data url to File
      const res = await fetch(processedDataUrl);
      const blob = await res.blob();
      const newFile = new File([blob], `ai_bg_removed_${Date.now()}.png`, { type: 'image/png' });

      setImageFile(newFile, processedDataUrl, imageDimensions || undefined);
    } catch (e) {
      console.error('AI background error:', e);
    } finally {
      setIsAIProcessingBg(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-5 shadow-2xl">
      {/* Tab Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('autofix')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'autofix'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-950" /> 1-Click Auto
          </button>

          <button
            onClick={() => setActiveTab('background')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'background'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" /> Background
          </button>

          <button
            onClick={() => setActiveTab('lighting')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'lighting'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Lighting
          </button>
        </div>

        <button
          onClick={resetAdjustments}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Tab 1: 1-Click Auto Fix Suite */}
      {activeTab === 'autofix' && (
        <div className="space-y-3">
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Complete Smart Auto-Fix</span>
              <span className="text-[11px] text-slate-400">Levels eye tilt, centers head height, & balances lighting</span>
            </div>

            <button
              onClick={handleFullAutoFix}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 hover:brightness-110 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" /> Auto-Fix All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleAutoLevelTilt}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <RotateCw className="w-4 h-4 text-emerald-400 mb-1 group-hover:rotate-45 transition-transform" />
              <span className="text-xs font-bold text-white block">Level Tilt</span>
              <span className="text-[10px] text-slate-400 block">Align eyes horizontally</span>
            </button>

            <button
              onClick={handleAutoCenterScale}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <ZoomIn className="w-4 h-4 text-teal-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Center & Scale</span>
              <span className="text-[10px] text-slate-400 block">Snap to preset coverage</span>
            </button>

            <button
              onClick={handleAutoLighting}
              className="p-3 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left transition-all group"
            >
              <Sun className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-white block">Fix Lighting</span>
              <span className="text-[10px] text-slate-400 block">Balance exposure</span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Background Options */}
      {activeTab === 'background' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300">
                Background Processing ({activePreset.backgroundColor.toUpperCase()})
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
                onClick={handleTriggerAIRemoval}
                disabled={isAIProcessingBg}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                  bgOption === 'remove'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {isAIProcessingBg ? 'Processing...' : 'AI Remove'}
              </button>
            </div>
          </div>

          {/* AI Progress Bar */}
          {isAIProcessingBg && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-slate-300">
                <span>Removing Background via Client AI...</span>
                <span>{(aiBgProgress * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300"
                  style={{ width: `${Math.max(10, aiBgProgress * 100)}%` }}
                />
              </div>
            </div>
          )}

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
        </div>
      )}

      {/* Tab 3: Lighting & Color Sliders */}
      {activeTab === 'lighting' && (
        <div className="space-y-5">
          {/* Quick Studio Presets */}
          <div>
            <span className="text-xs font-bold text-slate-300 block mb-2">Quick Studio Presets</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, brightness: 105, contrast: 105, saturation: 100 }))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-slate-300 transition-all text-center"
              >
                Studio Balanced
              </button>

              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, brightness: 115, contrast: 100, saturation: 95 }))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-amber-300 transition-all text-center"
              >
                Lighten Shadows
              </button>

              <button
                onClick={() => setAdjustments((prev) => ({ ...prev, brightness: 100, contrast: 115, saturation: 105 }))}
                className="px-2.5 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] font-semibold text-emerald-300 transition-all text-center"
              >
                Crisp Contrast
              </button>
            </div>
          </div>

          {/* Brightness */}
          <div>
            <div className="flex justify-between text-xs font-bold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-400" /> Brightness
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdjustments((prev) => ({ ...prev, brightness: 100 }))}
                  className="text-[9px] uppercase font-bold text-slate-400 hover:text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                >
                  Reset
                </button>
                <span className="text-emerald-400 font-mono">{adjustments.brightness}%</span>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdjustments((prev) => ({ ...prev, contrast: 100 }))}
                  className="text-[9px] uppercase font-bold text-slate-400 hover:text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                >
                  Reset
                </button>
                <span className="text-emerald-400 font-mono">{adjustments.contrast}%</span>
              </div>
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdjustments((prev) => ({ ...prev, saturation: 100 }))}
                  className="text-[9px] uppercase font-bold text-slate-400 hover:text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800"
                >
                  Reset
                </button>
                <span className="text-emerald-400 font-mono">{adjustments.saturation}%</span>
              </div>
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
