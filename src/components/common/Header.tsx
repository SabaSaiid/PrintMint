import React, { useState } from 'react';
import { useEditorStore, AppStep } from '../../store/useEditorStore';
import { ALL_PRESETS } from '../../lib/presets/presetUtils';
import { calculateAutoCrop } from '../../lib/face/measureHead';
import { Sparkles, RefreshCw, ShieldCheck, Download, Crop, Image as ImageIcon, ChevronDown, Check } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentStep,
    setStep,
    activePreset,
    setActivePreset,
    imageFile,
    imageDimensions,
    faceResult,
    setCroppedAreaPixels,
    resetAll,
  } = useEditorStore();

  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  const steps: Array<{ id: AppStep; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'upload', label: 'Upload', icon: ImageIcon },
    { id: 'preset', label: 'Preset', icon: ShieldCheck },
    { id: 'editor', label: 'Crop & Adjust', icon: Crop },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'export', label: 'Export', icon: Download },
  ];

  const handleQuickPresetChange = (presetId: string) => {
    const target = ALL_PRESETS.find((p) => p.id === presetId);
    if (target) {
      setActivePreset(target);
      if (imageDimensions && faceResult) {
        const autoBox = calculateAutoCrop(
          imageDimensions.width,
          imageDimensions.height,
          faceResult,
          target
        );
        setCroppedAreaPixels(autoBox);
      }
    }
    setIsPresetDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div onClick={resetAll} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Print<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Mint</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  WASM 100% Client-Side
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Passport Photo Compliance Assistant</p>
            </div>
          </div>

          {imageFile && (
            <button
              onClick={resetAll}
              className="md:hidden text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {imageFile && (
          <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner overflow-x-auto max-w-full">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = steps.findIndex((s) => s.id === currentStep) > idx;

              return (
                <button
                  key={step.id}
                  onClick={() => setStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.02]'
                      : isPast
                      ? 'text-emerald-400 hover:bg-slate-800/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{step.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Active Preset Quick Switcher */}
        {imageFile && (
          <div className="relative hidden lg:block">
            <button
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 px-3.5 py-1.5 rounded-xl text-left transition-all"
            >
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Target Spec</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  {activePreset.name} ({activePreset.widthMm}x{activePreset.heightMm}mm)
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isPresetDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-800/80">
                  Switch Passport Specification
                </div>
                <div className="space-y-1 mt-1">
                  {ALL_PRESETS.map((preset) => {
                    const isSelected = activePreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleQuickPresetChange(preset.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-[10px] text-slate-400">{preset.widthMm}x{preset.heightMm} mm</div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
