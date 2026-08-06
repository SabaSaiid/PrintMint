import React, { useState } from 'react';
import { useEditorStore, AppStep } from '../../store/useEditorStore';
import { ALL_PRESETS } from '../../lib/presets/presetUtils';
import { calculateAutoCrop } from '../../lib/face/measureHead';
import { Sparkles, RefreshCw, ShieldCheck, Download, Crop, Image as ImageIcon, ChevronDown, Check, CheckCircle2, AlertTriangle, X, Settings, Menu, Sun, Moon } from 'lucide-react';

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
    setSettingsModalOpen,
    toggleSidebar,
    isSidebarCollapsed,
    appSettings,
    updateAppSettings,
  } = useEditorStore();

  const [isPresetDropdownOpen, setIsPresetDropdownOpen] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const toggleTheme = () => {
    const nextTheme = appSettings.theme === 'dark' ? 'light' : 'dark';
    updateAppSettings({ theme: nextTheme });
  };

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

  const handleConfirmReset = () => {
    resetAll();
    setShowResetConfirm(false);
  };

  const currentStepIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-white/85 dark:bg-slate-950/85 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 flex items-center justify-between transition-all select-none">
      {/* Left Area: Sidebar Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
        >
          <Menu className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
        </button>

        <div
          onClick={() => (imageFile ? setShowResetConfirm(true) : resetAll())}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-all">
            <Sparkles className="w-5 h-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                Print<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-300">Mint</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full shadow-sm hidden sm:inline-block">
                WASM 100% Client-Side
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden lg:block -mt-0.5">
              Passport Photo Compliance Assistant
            </p>
          </div>
        </div>
      </div>

      {/* Center Area: Workflow Progress Wizard */}
      {imageFile && (
        <nav className="hidden md:flex items-center bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/90 shadow-inner max-w-full">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isPast = currentStepIdx > idx;

            return (
              <React.Fragment key={step.id}>
                {idx > 0 && (
                  <div
                    className={`h-0.5 w-3 lg:w-5 transition-colors mx-0.5 ${
                      isPast ? 'bg-emerald-500/60' : 'bg-slate-300 dark:bg-slate-800'
                    }`}
                  />
                )}
                <button
                  onClick={() => setStep(step.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.02]'
                      : isPast
                      ? 'text-emerald-600 dark:text-emerald-400 hover:bg-slate-200 dark:hover:bg-slate-800/80'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                  <span>{step.label}</span>
                </button>
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Right Area: Spec Quick Switch, Theme Toggle & Start Over */}
      <div className="flex items-center gap-2">
        {imageFile && (
          <div className="relative hidden xl:block">
            <button
              onClick={() => setIsPresetDropdownOpen(!isPresetDropdownOpen)}
              className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-left transition-all shadow-sm cursor-pointer"
            >
              <div>
                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider block">Target Spec</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  {activePreset.name} ({activePreset.widthMm}x{activePreset.heightMm}mm)
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isPresetDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1.5 border-b border-slate-800/80 flex justify-between items-center">
                  <span>Switch Specification</span>
                  <span className="text-emerald-400 font-mono">{ALL_PRESETS.length} Specs</span>
                </div>
                <div className="space-y-1 mt-1 max-h-64 overflow-y-auto pr-1">
                  {ALL_PRESETS.map((preset) => {
                    const isSelected = activePreset.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleQuickPresetChange(preset.id)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{preset.name}</div>
                          <div className="text-[10px] text-slate-400">
                            {preset.widthMm}x{preset.heightMm} mm • {preset.country}
                          </div>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          title={`Switch to ${appSettings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
        >
          {appSettings.theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500" />
          )}
        </button>

        {imageFile && (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Start Over
          </button>
        )}
      </div>

      {/* Start Over Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Confirm Reset
              </h3>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to start over? This will clear your current photo, adjustments, and compliance analysis.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold shadow-lg shadow-rose-500/20"
              >
                Yes, Start Over
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

