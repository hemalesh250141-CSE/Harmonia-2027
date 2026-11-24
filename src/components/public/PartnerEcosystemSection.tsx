import React from 'react';
import { OFFICIAL_ASSETS } from '../../data/hackathonData';
import { RevealSection } from '../motion/MotionPrimitives';

const INSTITUTIONAL_LOGOS = [
  {
    name: 'Rajalakshmi Institute of Technology',
    role: 'Host Institution',
    src: OFFICIAL_ASSETS.ritDarkLogo,
  },
  {
    name: 'NAAC A++ · NIRF 151–200 Band · IIC',
    role: 'Institutional Accreditations',
    src: OFFICIAL_ASSETS.accreditations,
  },
  {
    name: 'Rajalakshmi Institute of Technology Crest',
    role: 'Department of CSE',
    src: OFFICIAL_ASSETS.ritEmblem,
  },
];

const ASSOCIATION_LOGOS = [
  {
    name: 'IEEE Computer Society',
    role: 'Technical Co-Sponsor',
    src: OFFICIAL_ASSETS.ieeeBlueLogo,
  },
  {
    name: 'IEEE Computational Intelligence Society',
    role: 'Professional Society Chapter',
    src: OFFICIAL_ASSETS.ieeeCisLogo,
  },
  {
    name: 'iDataMind — Delivering Intelligence in Every Byte',
    role: 'Industry & Internship Partner',
    src: OFFICIAL_ASSETS.idatamindWebp,
  },
  {
    name: 'IEEE Computer Society',
    role: 'Student Branch & SIGHT',
    src: OFFICIAL_ASSETS.ieeeCsCrop,
  },
];

export const PartnerEcosystemSection: React.FC = () => {
  const repeatedInstitutional = [...INSTITUTIONAL_LOGOS, ...INSTITUTIONAL_LOGOS, ...INSTITUTIONAL_LOGOS];
  const repeatedAssociations = [...ASSOCIATION_LOGOS, ...ASSOCIATION_LOGOS];

  return (
    <section
      id="partners"
      aria-label="Organizers, Partners and Associations"
      className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 sm:space-y-12">
        {/* Group 1: Organized By (RIT Chennai & Accreditations) */}
        <RevealSection className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-amber-400 mb-1">
                Organized By · Department of Computer Science &amp; Engineering
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Host Institution &amp; Academic Bodies
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Hosted at Rajalakshmi Institute of Technology (RIT), Chennai — fostering
              accredited global engineering research and student innovation.
            </p>
          </div>

          <div className="marquee-wrapper carousel-fade-mask overflow-hidden py-1">
            <div className="marquee-track items-center gap-3.5 sm:gap-5 pr-4">
              {repeatedInstitutional.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="group w-48 sm:w-64 h-20 rounded-xl sm:rounded-2xl bg-white/95 hover:bg-white border border-white/30 px-4 py-3 flex items-center justify-center shrink-0 transition-all duration-300 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                  title={`${item.name} (${item.role})`}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className="max-h-11 sm:max-h-12 w-auto object-contain transition-opacity duration-300 opacity-95 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>

        {/* Group 2: In Association With (IEEE, IEEE CIS, iDataMind) */}
        <RevealSection delay={0.08} className="space-y-5 pt-6 border-t border-white/8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
            <div>
              <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-cyan-300 mb-1">
                In Association With · Technical Bodies &amp; Industry
              </p>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Professional Societies &amp; Industry Partners
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Guided by IEEE Computer Society, IEEE Computational Intelligence Society, and
              iDataMind technical mentors and jury leaders.
            </p>
          </div>

          <div className="marquee-wrapper carousel-fade-mask overflow-hidden py-1">
            <div className="marquee-track-slow items-center gap-3.5 sm:gap-5 pr-4">
              {repeatedAssociations.map((item, idx) => (
                <div
                  key={`${item.name}-${idx}`}
                  className="group w-48 sm:w-64 h-20 rounded-xl sm:rounded-2xl bg-white/95 hover:bg-white border border-white/30 px-4 py-3 flex items-center justify-center shrink-0 transition-all duration-300 shadow-[0_10px_24px_-12px_rgba(0,0,0,0.6)]"
                  title={`${item.name} (${item.role})`}
                >
                  <img
                    src={item.src}
                    alt={item.name}
                    className="max-h-11 sm:max-h-12 w-auto object-contain transition-opacity duration-300 opacity-95 group-hover:opacity-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      </div>
    </section>
  );
};
