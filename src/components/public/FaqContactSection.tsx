import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUp,
  Calendar,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import { FAQ_ITEMS, OFFICIAL_ASSETS, POSTER_COORDINATORS } from '../../data/hackathonData';
import { HARMONIA_EASE, RevealSection } from '../motion/MotionPrimitives';

interface FaqContactSectionProps {
  onOpenCoordinatorPortal: () => void;
  onOpenTeamDashboard?: () => void;
  onOpenParticipantPortal?: () => void;
}

export const FaqContactSection: React.FC<FaqContactSectionProps> = ({
  onOpenCoordinatorPortal,
  onOpenTeamDashboard,
  onOpenParticipantPortal,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <>
      <section id="faq-contact" className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 sm:space-y-16">
          {/* Interactive Smooth FAQ Accordion */}
          <RevealSection className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 items-start">
            <div className="lg:col-span-4 space-y-2.5">
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-amber-400">
                Support &amp; Guidelines
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight text-balance">
                Frequently Asked Questions
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Everything you need to know about eligibility, team sizing, UPI payment
                verification, and 24-hour logistics at RIT Chennai.
              </p>
            </div>

            <div className="lg:col-span-8 space-y-2.5">
              {FAQ_ITEMS.map((item, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={item.q}
                    className={`rounded-2xl border transition-colors overflow-hidden ${
                      isOpen
                        ? 'bg-[#0E1630] border-amber-400/35 shadow-[0_14px_34px_-16px_rgba(245,158,11,0.22)]'
                        : 'bg-[#090F22]/80 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full px-4 sm:px-6 py-3.5 text-left flex items-center justify-between gap-3 cursor-pointer min-h-[48px]"
                    >
                      <span className="font-display text-sm sm:text-base font-bold text-white leading-snug">
                        {item.q}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isOpen
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-white/8 text-slate-300'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </motion.span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: HARMONIA_EASE }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 sm:px-6 pb-4 pt-2 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/8">
                            {item.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </RevealSection>

          {/* Organizers, Faculty & Student Coordinators (Exact Roster from Official Poster) */}
          <RevealSection className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
              <div>
                <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-cyan-300 mb-1.5">
                  Organizing Committee · RIT Chennai CSE
                </p>
                <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Hackathon Leadership &amp; Coordinators
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-400">
                Direct phone support for participants, travel queries, and technical tracks.
              </p>
            </div>

            {/* Institutional Patrons & Leadership */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {POSTER_COORDINATORS.leadership.map((leader) => (
                <div
                  key={leader.name}
                  className="obsidian-card rounded-2xl p-4 hover:border-amber-400/35 min-w-0"
                >
                  <p className="text-[11px] font-mono uppercase tracking-wider text-amber-300 mb-1">
                    {leader.role}
                  </p>
                  <p className="font-display text-sm sm:text-base font-bold text-white break-words">
                    {leader.name}
                  </p>
                </div>
              ))}
            </div>

            {/* Faculty & Student Coordinators */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="obsidian-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <h3 className="font-display text-base sm:text-lg font-bold text-white mb-3.5 flex items-center justify-between">
                  <span>Faculty Coordinators</span>
                  <span className="text-xs font-mono text-amber-300">Dept. of CSE</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {POSTER_COORDINATORS.faculty.map((fac) => (
                    <div
                      key={fac.name}
                      className="rounded-xl bg-[#070B18]/85 border border-white/10 hover:border-amber-400/35 p-3.5 flex flex-col justify-between transition-colors"
                    >
                      <div>
                        <p className="font-bold text-sm text-white">{fac.name}</p>
                        <p className="text-xs text-slate-400">{fac.role}</p>
                      </div>
                      <a
                        href={`tel:+91${fac.phone}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-amber-300 mt-2.5 hover:text-amber-200 min-h-[32px]"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        +91 {fac.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="obsidian-card rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <h3 className="font-display text-base sm:text-lg font-bold text-white mb-3.5 flex items-center justify-between">
                  <span>Student Coordinators</span>
                  <span className="text-xs font-mono text-cyan-300">Participant Desk</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {POSTER_COORDINATORS.student.map((stu) => (
                    <div
                      key={stu.name}
                      className="rounded-xl bg-[#070B18]/85 border border-white/10 hover:border-cyan-400/35 p-3.5 flex flex-col justify-between transition-colors"
                    >
                      <p className="font-bold text-sm text-white">{stu.name}</p>
                      <a
                        href={`tel:+91${stu.phone}`}
                        className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-cyan-300 mt-2.5 hover:text-cyan-200 min-h-[32px]"
                      >
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        +91 {stu.displayPhone || stu.phone}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* Atmospheric Multi-Column Agency Footer */}
      <footer className="relative bg-[#040610] border-t border-white/10 pt-12 pb-8 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
            {/* Brand Column */}
            <div className="lg:col-span-4 space-y-4">
              <div
                className="inline-block overflow-hidden"
                style={{
                  WebkitMaskImage:
                    'radial-gradient(ellipse 90% 82% at 50% 50%, #000 72%, transparent 97%)',
                  maskImage:
                    'radial-gradient(ellipse 90% 82% at 50% 50%, #000 72%, transparent 97%)',
                }}
              >
                <img
                  src={OFFICIAL_ASSETS.harmoniaLogo3D}
                  alt="HARMONIA 27"
                  className="h-12 w-auto object-contain scale-[1.03]"
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-sm font-bold text-white">
                Rajalakshmi Institute of Technology (RIT), Chennai
              </p>
              <p className="text-xs font-semibold text-amber-300">
                Department of Computer Science &amp; Engineering
              </p>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                24-hour international hackathon uniting innovators worldwide in association with
                IEEE Computer Society and iDataMind.
              </p>
            </div>

            {/* Navigation Column */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
                Navigation
              </p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <a href="#home" className="hover:text-white transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About HARMONIA
                  </a>
                </li>
                <li>
                  <a href="#tracks" className="hover:text-white transition-colors">
                    Hackathon Tracks (05)
                  </a>
                </li>
                <li>
                  <a href="#timeline" className="hover:text-white transition-colors">
                    Event Programme
                  </a>
                </li>
                <li>
                  <a href="#prizes" className="hover:text-white transition-colors">
                    Prizes &amp; Fast-Track
                  </a>
                </li>
                <li>
                  <a href="#faq-contact" className="hover:text-white transition-colors">
                    FAQ &amp; Coordinators
                  </a>
                </li>
              </ul>
            </div>

            {/* Portals Column */}
            <div className="lg:col-span-2 space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
                Portals
              </p>
              <ul className="space-y-2.5 text-sm text-slate-300">
                <li>
                  <a href="#register" className="text-amber-300 font-semibold hover:text-amber-200">
                    Register &amp; Pay →
                  </a>
                </li>
                {onOpenTeamDashboard && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenTeamDashboard}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Check Team Status
                    </button>
                  </li>
                )}
                {onOpenParticipantPortal && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenParticipantPortal}
                      className="hover:text-white transition-colors cursor-pointer text-left"
                    >
                      Participant Portal
                    </button>
                  </li>
                )}
                <li>
                  <button
                    type="button"
                    onClick={onOpenCoordinatorPortal}
                    className="inline-flex items-center gap-1.5 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer text-left"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Coordinator Access
                  </button>
                </li>
              </ul>
            </div>

            {/* Venue & Contact Column */}
            <div className="lg:col-span-3 space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
                Venue &amp; Contact
              </p>
              <div className="space-y-3 text-xs text-slate-300">
                <p className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>3 &amp; 4 February 2027 · 24 Hours</span>
                </p>
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-cyan-300 shrink-0 mt-0.5" />
                  <span>
                    Rajalakshmi Institute of Technology, Kuthambakkam, Chennai, Tamil Nadu 600124
                  </span>
                </p>
                <a
                  href="mailto:harmonia2027@ritchennai.edu.in"
                  className="flex items-center gap-2 hover:text-amber-300 transition-colors"
                >
                  <Mail className="w-4 h-4 text-violet-300 shrink-0" />
                  <span>harmonia2027@ritchennai.edu.in</span>
                </a>
              </div>

              <a
                href="#home"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                <span>Back to top</span>
                <ArrowUp className="w-3.5 h-3.5 text-amber-300" />
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <p className="text-xs text-slate-400">
                © 2027 HARMONIA · Rajalakshmi Institute of Technology (RIT), Chennai. In association
                with IEEE Computer Society &amp; iDataMind.
              </p>
              <p className="text-xs font-mono tracking-[0.25em] uppercase text-amber-300 font-bold">
                IDEAS BEYOND BORDERS.
              </p>
            </div>

            <div className="bg-white/95 rounded-lg px-3 py-1.5 border border-white/20 shadow-sm inline-flex items-center">
              <img
                src={OFFICIAL_ASSETS.ritWhiteLogo}
                alt="RIT Chennai"
                className="h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
