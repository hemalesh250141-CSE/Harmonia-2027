import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUpRight, Disc3, X, ZoomIn } from 'lucide-react';
import { TOTAL_PRIZE_POOL_INR } from '../../data/hackathonData';
import type { PosterConfig } from '../../types/hackathon';
import {
  AnimatedCounter,
  HARMONIA_EASE,
  RevealSection,
  StaggerGroup,
  StaggerItem,
} from '../motion/MotionPrimitives';
import { InteractiveWaveform } from '../motion/MusicalMotionPrimitives';

interface AboutStatsSectionProps {
  totalTeams: number;
  totalInnovators: number;
  posterConfig: PosterConfig;
  onRegisterClick: () => void;
}

export const AboutStatsSection: React.FC<AboutStatsSectionProps> = ({
  totalTeams,
  totalInnovators,
  posterConfig,
  onRegisterClick,
}) => {
  const [posterZoom, setPosterZoom] = useState(false);
  const showPoster = !posterConfig.isHidden && Boolean(posterConfig.posterImageUrl);

  return (
    <section id="about" className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
        {/* Asymmetric Editorial About + Dynamic Album Artwork Poster Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <RevealSection className={`${showPoster ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4 sm:space-y-5`}>
            <div className="flex items-center gap-2.5">
              <InteractiveWaveform bars={5} tone="amber" compact />
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-amber-400">
                HARMONIA 2027 · International Hackathon
              </p>
            </div>

            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] text-balance">
              Where Bold Engineering Solves What Borders Cannot.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Hosted by the Department of Computer Science &amp; Engineering at{' '}
              <strong className="text-white">Rajalakshmi Institute of Technology (RIT), Chennai</strong>
              , in association with <strong className="text-cyan-300">IEEE Computer Society</strong>{' '}
              and <strong className="text-amber-300">iDataMind</strong>, HARMONIA 2027 unites
              student builders for a continuous 24-hour engineering sprint built around global
              inclusion.
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              From multilingual Indic speech AI and low-cost assistive wearables to offline rural
              agritech, intelligent cold-chain routing, and campus microgrids, every prototype is
              mentored and evaluated by academic researchers and industry architects.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={onRegisterClick}
                className="group inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white cta-violet-btn cursor-pointer min-h-[44px]"
              >
                <span>Claim Your Team Slot</span>
                <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
              <span className="text-xs font-mono text-slate-400">
                Live Roster: <strong className="text-white">{totalTeams}</strong> Teams ·{' '}
                <strong className="text-cyan-300">{totalInnovators}</strong> Innovators
              </span>
            </div>
          </RevealSection>

          {/* Right: Dynamic Official Poster Showcase ("Album Artwork" Modal Trigger) */}
          {showPoster && (
            <RevealSection delay={0.08} className="lg:col-span-5">
              <div className="obsidian-card rounded-2xl p-3.5 sm:p-4 group relative overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 min-w-0">
                    <Disc3 className="w-4 h-4 shrink-0 text-cyan-300" />
                    <span className="truncate">{posterConfig.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPosterZoom(true)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300 hover:text-amber-300 transition-colors cursor-pointer shrink-0 min-h-[36px] px-2"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                    <span>Expand</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setPosterZoom(true)}
                  aria-label="Inspect official HARMONIA 2027 event poster"
                  className="w-full rounded-xl overflow-hidden bg-[#060916] border border-white/10 p-2 block cursor-pointer"
                >
                  <img
                    src={posterConfig.posterImageUrl}
                    alt={posterConfig.title}
                    className="w-full max-h-[290px] sm:max-h-[340px] object-contain mx-auto transition-transform duration-500 group-hover:scale-[1.02]"
                    referrerPolicy="no-referrer"
                  />
                </button>

                <div className="mt-2.5 flex items-center justify-between gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="truncate">{posterConfig.caption}</span>
                </div>
              </div>
            </RevealSection>
          )}
        </div>

        {/* Audio-Dashboard 2x2 Mobile / 4-Col Desktop Metric Strip (Zero Clipping at 320px+) */}
        <StaggerGroup className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StaggerItem className="obsidian-card rounded-2xl p-3.5 sm:p-5 min-w-0">
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 truncate">
              Continuous Sprint
            </p>
            <p className="font-display text-xl sm:text-3xl font-extrabold text-white leading-tight break-words">
              <AnimatedCounter target={24} suffix=" Hours" />
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-snug">
              On-campus build marathon
            </p>
          </StaggerItem>

          <StaggerItem className="obsidian-card rounded-2xl p-3.5 sm:p-5 min-w-0">
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 truncate">
              Innovation Arenas
            </p>
            <p className="font-display text-xl sm:text-3xl font-extrabold text-cyan-300 leading-tight break-words">
              <AnimatedCounter target={5} padZero={2} suffix=" Tracks" />
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-snug">
              AI, Assistive, Civic, Flow, IoT
            </p>
          </StaggerItem>

          <StaggerItem className="obsidian-card rounded-2xl p-3.5 sm:p-5 min-w-0">
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 truncate">
              Team Flexibility
            </p>
            <p className="font-display text-xl sm:text-3xl font-extrabold text-violet-300 leading-tight break-words">
              1–<AnimatedCounter target={4} suffix=" Members" />
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-snug">
              Solo to Squad · From ₹150
            </p>
          </StaggerItem>

          <StaggerItem className="obsidian-card rounded-2xl p-3.5 sm:p-5 min-w-0">
            <p className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5 truncate">
              Cash Prize Pool
            </p>
            <p className="font-display text-xl sm:text-3xl font-extrabold text-amber-300 leading-tight break-words">
              <AnimatedCounter target={TOTAL_PRIZE_POOL_INR} prefix="₹" formatIndian />
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1 leading-snug">
              Plus iDataMind internships
            </p>
          </StaggerItem>
        </StaggerGroup>
      </div>

      {/* Poster Lightbox Modal */}
      <AnimatePresence>
        {posterZoom && showPoster && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={posterConfig.title}
            className="fixed inset-0 z-50 bg-slate-950/88 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setPosterZoom(false)}
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
                <p className="font-display text-sm font-bold text-white truncate">
                  {posterConfig.title}
                </p>
                <button
                  type="button"
                  onClick={() => setPosterZoom(false)}
                  aria-label="Close poster lightbox"
                  className="w-10 h-10 rounded-full bg-white text-[#090D1C] flex items-center justify-center hover:bg-amber-300 cursor-pointer shrink-0"
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
