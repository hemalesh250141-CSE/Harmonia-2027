import React, { useState } from 'react';
import type { User } from 'firebase/auth';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle2, Loader2, UserCheck, X } from 'lucide-react';
import { saveParticipantProfileToFirestore } from '../../firebase';
import type { ParticipantProfile } from '../../types/hackathon';
import { normalizeIndianMobile, validateParticipantProfile } from '../../utils/hackathonLogic';
import { HARMONIA_EASE } from '../motion/MotionPrimitives';

interface ParticipantProfileModalProps {
  open: boolean;
  firebaseUser: User | null;
  existingProfile: ParticipantProfile | null;
  onClose: () => void;
  onSaved: (profile: ParticipantProfile) => void;
}

export const ParticipantProfileModal: React.FC<ParticipantProfileModalProps> = ({
  open,
  firebaseUser,
  existingProfile,
  onClose,
  onSaved,
}) => {
  const [fullName, setFullName] = useState(
    existingProfile?.fullName || firebaseUser?.displayName || ''
  );
  const [email, setEmail] = useState(existingProfile?.email || firebaseUser?.email || '');
  const [mobile, setMobile] = useState(existingProfile?.mobile || '');
  const [whatsapp, setWhatsapp] = useState(existingProfile?.whatsapp || '');
  const [department, setDepartment] = useState(existingProfile?.department || '');
  const [institution, setInstitution] = useState(existingProfile?.institution || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  if (!open || !firebaseUser) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    const candidate = {
      fullName: fullName.trim(),
      email: email.trim(),
      mobile: normalizeIndianMobile(mobile),
      whatsapp: normalizeIndianMobile(whatsapp),
      department: department.trim(),
      institution: institution.trim(),
    };
    const validation = validateParticipantProfile(candidate);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const profile: ParticipantProfile = {
        uid: firebaseUser.uid,
        ...candidate,
        updatedAt: new Date().toISOString(),
      };
      await saveParticipantProfileToFirestore(profile);
      onSaved(profile);
      onClose();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : 'Unable to save participant profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#060A18]/90 border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Participant Profile Setup"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: HARMONIA_EASE }}
        className="obsidian-glass rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close profile dialog"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-violet-500/20 border border-violet-400/35 text-amber-300 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">Participant Profile</h3>
            <p className="text-xs text-slate-300">
              Saved securely to Cloud Firestore for quick team registration.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label htmlFor="prof-name" className="block text-xs font-bold text-slate-200 mb-1">
              Full Name
            </label>
            <input
              id="prof-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={inputClass}
            />
            {errors.fullName && <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="prof-email" className="block text-xs font-bold text-slate-200 mb-1">
              Email Address
            </label>
            <input
              id="prof-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-mobile" className="block text-xs font-bold text-slate-200 mb-1">
                Mobile (+91 10 Digits)
              </label>
              <input
                id="prof-mobile"
                type="tel"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="9876543210"
                className={`${inputClass} font-mono`}
              />
              {errors.mobile && <p className="text-xs text-rose-400 mt-1">{errors.mobile}</p>}
            </div>

            <div>
              <label
                htmlFor="prof-whatsapp"
                className="block text-xs font-bold text-slate-200 mb-1"
              >
                WhatsApp Number
              </label>
              <input
                id="prof-whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="9876543210"
                className={`${inputClass} font-mono`}
              />
              {errors.whatsapp && <p className="text-xs text-rose-400 mt-1">{errors.whatsapp}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="prof-dept" className="block text-xs font-bold text-slate-200 mb-1">
              Department &amp; Year
            </label>
            <input
              id="prof-dept"
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="e.g., B.E. CSE - III Year"
              className={inputClass}
            />
            {errors.department && <p className="text-xs text-rose-400 mt-1">{errors.department}</p>}
          </div>

          <div>
            <label htmlFor="prof-inst" className="block text-xs font-bold text-slate-200 mb-1">
              Institution / College
            </label>
            <input
              id="prof-inst"
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="Rajalakshmi Institute of Technology, Chennai"
              className={inputClass}
            />
            {errors.institution && (
              <p className="text-xs text-rose-400 mt-1">{errors.institution}</p>
            )}
          </div>

          {saveError && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 p-3 text-xs text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/10 hover:bg-white/15 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cta-gold-btn cursor-pointer disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Save Profile
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
