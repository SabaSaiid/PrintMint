import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Settings, X, Sliders, ShieldCheck, Database, RefreshCw, CheckCircle2, Cpu, HardDrive, Sparkles } from 'lucide-react';
import { PaperFormat } from '../../types';

export const SettingsModal: React.FC = () => {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    appSettings,
    updateAppSettings,
    resetAppSettings,
    customPresets,
  } = useEditorStore();

  const [activeTab, setActiveTab] = useState<'general' | 'canvas' | 'export' | 'privacy'>('general');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  if (!isSettingsModalOpen) return null;

  const notify = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleResetToDefaults = () => {
    resetAppSettings();
    notify('Settings reset to default!');
  };

  const handleClearLocalStorage = () => {
    try {
      localStorage.clear();
      resetAppSettings();
      notify('Local cache & custom presets cleared!');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">PrintMint Settings &amp; Preferences</h3>
              <p className="text-xs text-slate-400">Customize workflow defaults, overlay guidelines, and local storage</p>
            </div>
          </div>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Saved Feedback Toast */}
        {saveToast && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {saveToast}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            General Defaults
          </button>
          <button
            onClick={() => setActiveTab('canvas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'canvas'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Canvas Guides
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'export'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quality &amp; Export
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'privacy'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Privacy &amp; Data
          </button>
        </div>

        {/* Tab 1: General Defaults */}
        {activeTab === 'general' && (
          <div className="space-y-4 text-xs">
            {/* Color Theme Preference */}
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white block">Application Color Theme</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dark', 'light', 'system'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      updateAppSettings({ theme: t });
                      notify(`Theme set to ${t}`);
                    }}
                    className={`py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${
                      appSettings.theme === t
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {t === 'dark' ? '🌙 Dark' : t === 'light' ? '☀️ Light' : '💻 System'}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white block">Default Paper Format</label>
              <div className="grid grid-cols-4 gap-2">
                {(['4x6', '5x7', 'A4', 'letter'] as PaperFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => {
                      updateAppSettings({ defaultPaperFormat: format });
                      notify(`Default paper format set to ${format}`);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      appSettings.defaultPaperFormat === format
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Auto-Center Face on Photo Upload</span>
                <span className="text-[11px] text-slate-400">
                  Automatically aligns head height and eye level using MediaPipe 3D landmarks when loading a photo.
                </span>
              </div>
              <input
                type="checkbox"
                checked={appSettings.autoCenterOnLoad}
                onChange={(e) => {
                  updateAppSettings({ autoCenterOnLoad: e.target.checked });
                  notify(`Auto-centering ${e.target.checked ? 'enabled' : 'disabled'}`);
                }}
                className="w-5 h-5 rounded border-slate-700 text-emerald-500 focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Tab 2: Canvas Guides */}
        {activeTab === 'canvas' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between font-bold text-white">
                <span>Guideline Overlay Opacity</span>
                <span className="text-emerald-400 font-mono">
                  {Math.round(appSettings.guideOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={0.2}
                max={1.0}
                step={0.05}
                value={appSettings.guideOpacity}
                onChange={(e) =>
                  updateAppSettings({ guideOpacity: parseFloat(e.target.value) })
                }
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white block">Head Target Contour Line Style</label>
              <div className="grid grid-cols-3 gap-2">
                {(['dashed', 'solid', 'neon'] as const).map((style) => (
                  <button
                    key={style}
                    onClick={() => {
                      updateAppSettings({ guideStyle: style });
                      notify(`Guide style set to ${style}`);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold uppercase border transition-all ${
                      appSettings.guideStyle === style
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Quality & Export */}
        {activeTab === 'export' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white block">Default Portal File Size Compression Limit</label>
              <div className="grid grid-cols-3 gap-2">
                {([240, 300, 500] as const).map((kb) => (
                  <button
                    key={kb}
                    onClick={() => {
                      updateAppSettings({ targetKBLimitDefault: kb });
                      notify(`Default compression set to < ${kb} KB`);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      appSettings.targetKBLimitDefault === kb
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    &lt; {kb} KB
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <label className="font-bold text-white block">Print Resolution Quality</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    updateAppSettings({ dpiQuality: 300 });
                    notify('Export set to Standard 300 DPI');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    appSettings.dpiQuality === 300
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  300 DPI (Standard Physical Print)
                </button>
                <button
                  onClick={() => {
                    updateAppSettings({ dpiQuality: 600 });
                    notify('Export set to Ultra 600 DPI');
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    appSettings.dpiQuality === 600
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  600 DPI (Ultra Studio Print)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Privacy & Data */}
        {activeTab === 'privacy' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Cpu className="w-4 h-4" /> Hardware &amp; WebAssembly Execution Engine
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                PrintMint uses Google MediaPipe WASM and WebGL client-side processing. All facial detection, background whitening, quality scoring, and PDF sheet rendering occurs locally inside your web browser. No telemetry or images leave your device.
              </p>
            </div>

            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-white block">Saved Custom Presets</span>
                <span className="text-[11px] text-slate-400">
                  {customPresets.length} user-created preset specification(s) currently stored in localStorage.
                </span>
              </div>

              <button
                onClick={handleClearLocalStorage}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 transition-all"
              >
                Clear Local Storage
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleResetToDefaults}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-950 px-3 py-2 rounded-xl border border-slate-800 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset All Defaults
          </button>

          <button
            onClick={() => setSettingsModalOpen(false)}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/25 transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
