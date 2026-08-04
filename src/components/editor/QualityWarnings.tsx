import React, { useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Sparkles, Award } from 'lucide-react';
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

  const [checkFilter, setCheckFilter] = useState<'all' | 'issues'>('all');

  const totalChecks = complianceChecks.length;
  const passedChecks = complianceChecks.filter((c) => c.passed).length;
  const issueChecksCount = complianceChecks.filter((c) => !c.passed).length;
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

  const visibleChecks = checkFilter === 'issues'
    ? complianceChecks.filter((c) => !c.passed)
    : complianceChecks;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
      {/* Header & Score Progress */}
      <div className="pb-3 border-b border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Compliance Audit</h3>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold">
            <span className="text-slate-500 dark:text-slate-400">Score:</span>
            <span className={passPercentage >= 90 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}>
              {passPercentage}%
            </span>
          </div>
        </div>

        {/* Audit Readiness Banner */}
        {passPercentage === 100 ? (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Fully Compliant with {activePreset.name} Guidelines</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{issueChecksCount} item{issueChecksCount > 1 ? 's' : ''} require attention before submission</span>
          </div>
        )}

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

        {/* Filter Toggle */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setCheckFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              checkFilter === 'all'
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Checks ({totalChecks})
          </button>
          <button
            onClick={() => setCheckFilter('issues')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              checkFilter === 'issues'
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            Action Needed ({issueChecksCount})
          </button>
        </div>
      </div>

      {/* Compliance Rule Cards */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {visibleChecks.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-800">
            No issues found! Photo meets all parameters.
          </div>
        ) : (
          visibleChecks.map((check) => {
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
                      className="flex-shrink-0 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-xl flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" /> Auto-Fix
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
