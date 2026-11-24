import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Globe2, Lightbulb, Network, Sparkles } from 'lucide-react';
import { HARMONIA_EASE, RevealSection } from '../motion/MotionPrimitives';
import { InteractiveWaveform } from '../motion/MusicalMotionPrimitives';

const CONNECTION_NODES = [
  {
    step: '01',
    title: 'People',
    subtitle: 'Diverse Frequencies',
    detail:
      'Solo engineers, accessibility advocates, and interdisciplinary 4-member squads uniting across universities.',
    icon: <Globe2 className="w-4 h-4 text-amber-300" />,
    accent: 'border-amber-400/45 text-amber-300',
  },
  {
    step: '02',
    title: 'Ideas',
    subtitle: 'Inclusion-First Framing',
    detail:
      'Grounding technical curiosity in human dignity—languages, assistive mobility, rural livelihoods, and safety.',
    icon: <Lightbulb className="w-4 h-4 text-violet-300" />,
    accent: 'border-violet-400/45 text-violet-300',
  },
  {
    step: '03',
    title: 'Technology',
    subtitle: 'Applied Frontier Stack',
    detail:
      'Multilingual LLMs, edge sensors, computer vision, predictive routing graphs, and WCAG-verified interfaces.',
    icon: <Cpu className="w-4 h-4 text-cyan-300" />,
    accent: 'border-cyan-400/45 text-cyan-300',
  },
  {
    step: '04',
    title: 'Collaboration',
    subtitle: 'RIT × IEEE × iDataMind',
    detail:
      '24 continuous hours of mentoring from faculty researchers, IEEE SIGHT chapters, and industry architects.',
    icon: <Network className="w-4 h-4 text-emerald-300" />,
    accent: 'border-emerald-400/45 text-emerald-300',
  },
  {
    step: '05',
    title: 'Impact',
    subtitle: 'Beyond Campus',
    detail:
      'Deployable prototypes built to transition directly from jury stage to communities and fast-track internships.',
    icon: <Sparkles className="w-4 h-4 text-rose-300" />,
    accent: 'border-rose-400/45 text-rose-300',
  },
];

export const GlobalConnectionSection: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative py-12 sm:py-16 border-t border-white/8 overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full bg-cyan-500/8 blur-[110px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">
        <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-cyan-300 mb-1.5">
              The Harmony of Innovation · Ideas Beyond Borders
            </p>
            <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight text-balance">
              Five Resonant Stages From Empathy to Deployment.
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
            Tap or inspect each node along the HARMONIA arc—where distinct voices tune into shared
            technical breakthroughs.
          </p>
        </RevealSection>

        <div className="relative">
          {/* Desktop Animated Connection Line */}
          <div
            aria-hidden="true"
            className="hidden lg:block absolute top-10 left-10 right-10 h-px bg-white/10"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-violet-500 origin-left"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.9, ease: HARMONIA_EASE }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 relative">
            {CONNECTION_NODES.map((node, idx) => {
              const isActive = activeIndex === idx;
              return (
                <motion.button
                  key={node.step}
                  type="button"
                  onMouseEnter={() => setActiveIndex(idx)}
                  onFocus={() => setActiveIndex(idx)}
                  onClick={() => setActiveIndex(idx)}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.12 }}
                  transition={{ duration: 0.4, delay: idx * 0.05, ease: HARMONIA_EASE }}
                  className={`text-left rounded-2xl p-4 border transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-[#0F1833] border-white/25 shadow-[0_14px_34px_-16px_rgba(34,211,238,0.3)] -translate-y-0.5'
                      : 'bg-[#090F22]/85 border-white/8 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl bg-[#060914] border flex items-center justify-center shrink-0 ${
                        isActive ? node.accent : 'border-white/12'
                      }`}
                    >
                      {node.icon}
                    </div>
                    <div className="flex items-center gap-2">
                      {isActive && <InteractiveWaveform bars={4} tone="cyan" compact />}
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {node.step}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-display text-base font-bold text-white mb-0.5">
                    {node.title}
                  </h3>
                  <p className="text-[11px] font-medium text-cyan-300/90 mb-1.5">{node.subtitle}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{node.detail}</p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
