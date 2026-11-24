import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  Award,
  CalendarClock,
  Check,
  Clock,
  MapPin,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  JOURNEY_MILESTONES,
  PRIZE_TIERS,
  PROGRAMME_SCHEDULE,
  TIMELINE_EVENTS,
  TOTAL_PRIZE_POOL_INR,
} from '../../data/hackathonData';
import {
  AnimatedCounter,
  HARMONIA_EASE,
  RevealSection,
  StaggerGroup,
  StaggerItem,
} from '../motion/MotionPrimitives';
import { InteractiveWaveform } from '../motion/MusicalMotionPrimitives';

export const TimelinePrizesSection: React.FC = () => {
  const [activeDay, setActiveDay] = useState<'day1' | 'day2'>('day1');
  const [activeMilestoneIdx, setActiveMilestoneIdx] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  const currentDayData =
    PROGRAMME_SCHEDULE.find((d) => d.dayId === activeDay) || PROGRAMME_SCHEDULE[0];

  return (
    <>
      {/* Event Rhythm Timeline & Programme */}
      <section id="timeline" className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-12">
          <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-amber-400 mb-1.5">
                Event Rhythm · 03 – 04 Feb 2027
              </p>
              <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
                Two Days.{' '}
                <span className="text-amber-300">Twenty-Four Hours.</span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
              Follow the hackathon progression from registration through grand jury evaluation, and
              switch between Day 01 and Day 02 schedules at RIT Chennai.
            </p>
          </RevealSection>

          {/* 7-Stage Interactive Progression Beat */}
          <div className="obsidian-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <InteractiveWaveform bars={5} tone="cyan" compact />
                <p className="text-xs font-mono uppercase tracking-wider text-cyan-300">
                  Hackathon Tempo
                </p>
              </div>
              <span className="font-mono text-xs text-slate-400">
                Stage {JOURNEY_MILESTONES[activeMilestoneIdx].step}/07 ·{' '}
                <strong className="text-amber-300">
                  {JOURNEY_MILESTONES[activeMilestoneIdx].window}
                </strong>
              </span>
            </div>

            <div className="relative">
              <div
                aria-hidden="true"
                className="hidden md:block absolute top-5 left-6 right-6 h-[2px] bg-white/10"
              >
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 via-cyan-400 to-violet-500 origin-left"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.9, ease: HARMONIA_EASE }}
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 relative">
                {JOURNEY_MILESTONES.map((ms, idx) => {
                  const isActive = activeMilestoneIdx === idx;
                  return (
                    <button
                      key={ms.step}
                      type="button"
                      onClick={() => setActiveMilestoneIdx(idx)}
                      onMouseEnter={() => setActiveMilestoneIdx(idx)}
                      className={`text-left md:text-center rounded-xl p-2.5 transition-all cursor-pointer border min-h-[44px] ${
                        isActive
                          ? 'bg-[#121D3D] border-amber-400/55 shadow-[0_10px_24px_-10px_rgba(245,158,11,0.35)]'
                          : 'bg-white/[0.02] border-transparent hover:bg-white/5'
                      }`}
                    >
                      <div
                        className={`w-7 h-7 sm:w-8 sm:h-8 md:mx-auto rounded-full font-mono text-[11px] font-bold flex items-center justify-center mb-1.5 transition-colors border shrink-0 ${
                          isActive
                            ? 'bg-amber-400 text-slate-950 border-amber-300'
                            : 'bg-[#070B18] text-slate-300 border-white/20'
                        }`}
                      >
                        {ms.step}
                      </div>
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isActive ? 'text-white' : 'text-slate-300'
                        }`}
                      >
                        {ms.label}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">
                        {ms.window}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-xl bg-[#070B18]/85 border border-white/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-white">
                  {JOURNEY_MILESTONES[activeMilestoneIdx].label} —{' '}
                  <span className="text-amber-300">
                    {JOURNEY_MILESTONES[activeMilestoneIdx].window}
                  </span>
                </p>
                <p className="text-xs text-slate-300 mt-0.5">
                  {JOURNEY_MILESTONES[activeMilestoneIdx].detail}
                </p>
              </div>
              <span className="text-[10px] font-mono text-cyan-300 whitespace-nowrap shrink-0">
                IST (UTC +5:30)
              </span>
            </div>
          </div>

          {/* Interactive 2-Day Programme Switcher */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {PROGRAMME_SCHEDULE.map((day) => {
                const isSelected = activeDay === day.dayId;
                return (
                  <button
                    key={day.dayId}
                    type="button"
                    onClick={() => setActiveDay(day.dayId)}
                    aria-pressed={isSelected}
                    className={`relative rounded-2xl p-4 sm:p-5 text-left border transition-all cursor-pointer flex items-center gap-4 min-h-[72px] ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-400 text-slate-950 border-amber-200 shadow-[0_16px_38px_-14px_rgba(245,158,11,0.45)]'
                        : 'obsidian-card text-white hover:border-amber-400/40'
                    }`}
                  >
                    <div
                      className={`pr-4 border-r border-dashed shrink-0 ${
                        isSelected ? 'border-slate-900/25' : 'border-white/15'
                      }`}
                    >
                      <span
                        className={`block text-[10px] font-mono uppercase tracking-widest ${
                          isSelected ? 'text-slate-900/75' : 'text-amber-300'
                        }`}
                      >
                        Day
                      </span>
                      <span className="font-display text-2xl sm:text-3xl font-extrabold tabular-nums">
                        {day.dayId === 'day1' ? '01' : '02'}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <p className="font-display text-base sm:text-lg font-extrabold truncate">
                        {day.dateLabel}
                      </p>
                      <p
                        className={`text-xs mt-0.5 line-clamp-2 ${
                          isSelected ? 'text-slate-900/80 font-medium' : 'text-slate-400'
                        }`}
                      >
                        {day.summary}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentDayData.dayId}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: HARMONIA_EASE }}
                className="obsidian-card rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3"
              >
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <CalendarClock className="w-4 h-4 text-amber-300 shrink-0" />
                    <span className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-wide">
                      {currentDayData.dayBadge} · Campus Schedule
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-amber-300">
                    0{currentDayData.sessions.length} SESSIONS
                  </span>
                </div>

                <div className="space-y-2">
                  {currentDayData.sessions.map((session) => (
                    <div
                      key={session.index}
                      className="rounded-xl bg-[#070B18]/80 hover:bg-[#0D1530] border border-white/8 hover:border-white/20 px-3.5 py-3 grid grid-cols-1 md:grid-cols-12 gap-1.5 md:gap-4 items-center transition-colors"
                    >
                      <div className="md:col-span-5 flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-bold text-amber-300 shrink-0">
                          {session.index}
                        </span>
                        <span className="font-display text-sm font-bold text-white leading-snug">
                          {session.title}
                        </span>
                      </div>

                      <div className="md:col-span-3 text-xs text-slate-300">{session.format}</div>

                      <div className="md:col-span-2 flex items-center gap-1.5 text-xs font-mono text-cyan-300">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span>{session.timing}</span>
                      </div>

                      <div className="md:col-span-2 flex items-center md:justify-end gap-1.5 text-xs text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{session.venue}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Compact 4-Phase Cards */}
          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {TIMELINE_EVENTS.map((ev) => (
              <StaggerItem
                key={ev.phase}
                className="obsidian-card rounded-2xl p-4 flex flex-col justify-between"
              >
                <div>
                  <span className="font-mono text-xs font-bold text-amber-300">{ev.phase}</span>
                  <p className="font-mono text-[11px] text-slate-400 mt-0.5 mb-1.5">{ev.date}</p>
                  <h3 className="font-display text-sm sm:text-base font-bold text-white mb-1.5 leading-snug">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* Official ₹50,000 Total Prize Pool Showcase */}
      <section id="prizes" className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8 overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[320px] rounded-full bg-amber-500/10 blur-[120px]"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 space-y-6 sm:space-y-8">
          <RevealSection className="max-w-3xl space-y-2.5">
            <div className="flex items-center gap-2.5">
              <InteractiveWaveform bars={6} tone="amber" compact />
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-amber-400">
                Awards &amp; Recognition
              </p>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
              <span className="text-amber-300">
                <AnimatedCounter target={TOTAL_PRIZE_POOL_INR} prefix="₹" formatIndian />
              </span>{' '}
              Total Prize Pool &amp; Fast-Track Internships
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Celebrating technical originality, human inclusion, and deployment readiness across
              every HARMONIA 2027 channel.
            </p>
          </RevealSection>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {PRIZE_TIERS.map((prize) => (
              <StaggerItem
                key={prize.tier}
                className={`rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 ${
                  prize.highlight
                    ? 'bg-gradient-to-b from-[#1E1638] via-[#121633] to-[#080C1C] border border-amber-400/55 shadow-[0_22px_52px_-16px_rgba(245,158,11,0.38)] specular-sheen'
                    : 'obsidian-card'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`text-[11px] font-mono uppercase tracking-wider font-bold ${
                        prize.highlight ? 'text-amber-300' : 'text-cyan-300'
                      }`}
                    >
                      {prize.tier}
                    </span>
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        prize.highlight
                          ? 'bg-amber-400/15 border border-amber-300/40'
                          : 'bg-white/8 border border-white/12'
                      }`}
                    >
                      {prize.highlight ? (
                        <Trophy className="w-4 h-4 text-amber-300" />
                      ) : (
                        <Award className="w-4 h-4 text-violet-300" />
                      )}
                    </div>
                  </div>

                  <p className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums text-white mb-1">
                    {prize.amount}
                  </p>
                  <p className="text-xs font-medium text-slate-400 mb-5">{prize.subtitle}</p>

                  <ul className="space-y-2.5">
                    {prize.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                        <Check
                          className={`w-4 h-4 shrink-0 mt-0.5 ${
                            prize.highlight ? 'text-amber-300' : 'text-emerald-400'
                          }`}
                        />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {prize.highlight && (
                  <div className="mt-5 pt-3.5 border-t border-amber-400/20 flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Includes iDataMind Placement Fast-Track</span>
                  </div>
                )}
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>
    </>
  );
};
