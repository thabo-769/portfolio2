import React, { useState, useEffect } from 'react';
import { X, Plus, Sparkles, ExternalLink, Github, Image, Check, Trash2, Download, Upload } from 'lucide-react';
import { Project } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface AddProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProject: (project: Project) => void;
  existingCount: number;
}

const PRESET_IMAGES = [
  {
    name: 'AI & Data Workspace',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Mobile & Cloud Tech',
    url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'E-Commerce Platform',
    url: 'https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: '3D Spatial & WebGL',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Clean Tech & Green Energy',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Cyber Security & Matrix',
    url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
  },
];

const CATEGORIES = [
  'AI & Fullstack',
  'E-commerce',
  'Real Estate',
  'Clean Energy',
  'Digital Experience',
  'Mobile App',
  'Cloud & DevOps',
];

export const AddProjectModal: React.FC<AddProjectModalProps> = ({
  isOpen,
  onClose,
  onSaveProject,
  existingCount,
}) => {
  const { playSound } = useTheme();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<string>('AI & Fullstack');
  const [customCategory, setCustomCategory] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [technologies, setTechnologies] = useState('React 19, TypeScript, Tailwind CSS, Node.js');
  const [liveUrl, setLiveUrl] = useState('https://');
  const [githubUrl, setGithubUrl] = useState('https://github.com/thabolanez4/');
  const [image, setImage] = useState(PRESET_IMAGES[0].url);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [role, setRole] = useState('Lead Full-Stack Developer');
  const [duration, setDuration] = useState('3 Months');
  const [year, setYear] = useState(new Date().getFullYear());
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [featureInputs, setFeatureInputs] = useState<string>('Real-time synchronization\nType-safe modular API\nResponsive mobile-first interface');
  const [metricLabel, setMetricLabel] = useState('Active Users');
  const [metricValue, setMetricValue] = useState('10,000+');

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Please provide a Project Title.');
      return;
    }
    if (!liveUrl.trim() || liveUrl === 'https://') {
      setErrorMsg('Please provide a valid Live Demo URL.');
      return;
    }
    if (!githubUrl.trim() || githubUrl === 'https://github.com/') {
      setErrorMsg('Please provide a valid GitHub Repository URL.');
      return;
    }

    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const featureArray = featureInputs
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const nextNumber = String(existingCount + 1).padStart(2, '0');
    const finalImage = customImageUrl.trim() || image;
    const finalCategory = customCategory.trim() || category;

    const newProject: Project = {
      id: `custom-proj-${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      number: nextNumber,
      title: title.trim(),
      tagline: tagline.trim() || `${title.trim()} — Production Application`,
      shortDescription: shortDescription.trim() || `${title.trim()} is an enterprise full-stack platform built with modern web architecture.`,
      longDescription: longDescription.trim() || `${title.trim()} was engineered to deliver scalable performance, high availability, and seamless user interaction.`,
      category: finalCategory as any,
      image: finalImage,
      technologies: techArray.length > 0 ? techArray : ['React', 'TypeScript', 'Tailwind CSS'],
      liveUrl: liveUrl.trim(),
      githubUrl: githubUrl.trim(),
      featured: true,
      year: Number(year) || new Date().getFullYear(),
      role: role.trim() || 'Software Engineer',
      duration: duration.trim() || '3 Months',
      challenge: challenge.trim() || 'Designing a high-throughput, low-latency architecture with seamless real-time data flow.',
      solution: solution.trim() || 'Implemented modular serverless pipelines, client-side caching, and responsive UI components.',
      features: featureArray.length > 0 ? featureArray : ['Interactive client dashboard', 'Scalable database layer', 'End-to-end security'],
      metrics: [
        {
          label: metricLabel.trim() || 'Production Grade',
          value: metricValue.trim() || '100% Type-Safe',
        },
      ],
    };

    playSound('success');
    onSaveProject(newProject);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div
      id="add-project-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 text-left overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) {
          playSound('pop');
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-project-modal-title"
    >
      <div
        id="add-project-modal-card"
        className="relative w-full max-w-3xl my-8 bg-[#0C0C0C] border border-[#1F1F1F] rounded-3xl shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden text-white text-left font-sans"
      >
        {/* Top Accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-transparent via-white to-transparent" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-[#1F1F1F] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A1A1AA]">
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>PROJECT MANAGER // NO-CODE PUBLISHING</span>
            </div>
            <h3 id="add-project-modal-title" className="text-xl sm:text-2xl font-bold text-white uppercase tracking-tight">
              Add New Portfolio Project
            </h3>
            <p className="text-xs text-[#A1A1AA] leading-relaxed">
              Add a new showcase item instantly. Live demo & GitHub repo links are automatically formatted on the project cards.
            </p>
          </div>

          <button
            id="btn-close-add-project-modal"
            onClick={() => {
              playSound('pop');
              onClose();
            }}
            className="p-2.5 rounded-full bg-[#18181B] hover:bg-white hover:text-black text-[#A1A1AA] border border-[#27272A] transition-all cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          {isSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>Project published successfully to your portfolio showcase!</span>
            </div>
          )}

          {/* Section: Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                Project Title <span className="text-white">*</span>
              </label>
              <input
                id="input-project-title"
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Apex Cloud Visualizer"
                className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs sm:text-sm transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                Tagline / Subtitle
              </label>
              <input
                id="input-project-tagline"
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Real-time Multi-Region Telemetry Engine"
                className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs sm:text-sm transition-colors"
              />
            </div>
          </div>

          {/* Section: Category Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => {
                    playSound('click');
                    setCategory(cat);
                    setCustomCategory('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                    category === cat && !customCategory
                      ? 'bg-white text-black font-bold shadow-md'
                      : 'bg-[#000000] text-[#A1A1AA] hover:text-white border border-[#1F1F1F] hover:border-[#3F3F46]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Section: Live Link & GitHub Link (MANDATORY & PROMINENT) */}
          <div className="p-4 rounded-2xl bg-[#000000] border border-[#1F1F1F] space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Project URLs (Live Demo & Repository)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                  <span>Live Link URL</span> <span className="text-white">*</span>
                </label>
                <input
                  id="input-project-live-url"
                  type="url"
                  required
                  value={liveUrl}
                  onChange={e => setLiveUrl(e.target.value)}
                  placeholder="https://myproject.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0C0C] border border-[#27272A] focus:border-white focus:outline-none text-white text-xs sm:text-sm font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
                  <Github className="w-3.5 h-3.5 text-white" />
                  <span>GitHub Link URL</span> <span className="text-white">*</span>
                </label>
                <input
                  id="input-project-github-url"
                  type="url"
                  required
                  value={githubUrl}
                  onChange={e => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/thabolanez4/repo"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0C0C0C] border border-[#27272A] focus:border-white focus:outline-none text-white text-xs sm:text-sm font-mono transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section: Short Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Short Description (Displayed on Gallery Card)
            </label>
            <textarea
              id="input-project-short-desc"
              rows={2}
              value={shortDescription}
              onChange={e => setShortDescription(e.target.value)}
              placeholder="High-level overview of the application purpose, tech stack, and user experience..."
              className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs sm:text-sm transition-colors resize-none"
            />
          </div>

          {/* Section: Technologies */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
              Technologies (Comma Separated)
            </label>
            <input
              id="input-project-technologies"
              type="text"
              value={technologies}
              onChange={e => setTechnologies(e.target.value)}
              placeholder="React 19, TypeScript, Supabase, Tailwind CSS, Node.js, WebSockets"
              className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs sm:text-sm transition-colors"
            />
          </div>

          {/* Section: Image Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA] flex items-center gap-1.5">
              <Image className="w-3.5 h-3.5" />
              <span>Cover Image</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_IMAGES.map((preset, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    playSound('click');
                    setImage(preset.url);
                    setCustomImageUrl('');
                  }}
                  className={`relative aspect-video rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                    image === preset.url && !customImageUrl
                      ? 'border-white ring-2 ring-white/50'
                      : 'border-[#1F1F1F] hover:border-[#3F3F46]'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/60 flex items-end p-2">
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider truncate">
                      {preset.name}
                    </span>
                  </div>
                  {image === preset.url && !customImageUrl && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-1">
              <input
                id="input-project-custom-image"
                type="url"
                value={customImageUrl}
                onChange={e => setCustomImageUrl(e.target.value)}
                placeholder="Or paste custom image URL (https://...)"
                className="w-full px-4 py-2 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs font-mono transition-colors"
              />
            </div>
          </div>

          {/* Section: Case Study Narrative */}
          <div className="space-y-4 pt-2 border-t border-[#1F1F1F]">
            <div className="text-xs font-bold uppercase tracking-wider text-white">
              Case Study & Architectural Details (For Inspect Modal)
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                Full Architectural Description
              </label>
              <textarea
                id="input-project-long-desc"
                rows={3}
                value={longDescription}
                onChange={e => setLongDescription(e.target.value)}
                placeholder="Detailed breakdown of system architecture, performance optimizations, and design decisions..."
                className="w-full px-4 py-2.5 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs sm:text-sm transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  The Challenge
                </label>
                <textarea
                  id="input-project-challenge"
                  rows={2}
                  value={challenge}
                  onChange={e => setChallenge(e.target.value)}
                  placeholder="Key technical bottleneck or complexity..."
                  className="w-full px-4 py-2 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs transition-colors resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                  The Solution
                </label>
                <textarea
                  id="input-project-solution"
                  rows={2}
                  value={solution}
                  onChange={e => setSolution(e.target.value)}
                  placeholder="Engineering methodology and architectural patterns applied..."
                  className="w-full px-4 py-2 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs transition-colors resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#A1A1AA]">
                Key Features (One per line)
              </label>
              <textarea
                id="input-project-features"
                rows={3}
                value={featureInputs}
                onChange={e => setFeatureInputs(e.target.value)}
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                className="w-full px-4 py-2 rounded-xl bg-[#000000] border border-[#1F1F1F] focus:border-white focus:outline-none text-white text-xs font-mono transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Duration
                </label>
                <input
                  type="text"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Metric Label
                </label>
                <input
                  type="text"
                  value={metricLabel}
                  onChange={e => setMetricLabel(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">
                  Metric Value
                </label>
                <input
                  type="text"
                  value={metricValue}
                  onChange={e => setMetricValue(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-[#000000] border border-[#1F1F1F] text-white text-xs"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-[#1F1F1F] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                playSound('pop');
                onClose();
              }}
              className="px-5 py-2.5 rounded-full bg-[#18181B] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              id="btn-publish-project"
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-[#A1A1AA] text-black text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(255,255,255,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Publish Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
