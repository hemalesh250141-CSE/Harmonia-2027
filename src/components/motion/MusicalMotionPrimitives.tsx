import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { EVENT_END_DATE, EVENT_START_DATE } from '../../data/hackathonData';
import { computeEventCountdown } from '../../utils/hackathonLogic';
import { HARMONIA_EASE } from './MotionPrimitives';

/* ============================================================================
 * 1. TOUCH / POINTER SOUND-WAVE RIPPLE LAYER (GPU transform/opacity only)
 * ========================================================================== */
interface RippleWave {
  id: number;
  x: number;
  y: number;
}

export const TouchRippleLayer: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<RippleWave[]>([]);
  const nextId = useRef(1);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('input, textarea, select')) return;

      const id = nextId.current++;
      const x = e.clientX;
      const y = e.clientY;
      setRipples((prev) => [...prev.slice(-4), { id, x, y }]);

      window.setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 650);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [shouldReduceMotion]);

  if (shouldReduceMotion || ripples.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-30 pointer-events-none overflow-hidden no-print"
    >
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="harmonia-touch-ripple"
        />
      ))}
    </div>
  );
};

/* ============================================================================
 * 2. SUBTLE CURSOR / TOUCH RADIAL GLOW OVERLAY (Desktop pointer reactive)
 * ========================================================================== */
export const PointerGlowOverlay: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const glowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let rafId = 0;
    let targetX = -400;
    let targetY = -400;

    const update = () => {
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${targetX - 180}px, ${targetY - 180}px, 0)`;
      }
      rafId = 0;
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!rafId) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [shouldReduceMotion]);

  if (shouldReduceMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block fixed inset-0 pointer-events-none z-0 overflow-hidden no-print"
    >
      <div
        ref={glowRef}
        style={{ transform: 'translate3d(-600px, -600px, 0)' }}
        className="w-[360px] h-[360px] rounded-full bg-radial from-cyan-400/10 via-violet-500/5 to-transparent blur-2xl will-change-transform"
      />
    </div>
  );
};

/* ============================================================================
 * 3. INTERACTIVE MUSICAL EQUALIZER WAVEFORM
 * ========================================================================== */
interface InteractiveWaveformProps {
  bars?: number;
  tone?: 'cyan' | 'amber' | 'violet';
  compact?: boolean;
  className?: string;
}

const BAR_HEIGHTS = [0.42, 0.86, 0.6, 0.98, 0.52, 0.78, 0.92, 0.48, 0.74, 0.62, 0.88, 0.5];

export const InteractiveWaveform: React.FC<InteractiveWaveformProps> = ({
  bars = 12,
  tone = 'cyan',
  compact = false,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [pulseSeed, setPulseSeed] = useState(0);

  const colorClass =
    tone === 'amber'
      ? 'from-amber-300 via-amber-400 to-orange-400'
      : tone === 'violet'
        ? 'from-violet-400 via-purple-400 to-cyan-300'
        : 'from-cyan-300 via-sky-400 to-violet-400';

  return (
    <div
      className={`flex items-end gap-[3px] select-none ${compact ? 'h-5' : 'h-8'} ${className}`}
      aria-hidden="true"
      onClick={() => setPulseSeed((s) => s + 1)}
      onMouseLeave={() => setHoveredIdx(null)}
    >
      {Array.from({ length: bars }, (_, idx) => {
        const baseScale = BAR_HEIGHTS[(idx + pulseSeed) % BAR_HEIGHTS.length];
        const proximityBoost =
          hoveredIdx !== null ? Math.max(0, 1 - Math.abs(hoveredIdx - idx) * 0.35) * 0.25 : 0;
        const scale = Math.min(1, baseScale + proximityBoost);

        return (
          <motion.span
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            animate={
              shouldReduceMotion
                ? { scaleY: baseScale }
                : {
                    scaleY: [
                      Math.max(0.25, scale * 0.55),
                      scale,
                      Math.max(0.3, scale * 0.65),
                    ],
                  }
            }
            transition={{
              duration: 1.4 + (idx % 4) * 0.28,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
              delay: idx * 0.08,
            }}
            style={{ transformOrigin: 'bottom center' }}
            className={`w-[3px] rounded-full bg-gradient-to-t ${colorClass} h-full`}
          />
        );
      })}
    </div>
  );
};

/* ============================================================================
 * 4. LIVE AUDIO-VISUALIZER COUNTDOWN (Upcoming -> Live Now -> Completed)
 * ========================================================================== */
interface AudioVisualizerCountdownProps {
  className?: string;
}

export const AudioVisualizerCountdown: React.FC<AudioVisualizerCountdownProps> = ({
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const startMs = Date.parse(EVENT_START_DATE);
  const endMs = Date.parse(EVENT_END_DATE);

  const [countdown, setCountdown] = useState(() =>
    computeEventCountdown(Date.now(), startMs, endMs)
  );

  useEffect(() => {
    const tick = () => {
      setCountdown(computeEventCountdown(Date.now(), startMs, endMs));
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [startMs, endMs]);

  const statusMeta =
    countdown.status === 'LIVE'
      ? {
          badgeText: 'LIVE NOW',
          subLabel: 'Sprint Ends In · RIT Chennai Arena',
          accentClass: 'text-emerald-300 border-emerald-400/40 bg-emerald-500/12',
          tone: 'cyan' as const,
        }
      : countdown.status === 'COMPLETED'
        ? {
            badgeText: 'EVENT COMPLETED',
            subLabel: 'HARMONIA 2027 Concluded · Feb 3–4, 2027',
            accentClass: 'text-slate-300 border-white/20 bg-white/8',
            tone: 'violet' as const,
          }
        : {
            badgeText: 'UPCOMING',
            subLabel: 'Kickoff Countdown · 03 Feb 2027 · 09:00 AM IST',
            accentClass: 'text-amber-300 border-amber-400/35 bg-amber-400/10',
            tone: 'amber' as const,
          };

  const units = [
    { label: 'DAYS', value: countdown.days, color: 'text-white' },
    { label: 'HOURS', value: countdown.hours, color: 'text-cyan-300' },
    { label: 'MINUTES', value: countdown.minutes, color: 'text-violet-300' },
    { label: 'SECONDS', value: countdown.seconds, color: 'text-amber-300' },
  ];

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: HARMONIA_EASE }}
      aria-label="Event Live Countdown Timer"
      className={`rounded-2xl bg-[#0A1024]/90 border border-white/12 p-3.5 sm:p-4 shadow-[0_18px_42px_-20px_rgba(0,0,0,0.75)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <InteractiveWaveform bars={8} tone={statusMeta.tone} compact />
          <p className="text-[11px] font-mono text-slate-300 truncate">{statusMeta.subLabel}</p>
        </div>
        <span
          data-testid="countdown-status-badge"
          className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wider whitespace-nowrap ${statusMeta.accentClass}`}
        >
          {statusMeta.badgeText}
        </span>
      </div>

      {/* 2x2 on mobile, 4x1 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="rounded-xl bg-[#060916]/95 border border-white/10 px-3 py-2.5 flex items-baseline sm:flex-col sm:items-center justify-between sm:justify-center gap-1"
          >
            <span
              className={`font-mono text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${unit.color}`}
            >
              {String(unit.value).padStart(2, '0')}
            </span>
            <span className="font-mono text-[10px] tracking-[0.16em] text-slate-400 font-semibold">
              {unit.label}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ============================================================================
 * 5. AMBIENT SOUND TOGGLE (OFF BY DEFAULT · Web Audio Harmonic Pad on click)
 * ========================================================================== */
interface AmbientSoundToggleProps {
  compact?: boolean;
  className?: string;
}

export const AmbientSoundToggle: React.FC<AmbientSoundToggleProps> = ({
  compact = false,
  className = '',
}) => {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const cleanupAudio = useCallback(() => {
    if (masterGainRef.current && ctxRef.current) {
      try {
        masterGainRef.current.gain.setTargetAtTime(0, ctxRef.current.currentTime, 0.08);
      } catch {
        // ignore
      }
    }
    if (ctxRef.current) {
      const ctx = ctxRef.current;
      ctxRef.current = null;
      masterGainRef.current = null;
      window.setTimeout(() => {
        ctx.close().catch(() => undefined);
      }, 220);
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  const toggleSound = () => {
    if (enabled) {
      cleanupAudio();
      setEnabled(false);
      return;
    }

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(0.032, ctx.currentTime + 0.6);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(640, ctx.currentTime);

      filter.connect(master);
      master.connect(ctx.destination);

      // Warm open-fifth / ninth ambient chord: C3, G3, D4, A4
      const freqs = [130.81, 196.0, 293.66, 440.0];
      freqs.forEach((hz, idx) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(hz, ctx.currentTime);
        oscGain.gain.setValueAtTime(idx === 0 ? 0.36 : 0.16, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
      });

      ctxRef.current = ctx;
      masterGainRef.current = master;
      setEnabled(true);
    } catch {
      setEnabled(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggleSound}
      aria-pressed={enabled}
      aria-label={enabled ? 'Mute ambient soundscape' : 'Enable subtle ambient soundscape'}
      title={enabled ? 'Ambient Sound: ON (Click to mute)' : 'Ambient Sound: OFF'}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] min-w-[40px] px-2 lg:px-3 text-xs font-semibold ${
        enabled
          ? 'bg-cyan-500/20 border-cyan-400/45 text-cyan-200'
          : 'bg-white/6 hover:bg-white/12 border-white/12 text-slate-300'
      } ${className}`}
    >
      {enabled ? (
        <Volume2 className="w-4 h-4 text-cyan-300 shrink-0" />
      ) : (
        <VolumeX className="w-4 h-4 text-slate-400 shrink-0" />
      )}
      {!compact && <span className="hidden lg:inline">{enabled ? 'Sound On' : 'Sound'}</span>}
    </button>
  );
};
