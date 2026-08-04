import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import { Camera, X, RefreshCw, Sparkles, AlertCircle } from 'lucide-react';

export const WebcamCaptureModal: React.FC = () => {
  const { isWebcamModalOpen, setWebcamModalOpen, setImageFile, setStep } = useEditorStore();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please allow camera permissions in your browser settings.');
    }
  }, [facingMode, stream]);

  useEffect(() => {
    if (isWebcamModalOpen) {
      startCamera();
    } else if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isWebcamModalOpen, facingMode]);

  const handleClose = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setWebcamModalOpen(false);
    setCountdown(null);
    setIsCapturing(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle horizontal flip if front camera
    if (facingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `passport_camera_${Date.now()}.jpg`, { type: 'image/jpeg' });
          const url = URL.createObjectURL(blob);
          setImageFile(file, url, { width: canvas.width, height: canvas.height });

          handleClose();
          setStep('preset');
        }
      },
      'image/jpeg',
      0.95
    );
  };

  const startCountdown = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      capturePhoto();
    }
  }, [countdown]);

  if (!isWebcamModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Live Camera Passport Studio</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {cameraError ? (
            <div className="text-center p-6 text-slate-400 space-y-3 max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-sm font-medium text-slate-200">{cameraError}</p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Retry Camera Access
              </button>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
              />

              {/* Real-time Passport Alignment Target Overlay */}
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                {/* Face Ellipse Guide */}
                <div className="w-[52%] h-[68%] border-2 border-dashed border-emerald-400/80 rounded-[50%] relative flex flex-col items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  {/* Eye Target Level */}
                  <div className="absolute top-[42%] w-full border-t border-dashed border-emerald-400/60 flex justify-between px-4">
                    <span className="text-[10px] text-emerald-400 bg-slate-950/70 px-1 rounded -translate-y-1/2">
                      EYE LINE
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-slate-950/70 px-1 rounded -translate-y-1/2">
                      EYE LINE
                    </span>
                  </div>

                  {/* Chin Base Guide */}
                  <div className="absolute bottom-[8%] border-b border-dashed border-emerald-400/50 px-3 py-0.5 bg-slate-950/60 rounded text-[9px] text-emerald-300">
                    CHIN BOTTOM
                  </div>
                </div>

                <p className="mt-4 text-xs font-semibold text-emerald-300 bg-slate-950/70 px-3 py-1 rounded-full border border-emerald-500/30">
                  Align face within green oval and keep eyes level
                </p>
              </div>

              {/* Countdown Splash */}
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs">
                  <span className="text-8xl font-black text-emerald-400 animate-ping">{countdown}</span>
                </div>
              )}
            </>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setFacingMode(facingMode === 'user' ? 'environment' : 'user')}
            disabled={!stream}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-50"
          >
            <RefreshCw className="w-4 h-4" /> Flip Camera
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={startCountdown}
              disabled={!stream || isCapturing || countdown !== null}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-400" /> 3s Timer
            </button>

            <button
              onClick={capturePhoto}
              disabled={!stream || isCapturing}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
            >
              <Camera className="w-4 h-4" /> Snap Photo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
