import React from 'react';
import { useEditorStore } from './store/useEditorStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SettingsModal } from './components/common/SettingsModal';
import { FileDropzone } from './components/upload/FileDropzone';
import { PresetSelector } from './components/presets/PresetSelector';
import { CropCanvas } from './components/editor/CropCanvas';
import { AdjustmentPanel } from './components/editor/AdjustmentPanel';
import { QualityWarnings } from './components/editor/QualityWarnings';
import { PrintSheetComposer } from './components/export/PrintSheetComposer';
import { ArrowRight, ShieldCheck, Download } from 'lucide-react';

export default function App() {
  const { currentStep, setStep, imageFile, isSidebarCollapsed } = useEditorStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header />
      <Sidebar />
      <SettingsModal />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <main className="flex-1 pb-16">
          {/* Step 1: Upload Dropzone */}
          {currentStep === 'upload' && <FileDropzone />}

          {/* Step 2: Preset Selection */}
          {currentStep === 'preset' && <PresetSelector />}

          {/* Step 3: Interactive Crop & Adjustment Editor */}
          {currentStep === 'editor' && imageFile && (
            <div className="w-full max-w-7xl mx-auto px-4 py-6">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Crop & Adjust Photo</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Position your face within the green target guidelines. Use zoom & level sliders to align eyes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStep('preset')}
                    className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer shadow-sm"
                  >
                    Change Preset
                  </button>

                  <button
                    onClick={() => setStep('compliance')}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 cursor-pointer"
                  >
                    Check Compliance <ShieldCheck className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Side: Crop Canvas Area */}
                <div className="lg:col-span-7">
                  <CropCanvas />
                </div>

                {/* Right Side: Lighting & Background Controls */}
                <div className="lg:col-span-5 space-y-6">
                  <AdjustmentPanel />
                  <QualityWarnings />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Compliance Assistant Detail View */}
          {currentStep === 'compliance' && imageFile && (
            <div className="w-full max-w-4xl mx-auto px-4 py-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Passport Compliance Audit</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Full rules breakdown against active official government guidelines.
                  </p>
                </div>

                <button
                  onClick={() => setStep('export')}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Proceed to Export <Download className="w-4 h-4" />
                </button>
              </div>

              <QualityWarnings />
            </div>
          )}

          {/* Step 5: Export & Print Sheet Composer */}
          {currentStep === 'export' && imageFile && <PrintSheetComposer />}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-900 bg-slate-100 dark:bg-slate-950 py-6 text-center text-xs text-slate-500">
          <p>PrintMint — Passport & ID Photo Compliance Assistant • 100% Client-Side Web Assembly</p>
        </footer>
      </div>
    </div>
  );
}

