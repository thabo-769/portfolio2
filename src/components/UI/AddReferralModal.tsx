import React, { useState, useEffect } from 'react';
import { X, Send, Star, User, Building, HeartHandshake, CheckCircle } from 'lucide-react';
import { Referral } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';
import confetti from 'canvas-confetti';

interface AddReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReferralAdded: (ref: Referral) => void;
}

export const AddReferralModal: React.FC<AddReferralModalProps> = ({ isOpen, onClose, onReferralAdded }) => {
  const { playSound } = useTheme();
  const { saveReferral, logActivity } = usePortfolioCms();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [relationship, setRelationship] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim() || !message.trim()) {
      setError('Please provide your name, role, and endorsement message.');
      playSound('hover');
      return;
    }

    setSubmitting(true);
    setError('');
    playSound('click');

    setTimeout(() => {
      const referral: Referral = {
        id: `ref-${Date.now()}`,
        name: name.trim(),
        clientName: name.trim(),
        role: role.trim(),
        position: role.trim(),
        organization: organization.trim() || 'Independent Partner',
        company: organization.trim() || 'Independent Partner',
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&w=200&q=80`,
        clientImage: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 50)}?auto=format&fit=crop&w=200&q=80`,
        message: message.trim(),
        testimonial: message.trim(),
        date: new Date().toLocaleDateString(),
        relationship: relationship.trim() || 'Professional Colleague',
        rating,
        verified: false,
        featured: false,
        displayOrder: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        deletedAt: null,
        isDeleted: false,
      };

      void saveReferral(referral).then(() => {
        setSubmitting(false);
        setSubmitted(true);
        onReferralAdded(referral);
        void logActivity({
          action: 'Referral submitted',
          item: referral.name,
          itemType: 'referral',
          user: referral.name,
        });
        playSound('success');

        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
            colors: ['#FFFFFF', '#71717A', '#A1A1AA', '#3F3F46']
          });
        } catch {
          // Fallback
        }

        setTimeout(() => {
          setSubmitted(false);
          setName('');
          setRole('');
          setOrganization('');
          setRelationship('');
          setMessage('');
          onClose();
        }, 2000);
      }).catch(error => {
        setSubmitting(false);
        setError(error instanceof Error ? error.message : 'Unable to save referral.');
      });
    }, 600);
  };

  return (
    <div
      id="add-referral-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 text-left"
      onClick={e => {
        if (e.target === e.currentTarget) {
          playSound('pop');
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="endorsement-title"
    >
      <div
        id="add-referral-modal-card"
        className="relative w-full max-w-lg bg-[#000000] border border-[#1F1F1F] rounded-3xl shadow-2xl overflow-hidden text-white p-6 sm:p-8 text-left"
      >
        <button
          id="btn-close-referral-modal"
          onClick={() => {
            playSound('pop');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#0C0C0C] hover:bg-white hover:text-[#000000] text-white transition-colors border border-[#1F1F1F] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-12 text-left space-y-3">
            <CheckCircle className="w-12 h-12 text-emerald-400 animate-bounce mb-2" />
            <h3 className="text-2xl font-bold text-white uppercase tracking-tight text-left">
              THANK YOU
            </h3>
            <p className="text-xs sm:text-sm text-[#A1A1AA] text-left">
              Your recommendation has been published to the portfolio.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="text-left">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#A1A1AA] font-semibold block text-left">
                ENDORSEMENT & TESTIMONIAL
              </span>
              <h2 id="endorsement-title" className="text-xl sm:text-2xl font-bold mt-1 uppercase tracking-tight text-white text-left">
                ADD A RECOMMENDATION
              </h2>
              <p className="text-xs text-[#71717A] mt-1 font-normal text-left">
                Share your perspective on collaborating with Thabo on technical projects.
              </p>
            </div>

            {error && (
              <div className="p-3 text-xs bg-red-900/40 border border-red-500/50 text-red-200 rounded-xl font-medium text-left">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="text-left">
                <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold text-left">
                  FULL NAME *
                </label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-[#0C0C0C] border border-[#1F1F1F] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                  />
                </div>
              </div>

              <div className="text-left">
                <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold text-left">
                  JOB TITLE / ROLE *
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    placeholder="e.g. Engineering Lead"
                    className="w-full bg-[#0C0C0C] border border-[#1F1F1F] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
              <div className="text-left">
                <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold text-left">
                  ORGANIZATION
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  placeholder="e.g. TechCorp / FinTech Labs"
                  className="w-full bg-[#0C0C0C] border border-[#1F1F1F] rounded-xl px-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                />
              </div>

              <div className="text-left">
                <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold text-left">
                  RELATIONSHIP
                </label>
                <div className="relative">
                  <HeartHandshake className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-3" />
                  <input
                    type="text"
                    value={relationship}
                    onChange={e => setRelationship(e.target.value)}
                    placeholder="e.g. Client, Manager, Partner"
                    className="w-full bg-[#0C0C0C] border border-[#1F1F1F] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3F3F46]"
                  />
                </div>
              </div>
            </div>

            <div className="text-left">
              <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold text-left">
                RATING (1 TO 5 STARS)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      playSound('pop');
                    }}
                    className="p-1 text-white hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        star <= rating ? 'fill-white text-white' : 'text-[#1F1F1F]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="text-left">
              <label className="text-[11px] uppercase tracking-wider text-[#A1A1AA] block mb-1 font-semibold text-left">
                YOUR ENDORSEMENT *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Share your perspective on Thabo's code quality, collaboration, problem-solving, or delivery speed..."
                className="w-full bg-[#0C0C0C] border border-[#1F1F1F] rounded-xl p-3 text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-[#3F3F46] resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-white hover:bg-[#A1A1AA] text-[#000000] font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
            >
              {submitting ? (
                <span>SUBMITTING...</span>
              ) : (
                <>
                  <span>PUBLISH RECOMMENDATION</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
