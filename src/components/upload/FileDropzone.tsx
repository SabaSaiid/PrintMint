import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Upload, Camera, Sparkles, ShieldCheck, AlertCircle, FileImage, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { detectFaceInImage } from '../../lib/face/detectFace';
import { calculateAutoCrop } from '../../lib/face/measureHead';
import { computeBlurScore } from '../../lib/quality/blurScore';
import { analyzeLighting } from '../../lib/quality/lighting';
import { checkTilt } from '../../lib/quality/tilt';
import { evaluateCompliance } from '../../lib/compliance/checkCompliance';

export const FileDropzone: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    setImageFile,
    setFaceResult,
    setIsDetectingFace,
    setStep,
    activePreset,
    setCrop,
    setZoom,
    setCroppedAreaPixels,
    setQualityAnalysis,
    setComplianceChecks,
  } = useEditorStore();

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsLoading(true);

    try {
      let targetFile = file;

      if (
        file.name.toLowerCase().endsWith('.heic') ||
        file.name.toLowerCase().endsWith('.heif') ||
        file.type === 'image/heic'
      ) {
        try {
          const heic2anyModule = await import('heic2any');
          const convertedBlob = await heic2anyModule.default({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.92,
          });
          const blobResult = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
          targetFile = new File([blobResult], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
            type: 'image/jpeg',
          });
        } catch (heicErr) {
          console.warn('HEIC conversion fallback:', heicErr);
        }
      }

      const imageUrl = URL.createObjectURL(targetFile);
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error('Failed to load image file.'));
      });

      setImageFile(targetFile, imageUrl, { width: img.naturalWidth, height: img.naturalHeight });

      setIsDetectingFace(true);
      const faceRes = await detectFaceInImage(img);
      setFaceResult(faceRes);
      setIsDetectingFace(false);

      const autoCropBox = calculateAutoCrop(img.naturalWidth, img.naturalHeight, faceRes, activePreset);
      setCroppedAreaPixels(autoCropBox);

      const offscreen = document.createElement('canvas');
      offscreen.width = img.naturalWidth;
      offscreen.height = img.naturalHeight;
      const ctx = offscreen.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
        const blurRes = computeBlurScore(imageData);
        const lightingRes = analyzeLighting(imageData);
        const tiltRes = checkTilt(faceRes.tiltAngleDeg);

        const qualityData = {
          blurScore: blurRes.score,
          isBlurry: blurRes.isBlurry,
          blurSeverity: blurRes.isBlurry ? ('warning' as const) : ('good' as const),

          tiltAngleDeg: faceRes.tiltAngleDeg,
          isTilted: tiltRes.isTilted,
          tiltSeverity: tiltRes.severity,

          faceHeightRatio: faceRes.headBounds.headHeight,
          isFaceSizeCompliant:
            faceRes.headBounds.headHeight >= activePreset.headHeightMinRatio &&
            faceRes.headBounds.headHeight <= activePreset.headHeightMaxRatio,
          faceSizeSeverity: 'good' as const,

          lightingStatus: {
            ...lightingRes,
            lightingSeverity:
              lightingRes.isUnderexposed || lightingRes.isOverexposed || lightingRes.hasDirectionalShadow
                ? ('warning' as const)
                : ('good' as const),
          },

          eyeClosureStatus: {
            eyesClosed: !faceRes.eyeBlinkScore.leftEyeOpen || !faceRes.eyeBlinkScore.rightEyeOpen,
            severity:
              !faceRes.eyeBlinkScore.leftEyeOpen || !faceRes.eyeBlinkScore.rightEyeOpen
                ? ('warning' as const)
                : ('good' as const),
          },
        };

        setQualityAnalysis(qualityData);
        const initialChecks = evaluateCompliance(activePreset, faceRes, qualityData);
        setComplianceChecks(initialChecks);
      }

      setIsLoading(false);
      setStep('editor');
    } catch (err: unknown) {
      console.error('File load error:', err);
      setErrorMsg((err as Error).message || 'Failed to process image file.');
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsHovered(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Helper to generate synthetic test portraits
  const handleLoadSample = (mode: 'standard' | 'tilted' | 'dark') => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d')!;

    // Background color based on mode
    ctx.fillStyle = mode === 'dark' ? '#1E293B' : '#F3F4F6';
    ctx.fillRect(0, 0, 1200, 1600);

    ctx.save();
    if (mode === 'tilted') {
      ctx.translate(600, 750);
      ctx.rotate((6.5 * Math.PI) / 180); // 6.5 degree tilt
      ctx.translate(-600, -750);
    }

    // Torso / Shoulders
    ctx.fillStyle = mode === 'dark' ? '#0F172A' : '#1E293B';
    ctx.beginPath();
    ctx.ellipse(600, 1500, 450, 400, 0, 0, Math.PI * 2);
    ctx.fill();

    // Neck
    ctx.fillStyle = mode === 'dark' ? '#A37856' : '#E5C09B';
    ctx.fillRect(520, 950, 160, 200);

    // Oval face
    ctx.fillStyle = mode === 'dark' ? '#B88B64' : '#F2CDA7';
    ctx.beginPath();
    ctx.ellipse(600, 750, 260, 340, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(600, 680, 280, Math.PI * 0.9, Math.PI * 0.1, false);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(480, 730, 45, 25, 0, 0, Math.PI * 2);
    ctx.ellipse(720, 730, 45, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1E293B';
    ctx.beginPath();
    ctx.arc(480, 730, 20, 0, Math.PI * 2);
    ctx.arc(720, 730, 20, 0, Math.PI * 2);
    ctx.fill();

    // Nose
    ctx.strokeStyle = '#D4A373';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(600, 740);
    ctx.lineTo(590, 810);
    ctx.lineTo(610, 810);
    ctx.stroke();

    // Neutral Mouth
    ctx.strokeStyle = '#C87D55';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(530, 900);
    ctx.lineTo(670, 900);
    ctx.stroke();

    ctx.restore();

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample-${mode}-portrait.jpg`, { type: 'image/jpeg' });
        handleFile(file);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-4 shadow-lg shadow-emerald-500/5">
          <Lock className="w-3.5 h-3.5" /> 100% In-Browser WASM • Zero Upload Security Guarantee
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Passport & ID Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Compliance Assistant</span>
        </h1>
        <p className="mt-3 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
          Auto-centers face position, levels eye alignment, checks lighting & blur quality, and generates printable 300 DPI layout sheets.
        </p>
      </div>

      {/* Main Dropzone Box */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsHovered(true);
        }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 bg-slate-900/60 backdrop-blur-xl ${
          isHovered
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01] shadow-2xl shadow-emerald-500/10'
            : 'border-slate-800 hover:border-slate-700'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
          onChange={handleInputChange}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleInputChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20" />
              <div className="absolute inset-0 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin" />
              <Cpu className="w-6 h-6 text-emerald-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white">Analyzing Facial Landmarks...</h3>
            <p className="text-xs text-slate-400 mt-1">Running MediaPipe 478 3D landmark engine & compliance checks</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center mb-5 text-emerald-400 shadow-xl shadow-slate-950/80 group">
              <Upload className="w-8 h-8 stroke-[1.75] group-hover:scale-110 transition-transform" />
            </div>

            <h3 className="text-xl font-bold text-white">Drag and drop your photo here</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm">
              Supports JPEG, PNG, WEBP, and iPhone HEIC photos.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <FileImage className="w-4 h-4 stroke-[2.5]" /> Browse Photo
              </button>

              <button
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 shadow-md transition-all"
              >
                <Camera className="w-4 h-4 text-emerald-400" /> Use Camera
              </button>
            </div>

            {/* 3 Sample Test Photo Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 w-full max-w-lg">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                Try Sample Test Cases
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  onClick={() => handleLoadSample('standard')}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Standard
                </button>

                <button
                  onClick={() => handleLoadSample('tilted')}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Tilted Pose
                </button>

                <button
                  onClick={() => handleLoadSample('dark')}
                  className="px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Dark Lighting
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
          </div>
        )}
      </div>
    </div>
  );
};
