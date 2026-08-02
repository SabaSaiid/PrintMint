import React from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';
import { calculateAutoCrop } from '../../lib/face/measureHead';

export const QualityWarnings: React.FC = () => {
  const {
    complianceChecks,
    activePreset,
    imageDimensions,
    faceResult,
    setCroppedAreaPixels,
    setRotation,
    setBgOption,
  } = useEditorStore();

  const totalChecks = complianceChecks.length;
  const passedChecks = complianceChecks.filter((c) => c.passed).length;
  const passPercentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

  const handleFixCheck = (checkId: string) => {
    if (checkId === 'head_size' || checkId === 'face_detected') {
      if (imageDimensions && faceResult) {
        const autoBox = calculateAutoCrop(
          imageDimensions.width,
          imageDimensions.height,
          faceResult,
          activePreset
        );
        setCroppedAreaPixels(autoBox);
      }
    } else if (checkId === 'head_tilt') {
      setRotation(0);
    } else if (checkId === 'bg_spec') {
      setBgOption('whiten');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
      {/* Header & Confidence Score Progress Bar */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Compliance Audit Score
          </div>
          <span className="text-xl font-extrabold font-mono text-emerald-400">{passPercentage}%</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              passPercentage === 100
                ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                : passPercentage >= 70
                ? 'bg-amber-400'
                : 'bg-rose-500'
            }`}
            style={{ width: `${passPercentage}%` }}
          />
        </div>
      </div>

      {/* Compliance Rule Cards */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {complianceChecks.map((check) => {
          return (
            <div
              key={check.id}
              className={`p-3.5 rounded-2xl border text-xs transition-all ${
                check.severity === 'pass'
                  ? 'bg-slate-950/40 border-emerald-500/20 hover:border-emerald-500/40'
                  : check.severity === 'warning'
                  ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-rose-500/5 border-rose-500/30 hover:border-rose-500/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {check.severity === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : check.severity === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}

                  <div>
                    <h4 className="font-bold text-white text-xs">{check.title}</h4>

                    {/* WHY explanation */}
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      <span className="font-semibold text-slate-200">Why: </span>
                      {check.reason}
                    </p>

                    {/* WHAT TO FIX recommendation */}
                    {check.severity !== 'pass' && (
                      <p className="text-amber-300/90 text-xs mt-1.5 leading-relaxed bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                        <span className="font-bold text-amber-300">Fix Action: </span>
                        {check.recommendation}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Auto-Fix Button */}
                {check.severity !== 'pass' && (
                  <button
                    onClick={() => handleFixCheck(check.id)}
                    className="flex-shrink-0 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Fix
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
