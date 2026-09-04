import React, { useState } from 'react';
import { ArrowUpRight, CheckCircle2, Github, Linkedin, Mail, Send } from 'lucide-react';
import { ContactFormData, FormErrors } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { usePortfolioCms } from '../../context/PortfolioCmsContext';
import confetti from 'canvas-confetti';

export const Contact: React.FC = () => {
  const { playSound } = useTheme();
  const { content, sendMessage, logActivity, trackEvent } = usePortfolioCms();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      playSound('hover');
      return;
    }

    setIsSubmitting(true);
    playSound('click');

    try {
      await sendMessage({
        senderName: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
      await trackEvent({
        type: 'contact_submission',
        label: formData.subject.trim() || 'Contact form submission',
      });
      await logActivity({
        action: 'Message received',
        item: formData.subject.trim() || formData.name.trim(),
        itemType: 'message',
        user: formData.name.trim(),
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      playSound('success');

      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#FFFFFF', '#A1A1AA', '#71717A'],
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
    } catch (error) {
      setIsSubmitting(false);
      setErrors(prev => ({ ...prev, message: error instanceof Error ? error.message : 'Unable to send your message.' }));
    }
  };

  return (
    <section
      id="contact"
      aria-label="Contact Section"
      className="relative border-t border-white/10 bg-[#000000] py-24 text-left font-sans text-white sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 text-left sm:px-6 lg:px-8">
        <div className="mb-12 max-w-2xl space-y-3 text-left sm:mb-16">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A1A1AA]">
            <span className="h-0.5 w-4 bg-[#71717A]" />
            <span>Contact</span>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-white sm:text-4xl md:text-5xl">
            Let's work together.
          </h2>
          <p className="text-sm leading-relaxed text-[#A1A1AA] sm:text-base">
            Have a project in mind or an open engineering role? Drop a message below or connect directly.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 text-left lg:grid-cols-12">
          <div className="space-y-6 text-left lg:col-span-5">
            <div className="space-y-5 rounded-2xl border border-white/10 bg-[#0C0C0C] p-6 sm:p-7">
              <div>
                <p className="mb-1 text-xs uppercase tracking-wider text-[#71717A]">Direct email</p>
                <a
                  href={`mailto:${content.contact.email}`}
                  className="inline-flex items-center gap-2 text-lg font-bold text-white transition-colors hover:text-[#A1A1AA] sm:text-xl"
                >
                  <span>{content.contact.email}</span>
                  <ArrowUpRight className="h-4 w-4 text-[#71717A]" />
                </a>
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="mb-3 text-xs uppercase tracking-wider text-[#71717A]">Phone</p>
                <p className="text-sm text-white">{content.contact.phone}</p>
              </div>

              <div className="border-t border-white/10 pt-5">
                <p className="mb-3 text-xs uppercase tracking-wider text-[#71717A]">Connect</p>
                <div className="flex flex-wrap gap-3">
                  {content.contact.socials.map(link => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#18181B] px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all duration-200 hover:bg-white hover:text-black"
                    >
                      {link.label === 'GitHub' ? <Github className="h-3.5 w-3.5" /> : link.label === 'LinkedIn' ? <Linkedin className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}
                      <span>{link.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-white/10 bg-[#0C0C0C] p-6 sm:p-8">
              {submitSuccess ? (
                <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-6 text-white">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-white" />
                  <div>
                    <h3 className="text-sm font-bold text-white">Message sent successfully</h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#A1A1AA]">
                      Thank you for reaching out. Your message has been saved to the inbox and will be reviewed shortly.
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <InputField
                      id="contact-name"
                      label="Name"
                      value={formData.name}
                      onChange={value => setFormData(prev => ({ ...prev, name: value }))}
                      placeholder="Your name"
                      error={errors.name}
                    />
                    <InputField
                      id="contact-email"
                      label="Email"
                      value={formData.email}
                      onChange={value => setFormData(prev => ({ ...prev, email: value }))}
                      placeholder="your.email@domain.com"
                      error={errors.email}
                    />
                  </div>

                  <InputField
                    id="contact-subject"
                    label="Subject"
                    value={formData.subject}
                    onChange={value => setFormData(prev => ({ ...prev, subject: value }))}
                    placeholder="Project inquiry"
                  />

                  <div className="space-y-1">
                    <label htmlFor="contact-message" className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell me about your project, timeline, or inquiry..."
                      className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm leading-relaxed text-white placeholder:text-[#52525B] outline-none transition-colors focus:border-white/30"
                    />
                    {errors.message && <p className="text-[11px] text-zinc-400">{errors.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-xs font-bold uppercase tracking-wider text-black transition-all duration-200 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send message'}</span>
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

function InputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  error?: string;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white placeholder:text-[#52525B] outline-none transition-colors focus:border-white/30"
      />
      {error && <p className="text-[11px] text-zinc-400">{error}</p>}
    </div>
  );
}

export default Contact;
