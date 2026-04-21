'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import jsQR from 'jsqr';
import { useAuth } from '@/components/auth/AuthProvider';
import api from '@/lib/api';

type FeedbackState = 'idle' | 'success' | 'wrong-event' | 'already-verified' | 'invalid';

const FEEDBACK_MSG: Record<FeedbackState, string> = {
  idle: 'Apunte la cámara al código QR del asistente',
  success: 'Asistencia registrada',
  'wrong-event': 'QR no corresponde a este evento',
  'already-verified': 'Este QR ya fue verificado',
  invalid: 'QR inválido',
};

const FEEDBACK_COLOR: Record<FeedbackState, string> = {
  idle: 'bg-black/60 text-white',
  success: 'bg-green-600 text-white',
  'wrong-event': 'bg-yellow-500 text-white',
  'already-verified': 'bg-red-600 text-white',
  invalid: 'bg-red-600 text-white',
};

export default function ScanPage() {
  const params = useParams<{ eventId: string }>();
  const { user, loading } = useAuth();
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const scanningRef = useRef(true);

  const [feedback, setFeedback] = useState<FeedbackState>('idle');
  const [cameraError, setCameraError] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (!loading && (!user || (!user.roles.includes('ADMIN') && !user.roles.includes('STAFF')))) {
      router.replace('/auth/login');
    }
  }, [user, loading, router]);

  const showFeedback = useCallback((state: FeedbackState) => {
    setFeedback(state);
    scanningRef.current = false;
    setTimeout(() => {
      setFeedback('idle');
      scanningRef.current = true;
    }, 2000);
  }, []);

  const handleVerify = useCallback(async (qrCode: string) => {
    try {
      await api.post('/attendance/verify', {
        qrCode,
        eventId: params.eventId,
        attended: true,
      });
      showFeedback('success');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number; data?: { message?: string } } }).response?.status;
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? '';
      if (status === 400 || message.includes('corresponde')) {
        showFeedback('wrong-event');
      } else if (status === 409) {
        showFeedback('already-verified');
      } else {
        showFeedback('invalid');
      }
    }
  }, [params.eventId, showFeedback]);

  // Decode loop
  const tick = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !scanningRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { rafRef.current = requestAnimationFrame(tick); return; }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      if (code?.data) {
        handleVerify(code.data);
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [handleVerify]);

  // Camera init
  useEffect(() => {
    if (!active) return;
    let stream: MediaStream | null = null;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then(s => {
        stream = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
          videoRef.current.play();
        }
        rafRef.current = requestAnimationFrame(tick);
      })
      .catch(() => setCameraError('No se pudo acceder a la cámara. Asegurate de dar permisos y usar HTTPS.'));

    return () => {
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [active, tick]);

  const handleStop = () => {
    setActive(false);
    cancelAnimationFrame(rafRef.current);
    const video = videoRef.current;
    if (video?.srcObject) {
      (video.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      video.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800">
        <Link
          href={`/admin/attendance/${params.eventId}`}
          className="text-white/70 hover:text-white text-sm"
        >
          ← Panel
        </Link>
        <h1 className="text-white font-semibold text-sm">Scanner QR</h1>
        <button
          onClick={handleStop}
          className="text-white/70 hover:text-white text-sm"
        >
          Detener
        </button>
      </div>

      {/* Camera viewport */}
      <div className="flex-1 relative flex items-center justify-center">
        {cameraError ? (
          <p className="text-white/70 text-sm px-6 text-center">{cameraError}</p>
        ) : (
          <>
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
            />
            {/* QR frame overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 border-4 border-white/70 rounded-2xl" />
            </div>
            {/* Hidden decode canvas */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Feedback bar */}
      <div className={`px-4 py-4 text-center text-sm font-medium transition-colors ${FEEDBACK_COLOR[feedback]}`}>
        {FEEDBACK_MSG[feedback]}
      </div>
    </div>
  );
}
