import React, { useState } from 'react';
import { useEditorStore, AppStep } from '../../store/useEditorStore';
import { ALL_PRESETS } from '../../lib/presets/presetUtils';
import {
  Upload,
  ShieldCheck,
  Crop,
  Download,
  Settings,
  Camera,
  Users,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Globe,
  Sparkles,
  Lock,
  CheckCircle2,
  X,
  BookOpen,
  Sun,
  Moon,
} from 'lucide-react';
import { FamilyBatchModal } from '../export/FamilyBatchModal';

export const Sidebar: React.FC = () => {
  const {
    currentStep,
    setStep,
    activePreset,
    imageFile,
    isSidebarCollapsed,
    toggleSidebar,
    setSettingsModalOpen,
    setWebcamModalOpen,
    appSettings,
    updateAppSettings,
  } = useEditorStore();


  const [isFamilyBatchOpen, setIsFamilyBatchOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

  const steps: Array<{ id: AppStep; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'upload', label: '1. Upload Photo', icon: Upload },
    { id: 'preset', label: '2. Select Preset', icon: ShieldCheck },
    { id: 'editor', label: '3. Crop & Adjust', icon: Crop },
    { id: 'compliance', label: '4. Compliance Audit', icon: ShieldCheck },
    { id: 'export', label: '5. Export Sheet', icon: Download },
  ];

  return (
    <>
      <aside
        className={`fixed left-0 top-16 bottom-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 flex flex-col justify-between select-none ${
          isSidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Top Collapse Toggle Header */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Workflow Navigation
            </span>
          )}
          <button
            onClick={toggleSidebar}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all mx-auto"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Workflow Steps Navigation */}
        <div className="p-2 space-y-1.5 flex-1 overflow-y-auto">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = imageFile && steps.findIndex((s) => s.id === currentStep) > idx;

            return (
              <button
                key={step.id}
                onClick={() => setStep(step.id)}
                title={step.label}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/25 scale-[1.01]'
                    : isCompleted
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent'
                }`}
              >
                <div className="flex-shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                {!isSidebarCollapsed && <span className="truncate">{step.label}</span>}
              </button>
            );
          })}

          {/* Quick Specification Indicator */}
          {!isSidebarCollapsed && (
            <div className="mt-4 p-3 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 text-xs">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Active Specification
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-600 dark:text-emerald-400 truncate flex items-center gap-1">
                  <Globe className="w-3 h-3 flex-shrink-0" /> {activePreset.name}
                </span>
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                  {activePreset.widthMm}x{activePreset.heightMm}
                </span>
              </div>
            </div>
          )}

          {/* Quick Tools & Utilities */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 space-y-1">
            {!isSidebarCollapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-3 block mb-1">
                Studio Tools
              </span>
            )}

            <button
              onClick={() => setWebcamModalOpen(true)}
              title="Live Webcam Studio"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all"
            >
              <Camera className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Live Webcam Studio</span>}
            </button>

            <button
              onClick={() => setIsFamilyBatchOpen(true)}
              title="Family Batch Print Sheet"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all"
            >
              <Users className="w-4 h-4 text-cyan-500 dark:text-cyan-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Family Batch Sheet</span>}
            </button>

            <button
              onClick={() => updateAppSettings({ theme: appSettings.theme === 'dark' ? 'light' : 'dark' })}
              title={`Switch to ${appSettings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all cursor-pointer"
            >
              {appSettings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 flex-shrink-0" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              )}
              {!isSidebarCollapsed && (
                <span>{appSettings.theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              )}
            </button>

            <button
              onClick={() => setIsHelpModalOpen(true)}
              title="Photo Guidelines & Rules"
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900 border border-transparent transition-all"
            >
              <BookOpen className="w-4 h-4 text-amber-500 dark:text-amber-400 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Official Photo Rules</span>}
            </button>
          </div>
        </div>

        {/* Sidebar Footer: Settings & WASM Guarantee */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
          <button
            onClick={() => setSettingsModalOpen(true)}
            title="Settings & Preferences"
            className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
            {!isSidebarCollapsed && <span>Settings & Preferences</span>}
          </button>

          {!isSidebarCollapsed && (
            <div className="px-2 py-1.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-[10px] text-emerald-400 flex items-center gap-1.5">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span>100% In-Browser WASM Privacy</span>
            </div>
          )}
        </div>
      </aside>

      <FamilyBatchModal isOpen={isFamilyBatchOpen} onClose={() => setIsFamilyBatchOpen(false)} />

      {/* Official Photo Rules Guide Modal */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-white text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" /> Official Passport Photo Guidelines
              </h3>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <h4 className="font-bold text-emerald-400">1. Facial Expression & Head Alignment</h4>
                <p className="text-slate-400 leading-relaxed">
                  Keep a neutral facial expression with both eyes open and mouth closed. Ensure the head is centered and squared directly facing the camera without tilting up, down, or sideways.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <h4 className="font-bold text-cyan-400">2. Eyeglasses & Accessories</h4>
                <p className="text-slate-400 leading-relaxed">
                  Most governments (including US and India) prohibit eyeglasses in passport photos unless medically required. No hats or head coverings except for religious purposes (full face must remain visible).
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <h4 className="font-bold text-amber-400">3. Background & Contrast</h4>
                <p className="text-slate-400 leading-relaxed">
                  Background must be plain white, off-white, or light grey depending on country. Dark or patterned clothing is recommended to ensure high contrast against the light background.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <h4 className="font-bold text-indigo-400">4. Print & File Resolution</h4>
                <p className="text-slate-400 leading-relaxed">
                  Photos must be crisp, uncompressed, and printed at 300 DPI on glossy or matte photo paper. Online government portals require strict file sizes (e.g. US online visa &lt; 240 KB, India Passport Seva &lt; 300 KB).
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
