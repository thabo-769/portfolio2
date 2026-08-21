import React from 'react';

interface TechItem {
  name: string;
  category: string;
  badgeBg?: string;
  icon: React.ReactNode;
}

const technologies: TechItem[] = [
  {
    name: 'React 19',
    category: 'UI Library',
    badgeBg: 'bg-[#61DAFB]/10 border-[#61DAFB]/30',
    icon: (
      <svg className="w-5 h-5 text-[#61DAFB]" viewBox="-11.5 -10.23 23 20.46" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
        <g stroke="#61DAFB" strokeWidth="1.2" fill="none">
          <ellipse rx="11" ry="4.2" />
          <ellipse rx="11" ry="4.2" transform="rotate(60)" />
          <ellipse rx="11" ry="4.2" transform="rotate(120)" />
        </g>
      </svg>
    ),
  },
  {
    name: 'TypeScript',
    category: 'Strict Typing',
    badgeBg: 'bg-[#3178C6]/10 border-[#3178C6]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#3178C6" />
        <path d="M12.2 8.5H6.5V10.3H8.6V17H10.8V10.3H12.2V8.5Z" fill="#FFFFFF" />
        <path d="M19.2 11.2C18.8 10.7 18 10.3 17 10.3C15.4 10.3 14.5 11.2 14.5 12.4C14.5 15.2 19.4 14 19.4 16.9C19.4 18.6 17.7 19.2 16.1 19.2C14.7 19.2 13.7 18.5 13.2 17.6L14.6 16.5C15 17.1 15.6 17.5 16.3 17.5C17 17.5 17.5 17.1 17.5 16.6C17.5 14.3 12.7 15.2 12.7 12.3C12.7 10.4 14.3 8.8 16.8 8.8C18.1 8.8 19.2 9.3 19.9 10.1L19.2 11.2Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: 'JavaScript',
    category: 'ES6+ Engine',
    badgeBg: 'bg-[#F7DF1E]/10 border-[#F7DF1E]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#F7DF1E" />
        <path d="M7.2 16.5C7.7 17.3 8.5 17.8 9.7 17.8C10.9 17.8 11.7 17.1 11.7 15.8V9H9.7V15.7C9.7 16.2 9.4 16.4 8.9 16.4C8.4 16.4 7.9 16.1 7.7 15.6L7.2 16.5Z" fill="#000000" />
        <path d="M14.2 16.2C14.7 17.2 15.8 17.8 17 17.8C18.4 17.8 19.5 17 19.5 15.6C19.5 14.3 18.6 13.7 17.1 13.1C15.9 12.6 15.2 12.2 15.2 11.4C15.2 10.7 15.8 10.2 16.7 10.2C17.5 10.2 18.2 10.6 18.6 11.3L19.4 10.3C18.8 9.5 17.8 9 16.7 9C15.3 9 14.2 9.8 14.2 11.3C14.2 12.6 15 13.2 16.5 13.8C17.7 14.3 18.5 14.7 18.5 15.6C18.5 16.4 17.8 16.9 16.9 16.9C15.8 16.9 15 16.2 14.6 15.2L14.2 16.2Z" fill="#000000" />
      </svg>
    ),
  },
  {
    name: 'Python',
    category: 'AI & Data Backend',
    badgeBg: 'bg-[#3776AB]/10 border-[#3776AB]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.9 2C8.6 2 6.7 3.5 6.7 5.7V7.5H12V8.4H4.5C2.5 8.4 1 9.9 1 12.8C1 15.7 2.3 16.7 4.5 16.7H6V14.7C6 12.3 7.8 10.5 10.2 10.5H14.7C16.4 10.5 17.8 9.1 17.8 7.4V4.8C17.8 3.1 16.4 2 11.9 2ZM9.5 3.8C10.2 3.8 10.7 4.3 10.7 5C10.7 5.7 10.2 6.2 9.5 6.2C8.8 6.2 8.3 5.7 8.3 5C8.3 4.3 8.8 3.8 9.5 3.8Z" fill="#3776AB" />
        <path d="M12.1 22C15.4 22 17.3 20.5 17.3 18.3V16.5H12V15.6H19.5C21.5 15.6 23 14.1 23 11.2C23 8.3 21.7 7.3 19.5 7.3H18V9.3C18 11.7 16.2 13.5 13.8 13.5H9.3C7.6 13.5 6.2 14.9 6.2 16.6V19.2C6.2 20.9 7.6 22 12.1 22ZM14.5 20.2C13.8 20.2 13.3 19.7 13.3 19C13.3 18.3 13.8 17.8 14.5 17.8C15.2 17.8 15.7 18.3 15.7 19C15.7 19.7 15.2 20.2 14.5 20.2Z" fill="#FFD438" />
      </svg>
    ),
  },
  {
    name: 'Node.js',
    category: 'Backend Runtime',
    badgeBg: 'bg-[#5FA04E]/10 border-[#5FA04E]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z" fill="#339933" />
        <path d="M12 7.5V16.5M12 7.5L17 10.4M12 7.5L7 10.4M12 16.5L17 13.6M12 16.5L7 13.6" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    name: 'Next.js 15',
    category: 'Full-Stack Framework',
    badgeBg: 'bg-white/10 border-white/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="12" fill="#000000" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M17.894 17.472L11.654 9.385V17.472H9.8V6.528H11.654L17.894 14.615V6.528H19.748V17.472H17.894Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: 'React Native',
    category: 'Mobile Platform',
    badgeBg: 'bg-[#61DAFB]/10 border-[#61DAFB]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="3" fill="#132E35" stroke="#61DAFB" strokeWidth="1.5" />
        <circle cx="12" cy="18" r="1" fill="#61DAFB" />
        <circle cx="12" cy="9.5" r="1.5" fill="#61DAFB" />
        <ellipse cx="12" cy="9.5" rx="4" ry="1.6" stroke="#61DAFB" strokeWidth="0.9" transform="rotate(-30 12 9.5)" />
        <ellipse cx="12" cy="9.5" rx="4" ry="1.6" stroke="#61DAFB" strokeWidth="0.9" transform="rotate(30 12 9.5)" />
      </svg>
    ),
  },
  {
    name: 'Flutter',
    category: 'Cross-Platform App',
    badgeBg: 'bg-[#02569B]/10 border-[#54C5F8]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.3 2L4 12.3L7.2 15.5L20.7 2H14.3Z" fill="#54C5F8" />
        <path d="M14.3 12.1L8.8 17.6L12 20.8L15.2 17.6L20.7 12.1H14.3Z" fill="#0175C2" />
        <path d="M12 20.8L14.3 23.1L20.7 16.7L17.5 13.5L12 20.8Z" fill="#02569B" />
      </svg>
    ),
  },
  {
    name: 'PostgreSQL',
    category: 'Relational Database',
    badgeBg: 'bg-[#336791]/10 border-[#336791]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="4" fill="#336791" />
        <path d="M12 4C8.5 4 6.5 6 6.5 8.5C6.5 11.5 8.8 13.5 8.8 16C8.8 17.5 7.8 18.5 6.5 18.5V19.5C9.5 19.5 11.8 18 11.8 15.5C11.8 13 9.8 11.5 9.8 9.5C9.8 7.5 11 6.5 12.5 6.5C14 6.5 15.2 7.5 15.2 9.5C15.2 11.5 13.2 13 13.2 15.5C13.2 18 15.5 19.5 18.5 19.5V18.5C17.2 18.5 16.2 17.5 16.2 16C16.2 13.5 18.5 11.5 18.5 8.5C18.5 6 16.5 4 12 4Z" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    name: 'MongoDB',
    category: 'Document Database',
    badgeBg: 'bg-[#47A248]/10 border-[#47A248]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 1.5C11.5 2 7 6.5 7 13C7 17.5 10 20.5 12 22.5C14 20.5 17 17.5 17 13C17 6.5 12.5 2 12 1.5Z" fill="#47A248" />
        <path d="M11.5 19.7C10 18 8.8 15.5 8.8 13C8.8 9 11 5.8 12 4.5V19.7H11.5Z" fill="#13AA52" />
        <path d="M12 4.5V22.5C12 22.5 12.3 22.3 12.5 22C12.5 22 12.1 19 12 4.5Z" fill="#FFFFFF" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: 'Three.js & WebGL',
    category: 'Interactive 3D Graphics',
    badgeBg: 'bg-[#049EF4]/10 border-[#049EF4]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7.5L12 13L22 7.5L12 2Z" fill="#049EF4" />
        <path d="M2 12L12 17.5L22 12L20 10.9L12 15.3L4 10.9L2 12Z" fill="#61DAFB" />
        <path d="M2 16.5L12 22L22 16.5L20 15.4L12 19.8L4 15.4L2 16.5Z" fill="#0077B6" />
      </svg>
    ),
  },
  {
    name: 'Tailwind CSS',
    category: 'Modern Styling',
    badgeBg: 'bg-[#06B6D4]/10 border-[#06B6D4]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6C9.333 6 7.667 7.333 7 10C8 8.667 9.167 8.167 10.5 8.5C11.5 8.75 12.214 9.476 13 10.276C14.279 11.579 15.772 13.1 19 13.1C21.667 13.1 23.333 11.767 24 9.1C23 10.433 21.833 10.933 20.5 10.6C19.5 10.35 18.786 9.624 18 8.824C16.721 7.521 15.228 6 12 6ZM5 13C2.333 13 0.667 14.333 0 17C1 15.667 2.167 15.167 3.5 15.5C4.5 15.75 5.214 16.476 6 17.276C7.279 18.579 8.772 20.1 12 20.1C14.667 20.1 16.333 18.767 17 16.1C16 17.433 14.833 17.933 13.5 17.6C12.5 17.35 11.786 16.624 11 15.824C9.721 14.521 8.228 13 5 13Z" fill="#06B6D4" />
      </svg>
    ),
  },
  {
    name: 'Supabase',
    category: 'Backend & Realtime',
    badgeBg: 'bg-[#3ECF8E]/10 border-[#3ECF8E]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.9 21.8C12.4 22.3 11.6 22 11.6 21.3V13.8H3.2C2.4 13.8 2 12.8 2.6 12.2L11.1 2.2C11.6 1.7 12.4 2 12.4 2.7V10.2H20.8C21.6 10.2 22 11.2 21.4 11.8L12.9 21.8Z" fill="#3ECF8E" />
      </svg>
    ),
  },
  {
    name: 'Docker',
    category: 'Containerization',
    badgeBg: 'bg-[#2496ED]/10 border-[#2496ED]/30',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.5 11.5C22 10.7 21 10.2 20 10.2H18.7C18.4 9 17.6 8 16.6 7.4L15.3 8.7C15.8 9.1 16.2 9.6 16.5 10.2H12V8.2H14.2V6.2H12V4.2H10V6.2H7.8V8.2H10V10.2H1.5C1 10.2 0.5 10.6 0.2 11.2C-0.2 12.2 0 13.5 0.5 14.5C2 17.5 5.5 19.5 9 19.5C15 19.5 19.5 16 21 12.5C21.8 12.5 22.3 12.1 22.5 11.5Z" fill="#2496ED" />
      </svg>
    ),
  }
];

export const PrimaryTechStrip: React.FC = () => {
  return (
    <div
      id="hero-tech-ticker"
      className="w-full relative overflow-hidden py-4 border-y border-[#1F1F1F] bg-[#0C0C0C]/90 backdrop-blur-md select-none"
      aria-label="Continuous technology logo marquee"
    >
      {/* Edge Gradient Mask for Seamless Fading matching #000000 */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#000000] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#000000] to-transparent z-10 pointer-events-none" />

      {/* Infinite Seamless Left-To-Right Marquee Loop */}
      <div className="animate-marquee-ltr flex items-center space-x-8 sm:space-x-12">
        {/* Set 1 */}
        {technologies.map((tech, idx) => (
          <div
            key={`tech-1-${idx}`}
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-[#000000]/80 border border-[#1F1F1F] hover:border-[#3F3F46] transition-all duration-300 cursor-default select-none shrink-0 group hover:scale-105 shadow-sm"
          >
            {/* Color Visible Brand Logo with High Contrast */}
            <div className="shrink-0 p-1 rounded-lg bg-[#000000] border border-[#27272A] shadow-inner group-hover:scale-110 transition-transform">
              {tech.icon}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold uppercase tracking-wider font-sans leading-none text-white group-hover:text-white transition-colors">
                {tech.name}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#A1A1AA] font-medium leading-none mt-1 group-hover:text-white transition-colors">
                {tech.category}
              </span>
            </div>
          </div>
        ))}

        {/* Set 2 (Duplicate for Seamless Loop) */}
        {technologies.map((tech, idx) => (
          <div
            key={`tech-2-${idx}`}
            className="flex items-center space-x-3 px-3.5 py-2 rounded-xl bg-[#000000]/80 border border-[#1F1F1F] hover:border-[#3F3F46] transition-all duration-300 cursor-default select-none shrink-0 group hover:scale-105 shadow-sm"
          >
            {/* Color Visible Brand Logo with High Contrast */}
            <div className="shrink-0 p-1 rounded-lg bg-[#000000] border border-[#27272A] shadow-inner group-hover:scale-110 transition-transform">
              {tech.icon}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-xs font-bold uppercase tracking-wider font-sans leading-none text-white group-hover:text-white transition-colors">
                {tech.name}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-[#A1A1AA] font-medium leading-none mt-1 group-hover:text-white transition-colors">
                {tech.category}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
