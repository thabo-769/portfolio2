import React, { useState } from 'react';
import { Mail, Github, Linkedin, Send, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { ContactFormData, FormErrors } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import confetti from 'canvas-confetti';

export const Contact: React.FC = () => {
  const { playSound } = useTheme();
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      errs.name = 'Please provide your name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please provide a message with at least 10 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      playSound('hover');
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      playSound('success');

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFFFFF', '#A1A1AA', '#71717A']
        });
      } catch {
        // Fallback silently
      }

      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setErrors({});

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    }, 600);
  };

  return (
    <section
      id="contact"
      aria-label="Contact Section"
      className="relative py-24 sm:py-32 bg-[#000000] text-white border-t border-[#1F1F1F] text-left font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Section Header */}
        <div className="text-left max-w-2xl mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA] text-left">
            <span className="w-4 h-0.5 bg-[#71717A]" />
            <span>06 // CONTACT & INQUIRIES</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white uppercase text-left">
            LET'S WORK TOGETHER.
          </h2>

          <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed text-left">
            Have a project in mind or an open engineering role? Drop a message below or connect directly.
          </p>
        </div>

        {/* Simple 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Direct Contact & Social Links */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0C0C0C] border border-[#1F1F1F] space-y-6">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-[#71717A] mb-1">
                  Direct Email
                </p>
                <a
                  href="mailto:thabolanez4@gmail.com"
                  className="text-lg sm:text-xl font-bold text-white hover:text-[#A1A1AA] transition-colors inline-flex items-center gap-2"
                >
                  <span>thabolanez4@gmail.com</span>
                  <ArrowUpRight className="w-4 h-4 text-[#71717A]" />
                </a>
              </div>

              <div className="border-t border-[#1F1F1F] pt-5">
                <p className="text-xs font-mono uppercase tracking-wider text-[#71717A] mb-3">
                  Connect & Socials
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href="https://github.com/thabolanez4"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-white hover:text-black border border-[#27272A] text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                  >
                    <Github className="w-3.5 h-3.5" />
                    <span>GitHub</span>
                  </a>

                  <a
                    href="https://linkedin.com/in/thabo-tshabangu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-white hover:text-black border border-[#27272A] text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                  </a>

                  <a
                    href="mailto:thabolanez4@gmail.com"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#18181B] hover:bg-white hover:text-black border border-[#27272A] text-xs font-semibold uppercase tracking-wider transition-all duration-200"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Simple Contact Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0C0C0C] border border-[#1F1F1F]">
              {submitSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-white text-sm">Message Sent Successfully</h3>
                    <p className="text-xs text-[#A1A1AA] mt-1 leading-relaxed">
                      Thank you for reaching out! I will review your message and get back to you shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="contact-name" className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Your name"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-[#27272A] focus:border-white focus:outline-none text-white text-sm placeholder-[#52525B] transition-colors"
                      />
                      {errors.name && <p className="text-[11px] text-rose-400">{errors.name}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="contact-email" className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@domain.com"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-[#27272A] focus:border-white focus:outline-none text-white text-sm placeholder-[#52525B] transition-colors"
                      />
                      {errors.email && <p className="text-[11px] text-rose-400">{errors.email}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project, timeline, or inquiry..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#000000] border border-[#27272A] focus:border-white focus:outline-none text-white text-sm placeholder-[#52525B] transition-colors resize-none leading-relaxed"
                    />
                    {errors.message && <p className="text-[11px] text-rose-400">{errors.message}</p>}
                  </div>

                  <button
                    id="btn-send-contact-message"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-white hover:bg-[#D4D4D8] text-black text-xs sm:text-sm font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

