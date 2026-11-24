import React from 'react';

const ANNOUNCEMENT_ITEMS = [
  { text: 'HARMONIA 2027 · IDEAS BEYOND BORDERS', accent: true },
  { text: '24-HOUR INTERNATIONAL HACKATHON', accent: false },
  { text: 'FEBRUARY 3 & 4, 2027 · RIT CHENNAI', accent: false },
  { text: 'PRIZE POOL ₹50,000 · TEAM SIZE 1–4', accent: true },
  { text: 'RAJALAKSHMI INSTITUTE OF TECHNOLOGY · DEPT. OF CSE', accent: false },
  { text: 'IN ASSOCIATION WITH IEEE COMPUTER SOCIETY & iDataMind', accent: false },
];

export const AnnouncementBar: React.FC = () => {
  const repeated = [...ANNOUNCEMENT_ITEMS, ...ANNOUNCEMENT_ITEMS];

  return (
    <div
      aria-label="Event Announcements"
      className="relative z-40 h-7 bg-[#070B19] border-b border-white/10 overflow-hidden select-none marquee-wrapper no-print flex items-center"
    >
      <div className="marquee-track items-center gap-5 pr-5 text-[10px] sm:text-[11px] font-mono tracking-wider text-slate-300">
        {repeated.map((item, idx) => (
          <React.Fragment key={`${item.text}-${idx}`}>
            <span
              className={`whitespace-nowrap ${
                item.accent ? 'text-amber-300 font-semibold' : 'text-slate-300'
              }`}
            >
              {item.text}
            </span>
            <span aria-hidden="true" className="text-cyan-400 text-[10px]">
              ·
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
