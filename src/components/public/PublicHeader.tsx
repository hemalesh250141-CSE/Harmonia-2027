import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  X,
} from 'lucide-react';
import { OFFICIAL_ASSETS } from '../../data/hackathonData';
import type { ParticipantProfile } from '../../types/hackathon';
import { HARMONIA_EASE } from '../motion/MotionPrimitives';
import { AmbientSoundToggle } from '../motion/MusicalMotionPrimitives';

interface PublicHeaderProps {
  firebaseUser: User | null;
  participantProfile: ParticipantProfile | null;
  onGoogleSignIn: () => void;
  onSignOut: () => void;
  onOpenProfileModal: () => void;
  onOpenTeamDashboard: () => void;
  onOpenCoordinatorPortal: () => void;
  onOpenParticipantPortal?: () => void;
  onRegisterClick: () => void;
  authLoading: boolean;
}

const NAV_ITEMS = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'tracks', label: 'Tracks', href: '#tracks' },
  { id: 'timeline', label: 'Timeline', href: '#timeline' },
  { id: 'prizes', label: 'Prizes', href: '#prizes' },
  { id: 'faq-contact', label: 'FAQ', href: '#faq-contact' },
];

export const PublicHeader: React.FC<PublicHeaderProps> = ({
  firebaseUser,
  participantProfile,
  onGoogleSignIn,
  onSignOut,
  onOpenProfileModal,
  onOpenTeamDashboard,
  onOpenCoordinatorPortal,
  onOpenParticipantPortal,
  onRegisterClick,
  authLoading,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState('home');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV_ITEMS.map((n) => n.id);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-35% 0px -55% 0px', threshold: 0.01 }
    );
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 no-print ${
        scrolled
          ? 'bg-[#060A18]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_14px_36px_-14px_rgba(0,0,0,0.85)]'
          : 'bg-[#050814]/65 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#home"
          className="flex items-center gap-2 shrink-0 whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 rounded-lg"
        >
          <img
            src={OFFICIAL_ASSETS.ritEmblem}
            alt="RIT Chennai Crest"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-1 ring-white/25 bg-white shrink-0"
            referrerPolicy="no-referrer"
          />
          <span className="font-display font-extrabold text-sm sm:text-lg tracking-tight text-white">
            HARMONIA <span className="text-amber-400">2027</span>
          </span>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden lg:flex items-center gap-6 text-xs xl:text-sm font-medium text-slate-300"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setActiveId(item.id)}
                className={`relative py-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive ? 'text-white font-semibold' : 'hover:text-white'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="activeNavUnderline"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute left-0 right-0 bottom-0 h-[2px] rounded-full bg-gradient-to-r from-amber-400 via-violet-400 to-cyan-400"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <AmbientSoundToggle />

          <button
            type="button"
            onClick={onOpenTeamDashboard}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-white/5 hover:bg-white/12 border border-white/12 transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <LayoutDashboard className="w-3.5 h-3.5 text-cyan-400" />
            <span>Team Status</span>
          </button>

          {firebaseUser ? (
            <div className="hidden md:flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenParticipantPortal || onOpenProfileModal}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 text-violet-200 border border-violet-400/30 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
                title="Participant Portal & Profile"
              >
                <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                <span className="max-w-[92px] truncate">
                  {participantProfile?.fullName || firebaseUser.displayName || 'Participant'}
                </span>
              </button>
              <button
                type="button"
                onClick={onSignOut}
                aria-label="Sign out of Google account"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onGoogleSignIn}
              disabled={authLoading}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-white/8 hover:bg-white/15 border border-white/15 whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 min-h-[40px] transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-300" />
              {authLoading ? 'Signing In...' : 'Sign In'}
            </button>
          )}

          <button
            type="button"
            onClick={onRegisterClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold cta-gold-btn whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onOpenCoordinatorPortal}
            aria-label="Coordinator Administrative Portal"
            title="Coordinator Portal"
            className="inline-flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/12 border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] min-w-[40px]"
          >
            <Shield className="w-4 h-4 text-violet-400" />
            <span className="hidden xl:inline">Coord</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-2 rounded-xl text-white bg-white/8 border border-white/15 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Staggered Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: HARMONIA_EASE }}
            className="lg:hidden border-t border-white/10 bg-[#080D1F]/98 backdrop-blur-2xl px-4 py-4 space-y-3 shadow-2xl"
          >
            <nav className="grid grid-cols-2 gap-2" aria-label="Mobile Navigation">
              {NAV_ITEMS.map((item, idx) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: idx * 0.03 }}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-100 bg-white/5 hover:bg-white/12 hover:text-amber-300 transition-colors min-h-[44px] flex items-center"
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            <div className="pt-2.5 border-t border-white/10 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenTeamDashboard();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 border border-white/15 min-h-[44px]"
              >
                <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                <span>Team Status</span>
              </button>
              {firebaseUser ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    (onOpenParticipantPortal || onOpenProfileModal)();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-violet-200 bg-violet-500/20 border border-violet-400/30 min-h-[44px]"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Participant Hub</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onGoogleSignIn();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-white bg-white/10 border border-white/15 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Google Sign-In</span>
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onRegisterClick();
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold cta-gold-btn min-h-[48px]"
            >
              <span>Register Your Team</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
