import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { ALL_PRESETS } from '../../lib/presets/presetUtils';
import { PhotoPreset } from '../../types';
import { Check, ShieldCheck, Info, ExternalLink, ArrowRight } from 'lucide-react';
import { calculateAutoCrop } from '../../lib/face/measureHead';

export const PresetSelector: React.FC = () => {
  const {
    activePreset,
    setActivePreset,
    setStep,
    imageDimensions,
    faceResult,
    setCroppedAreaPixels,
  } = useEditorStore();

  const handleSelectPreset = (preset: PhotoPreset) => {
    setActivePreset(preset);

    // Recalculate auto-crop box for new preset
    if (imageDimensions && faceResult) {
      const autoCrop = calculateAutoCrop(
        imageDimensions.width,
        imageDimensions.height,
        faceResult,
        preset
      );
      setCroppedAreaPixels(autoCrop);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" /> Country & Document Specification
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Select Passport / ID Standard</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Specifications vary by country AND document type. Pick the target authority requirement below.
          </p>
        </div>

        <button
          onClick={() => setStep('editor')}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
        >
          Continue to Editor <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Warning Callout regarding Official Verification */}
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-3">
        <Info className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">Important Compliance Reminder: </span>
          Passport specifications change over time (e.g. India updated passport photos from 51x51mm to 35x45mm in Sept 2025). Always verify dimensions against your official government issuing website before submitting physical applications.
        </div>
      </div>

      {/* Preset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ALL_PRESETS.map((preset) => {
          const isSelected = activePreset.id === preset.id;

          return (
            <div
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`relative cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xl shadow-emerald-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.country}
                    </span>
                    <h3 className="font-extrabold text-white text-base mt-2">{preset.name}</h3>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-emerald-400 text-slate-950' : 'border border-slate-700 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Dimension Badges */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Photo Size</span>
                    <span className="font-bold text-white">{preset.widthMm} x {preset.heightMm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Head Coverage</span>
                    <span className="font-bold text-emerald-400">
                      {(preset.headHeightMinRatio * 100).toFixed(0)} - {(preset.headHeightMaxRatio * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed mb-3">{preset.notes}</p>
              </div>

              {preset.officialSourceUrl && (
                <a
                  href={preset.officialSourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 mt-2 pt-2 border-t border-slate-800/80"
                >
                  <ExternalLink className="w-3 h-3" /> Official Government Guidelines
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
