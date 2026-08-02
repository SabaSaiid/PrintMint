import React from 'react';
import { useEditorStore, AppStep } from '../../store/useEditorStore';
import { Sparkles, RefreshCw, ShieldCheck, Download, Crop, Image as ImageIcon } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentStep, setStep, activePreset, imageFile, resetAll } = useEditorStore();

  const steps: { id: AppStep; label: string; icon: React.ComponentType<{ className?: string }> } = [
    { id: 'upload', label: 'Upload', icon: ImageIcon },
    { id: 'preset', label: 'Preset', icon: ShieldCheck },
    { id: 'editor', label: 'Crop & Adjust', icon: Crop },
    { id: 'compliance', label: 'Compliance', icon: ShieldCheck },
    { id: 'export', label: 'Export', icon: Download },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div
            onClick={resetAll}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">Print<span className="text-emerald-400">Mint</span></span>
                <span className="text-[10px] uppercase font-bold tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                  Client-Side
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Passport Photo Compliance Assistant</p>
            </div>
          </div>

          {imageFile && (
            <button
              onClick={resetAll}
              className="md:hidden text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          )}
        </div>

        {/* Step Indicator */}
        {imageFile && (
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = steps.findIndex((s) => s.id === currentStep) > idx;

              return (
                <button
                  key={step.id}
                  onClick={() => setStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : isPast
                      ? 'text-emerald-400 hover:bg-slate-800'
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

        {/* Active Preset Badge */}
        {imageFile && (
          <div className="hidden lg:flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">Active Spec</span>
              <span className="text-xs font-bold text-emerald-400">{activePreset.name} ({activePreset.widthMm}x{activePreset.heightMm}mm)</span>
            </div>
            <button
              onClick={resetAll}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800/80 hover:bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Start Over
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
