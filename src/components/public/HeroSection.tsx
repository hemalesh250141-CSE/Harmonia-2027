import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowDown,
  ArrowRight,
  Calendar,
  Eye,
  MapPin,
  Trophy,
  Users,
  X,
} from 'lucide-react';
import { OFFICIAL_ASSETS, TOTAL_PRIZE_POOL_LABEL } from '../../data/hackathonData';
import type { PosterConfig } from '../../types/hackathon';
import { HARMONIA_EASE } from '../motion/MotionPrimitives';
import { AudioVisualizerCountdown } from '../motion/MusicalMotionPrimitives';

interface HeroSectionProps {
  totalTeams: number;
  totalInnovators: number;
  posterConfig: PosterConfig;
  onRegisterClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  totalTeams,
  totalInnovators,
  posterConfig,
  onRegisterClick,
}) => {
  const [posterModalOpen, setPosterModalOpen] = useState(false);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const shouldReduceMotion = useReducedMotion();

  const hasVisiblePoster = !posterConfig.isHidden && Boolean(posterConfig.posterImageUrl);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMouseOffset({ x: x * 20, y: y * 20 });
  };

  const handleMouseLeave = () => {
    setMouseOffset({ x: 0, y: 0 });
  };

  return (
    <section
      id="home"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 lg:pt-12 lg:pb-20 overflow-hidden"
    >
      {/* Atmospheric Glowing Animated Orbs & Background Backdrop */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="harmonia-grid-overlay absolute inset-0 opacity-70" />
        <div
          className="absolute left-1/2 top-[32%] -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[840px] h-[380px] rounded-full bg-gradient-to-r from-violet-600/25 via-cyan-400/18 to-amber-500/22 blur-[120px] harmonia-glow-pulse transition-transform duration-300 ease-out"
          style={{ transform: `translate(calc(-50% + ${mouseOffset.x * 0.8}px), calc(-50% + ${mouseOffset.y * 0.8}px))` }}
        />
        <div
          className="absolute left-[12%] top-[20%] w-[300px] h-[300px] rounded-full bg-violet-500/18 blur-[90px] harmonia-float transition-transform duration-300 ease-out"
          style={{ transform: `translate(${mouseOffset.x * 1.2}px, ${mouseOffset.y * 1.2}px)` }}
        />
        <div
          className="absolute right-[12%] top-[48%] w-[340px] h-[340px] rounded-full bg-cyan-500/15 blur-[100px] harmonia-float transition-transform duration-300 ease-out"
          style={{ animationDelay: '2.5s', transform: `translate(${-mouseOffset.x * 1.2}px, ${-mouseOffset.y * 1.2}px)` }}
        />

        {/* Concentric Harmonic Rings */}
        <svg
          viewBox="0 0 800 440"
          className="harmonia-orbit-spin absolute left-1/2 top-[35%] -translate-x-1/2 -translate-y-1/2 w-[680px] sm:w-[980px] max-w-none opacity-30"
          fill="none"
        >
          <circle
            cx="400"
            cy="220"
            r="190"
            stroke="url(#heroHarmonicGrad1)"
            strokeWidth="1.5"
            strokeDasharray="6 8"
          />
          <circle
            cx="400"
            cy="220"
            r="142"
            stroke="url(#heroHarmonicGrad2)"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="heroHarmonicGrad1" x1="200" y1="220" x2="600" y2="220">
              <stop offset="0%" stopColor="#7C3AED" stopOpacity="0" />
              <stop offset="35%" stopColor="#22D3EE" stopOpacity="0.75" />
              <stop offset="70%" stopColor="#F59E0B" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="heroHarmonicGrad2" x1="250" y1="220" x2="550" y2="220">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0" />
              <stop offset="50%" stopColor="#A78BFA" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-10">
        {/* Presenter Lead-in & Monumental 3D Crest */}
        <div className="text-center flex flex-col items-center space-y-3 sm:space-y-4">
          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: HARMONIA_EASE }}
            className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-cyan-300 max-w-2xl bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-500/30"
          >
            Rajalakshmi Institute of Technology (RIT), Chennai · Dept. of CSE Presents
          </motion.p>

          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.06, ease: HARMONIA_EASE }}
            className="w-full max-w-2xl lg:max-w-3xl mx-auto harmonia-float"
            style={{
              transform: shouldReduceMotion
                ? undefined
                : `perspective(1000px) rotateY(${mouseOffset.x}deg) rotateX(${-mouseOffset.y}deg)`,
              transition: 'transform 120ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              className="overflow-hidden relative"
              style={{
                WebkitMaskImage:
                  'radial-gradient(ellipse 78% 72% at 50% 50%, #000 54%, transparent 92%)',
                maskImage:
                  'radial-gradient(ellipse 78% 72% at 50% 50%, #000 54%, transparent 92%)',
              }}
            >
              {/* Dynamic 3D Crystal Block Layer Moving Behind the Text */}
              <div
                className="absolute inset-0 bg-gradient-to-tr from-purple-600/30 via-cyan-500/20 to-amber-500/25 blur-xl pointer-events-none transition-transform duration-200"
                style={{
                  transform: `translate(${mouseOffset.x * 1.5}px, ${mouseOffset.y * 1.5}px) scale(1.1)`,
                }}
              />
              <img
                src={OFFICIAL_ASSETS.harmoniaLogo3D}
                alt="HARMONIA 27 International Hackathon"
                className="w-full max-h-[130px] sm:max-h-[190px] lg:max-h-[225px] object-contain mx-auto drop-shadow-[0_24px_55px_rgba(124,58,237,0.6)] relative z-10"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>
        </div>

        {/* Main Responsive Split: Mobile-First Priority Stack -> Desktop 12-Col Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 7 Cols: Headline, Value Prop, Event Metadata & Primary Actions */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: HARMONIA_EASE }}
            className="lg:col-span-7 space-y-4 sm:space-y-6"
          >
            <div className="space-y-2.5">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-[3.75rem] font-extrabold tracking-tight text-white leading-[1.05] text-balance">
                Ideas Beyond{' '}
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-cyan-300 bg-clip-text text-transparent">
                  Borders.
                </span>
              </h1>
              <p className="font-display text-base sm:text-lg font-semibold text-violet-200/95">
                International Hackathon &amp; 24-Hour Engineering Sprint
              </p>
            </div>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Join innovators at HARMONIA 2027 — RIT Chennai’s flagship international hackathon uniting
              builders worldwide across artificial intelligence, assistive engineering, resilient civic
              systems, intelligent supply chains, and edge IoT meshes.
            </p>

            {/* Unboxed Clean Event Essentials Metadata */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm font-medium text-slate-200 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Feb 3 &amp; 4, 2027</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>RIT, Chennai</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users className="w-4 h-4 text-violet-400 shrink-0" />
                <span>1–4 Members</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-semibold">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Prize Pool {TOTAL_PRIZE_POOL_LABEL}</span>
              </span>
            </div>

            {/* Live Compact Roster Readout */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span>
                <strong className="font-mono text-sm text-white tabular-nums">{totalTeams}</strong>{' '}
                Registered Teams
              </span>
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
              <span>
                <strong className="font-mono text-sm text-cyan-300 tabular-nums">
                  {totalInnovators}
                </strong>{' '}
                Innovators Enrolled
              </span>
              <span aria-hidden="true" className="text-white/25">
                /
              </span>
              <span>
                <strong className="font-mono text-sm text-amber-300 tabular-nums">
                  {TOTAL_PRIZE_POOL_LABEL}
                </strong>{' '}
                Cash Prize Pool
              </span>
            </div>

            {/* Mobile-Friendly Primary CTA Cluster (>= 44px touch targets) */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={onRegisterClick}
                className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold cta-gold-btn cursor-pointer min-h-[48px] whitespace-nowrap"
              >
                <span>Register Now</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <div className="flex items-center gap-2.5">
                <a
                  href="#tracks"
                  className="flex-1 sm:flex-initial group inline-flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-white/8 hover:bg-white/15 border border-white/15 transition-all min-h-[44px] whitespace-nowrap"
                >
                  <span>Explore Tracks</span>
                  <ArrowDown className="w-4 h-4 text-cyan-300 transition-transform group-hover:translate-y-0.5" />
                </a>

                {hasVisiblePoster && (
                  <button
                    type="button"
                    onClick={() => setPosterModalOpen(true)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-200 hover:text-amber-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer min-h-[44px] whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4 text-amber-300 shrink-0" />
                    <span>Official Poster</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right 5 Cols: Live Event Countdown */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.28, ease: HARMONIA_EASE }}
            className="lg:col-span-5 space-y-3"
          >
            <AudioVisualizerCountdown />

            <div className="rounded-2xl bg-[#080D20]/80 border border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-xl">
              <div className="min-w-0">
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                  Registration Fee
                </p>
                <p className="text-xs sm:text-sm font-bold text-white truncate">
                  ₹150 Solo · ₹300 Duo · ₹450 Trio · ₹500 Squad
                </p>
              </div>
              <a
                href="#register"
                className="text-xs font-bold text-amber-300 hover:text-amber-200 whitespace-nowrap shrink-0 min-h-[36px] flex items-center"
              >
                Fee Desk →
              </a>
            </div>
          </motion.div>
        </div>

        {/* Clean Institutional Organizer & Partner Strip (Mobile-Safe Proportions) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.34, ease: HARMONIA_EASE }}
          className="border-t border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
              Organized by
            </span>
            <div className="bg-white/95 rounded-lg px-2.5 py-1.5 border border-white/20 shadow-sm inline-flex items-center">
              <img
                src={OFFICIAL_ASSETS.ritWhiteLogo}
                alt="Rajalakshmi Institute of Technology"
                className="h-6 sm:h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-400 font-semibold">
              In Association With
            </span>
            <div className="bg-white/95 rounded-lg px-2.5 py-1.5 flex items-center gap-2.5 border border-white/20 shadow-sm">
              <img
                src={OFFICIAL_ASSETS.ieeeBlueLogo}
                alt="IEEE Computer Society"
                className="h-5 sm:h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
              <span aria-hidden="true" className="h-4 w-px bg-slate-200" />
              <img
                src={OFFICIAL_ASSETS.idatamindWebp}
                alt="iDataMind"
                className="h-5 sm:h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Full Official Poster Lightbox Modal */}
      <AnimatePresence>
        {posterModalOpen && hasVisiblePoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={posterConfig.title}
            className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPosterModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: HARMONIA_EASE }}
              className="relative max-w-2xl w-full max-h-[90vh] bg-[#0B1124] border border-white/15 rounded-2xl p-3 sm:p-4 shadow-2xl overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-white/10">
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold text-white truncate">
                    {posterConfig.title}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {posterConfig.caption}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPosterModalOpen(false)}
                  aria-label="Close official poster preview"
                  className="w-10 h-10 rounded-full bg-white text-[#090D1C] shadow-lg flex items-center justify-center hover:bg-amber-300 cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img
                src={posterConfig.posterImageUrl}
                alt={posterConfig.title}
                className="w-full h-auto max-h-[75vh] object-contain rounded-xl mx-auto"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
