import React from 'react';

interface SkillIconProps {
  id: string;
  className?: string;
}

export const SkillIcon: React.FC<SkillIconProps> = ({ id, className = 'w-5 h-5' }) => {
  switch (id) {
    case 'react':
      return (
        <svg className={className} viewBox="-11.5 -10.23 23 20.46" fill="currentColor">
          <circle cx="0" cy="0" r="2.05" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="1.2" fill="none">
            <ellipse rx="11" ry="4.2" />
            <ellipse rx="11" ry="4.2" transform="rotate(60)" />
            <ellipse rx="11" ry="4.2" transform="rotate(120)" />
          </g>
        </svg>
      );

    case 'nextjs':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#000000" stroke="#FFFFFF" strokeWidth="1.2" />
          <path d="M17.894 17.472L11.654 9.385V17.472H9.8V6.528H11.654L17.894 14.615V6.528H19.748V17.472H17.894Z" fill="#FFFFFF" />
        </svg>
      );

    case 'typescript':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path d="M12.2 8.5H6.5V10.3H8.6V17H10.8V10.3H12.2V8.5Z" fill="#FFFFFF" />
          <path d="M19.2 11.2C18.8 10.7 18 10.3 17 10.3C15.4 10.3 14.5 11.2 14.5 12.4C14.5 15.2 19.4 14 19.4 16.9C19.4 18.6 17.7 19.2 16.1 19.2C14.7 19.2 13.7 18.5 13.2 17.6L14.6 16.5C15 17.1 15.6 17.5 16.3 17.5C17 17.5 17.5 17.1 17.5 16.6C17.5 14.3 12.7 15.2 12.7 12.3C12.7 10.4 14.3 8.8 16.8 8.8C18.1 8.8 19.2 9.3 19.9 10.1L19.2 11.2Z" fill="#FFFFFF" />
        </svg>
      );

    case 'nodejs':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z" fill="#339933" />
          <path d="M12 7.5V16.5M12 7.5L17 10.4M12 7.5L7 10.4M12 16.5L17 13.6M12 16.5L7 13.6" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'expressjs':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#18181B" stroke="#3F3F46" strokeWidth="1.2" />
          <path d="M6 8L10 16M10 8L6 16M14 8H18M14 12H17M14 16H18" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'python':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M11.9 2C8.6 2 6.7 3.5 6.7 5.7V7.5H12V8.4H4.5C2.5 8.4 1 9.9 1 12.8C1 15.7 2.3 16.7 4.5 16.7H6V14.7C6 12.3 7.8 10.5 10.2 10.5H14.7C16.4 10.5 17.8 9.1 17.8 7.4V4.8C17.8 3.1 16.4 2 11.9 2ZM9.5 3.8C10.2 3.8 10.7 4.3 10.7 5C10.7 5.7 10.2 6.2 9.5 6.2C8.8 6.2 8.3 5.7 8.3 5C8.3 4.3 8.8 3.8 9.5 3.8Z" fill="#3776AB" />
          <path d="M12.1 22C15.4 22 17.3 20.5 17.3 18.3V16.5H12V15.6H19.5C21.5 15.6 23 14.1 23 11.2C23 8.3 21.7 7.3 19.5 7.3H18V9.3C18 11.7 16.2 13.5 13.8 13.5H9.3C7.6 13.5 6.2 14.9 6.2 16.6V19.2C6.2 20.9 7.6 22 12.1 22ZM14.5 20.2C13.8 20.2 13.3 19.7 13.3 19C13.3 18.3 13.8 17.8 14.5 17.8C15.2 17.8 15.7 18.3 15.7 19C15.7 19.7 15.2 20.2 14.5 20.2Z" fill="#FFD438" />
        </svg>
      );

    case 'django':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="4" fill="#092E20" stroke="#44B78B" strokeWidth="1" />
          <path d="M13 6H16V14C16 16.5 14.5 18 12 18C10.5 18 9.5 17.3 9 16.5L10.5 15C10.8 15.5 11.3 15.8 12 15.8C13.3 15.8 14 15 14 13.5V11H13C10.8 11 9.5 9.8 9.5 8C9.5 6.2 10.8 5 13 5V6ZM13 7C11.8 7 11.2 7.5 11.2 8.2C11.2 8.9 11.8 9.4 13 9.4V7Z" fill="#FFFFFF" />
        </svg>
      );

    case 'reactnative':
      return (
        <svg className={className} viewBox="-11.5 -10.23 23 20.46" fill="currentColor">
          <rect x="-8" y="-9" width="16" height="18" rx="2.5" fill="#18181B" stroke="#61DAFB" strokeWidth="1" />
          <circle cx="0" cy="0" r="1.8" fill="#61DAFB" />
          <g stroke="#61DAFB" strokeWidth="0.9" fill="none">
            <ellipse rx="8" ry="3" />
            <ellipse rx="8" ry="3" transform="rotate(60)" />
            <ellipse rx="8" ry="3" transform="rotate(120)" />
          </g>
        </svg>
      );

    case 'flutter':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M14.3 2L4 12.3L7.2 15.5L20.7 2H14.3Z" fill="#54C5F8" />
          <path d="M14.3 12.1L8.8 17.6L12 20.8L15.2 17.6L20.7 12.1H14.3Z" fill="#0175C2" />
          <path d="M12 20.8L14.3 23.1L20.7 16.7L17.5 13.5L12 20.8Z" fill="#02569B" />
        </svg>
      );

    case 'dart':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M4.5 4.5L12 3L19.5 4.5L21 12L19.5 19.5L12 21L4.5 19.5L3 12L4.5 4.5Z" fill="#0175C2" stroke="#00B4AB" strokeWidth="1" />
          <path d="M9 7L15 12L9 17V7Z" fill="#FFFFFF" />
        </svg>
      );

    case 'mongodb':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 1.5C11.5 2 7 6.5 7 13C7 17.5 10 20.5 12 22.5C14 20.5 17 17.5 17 13C17 6.5 12.5 2 12 1.5Z" fill="#47A248" />
          <path d="M11.5 19.7C10 18 8.8 15.5 8.8 13C8.8 9 11 5.8 12 4.5V19.7H11.5Z" fill="#13AA52" />
        </svg>
      );

    case 'postgresql':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM17 11C17 13.2 15.2 15 13 15H11V18H9V6H13C15.2 6 17 7.8 17 10V11Z" fill="#336791" />
          <path d="M11 8H13C14.1 8 15 8.9 15 10C15 11.1 14.1 12 13 12H11V8Z" fill="#FFFFFF" />
        </svg>
      );

    case 'git':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M21.6 10.4L13.6 2.4C13.1 1.9 12.3 1.9 11.8 2.4L9.9 4.3L12.3 6.7C12.8 6.5 13.5 6.6 13.9 7.1C14.4 7.6 14.5 8.3 14.3 8.8L16.6 11.1C17.1 10.9 17.8 11 18.3 11.5C19 12.2 19 13.3 18.3 14C17.6 14.7 16.5 14.7 15.8 14C15.3 13.5 15.2 12.8 15.4 12.3L13.2 10.1V15.7C13.4 15.9 13.5 16.2 13.5 16.5C13.5 17.6 12.6 18.5 11.5 18.5C10.4 18.5 9.5 17.6 9.5 16.5C9.5 15.6 10.1 14.9 10.9 14.6V9.2C10.1 8.9 9.5 8.2 9.5 7.3C9.5 6.9 9.6 6.6 9.8 6.3L7.4 3.9L2.4 8.9C1.9 9.4 1.9 10.2 2.4 10.7L10.4 18.7C10.9 19.2 11.7 19.2 12.2 18.7L21.6 9.3C22.1 8.8 22.1 8 21.6 7.5V10.4Z" fill="#F05032" />
        </svg>
      );

    case 'devops':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M22 13C21.7 11.8 20.8 11.1 19.8 11.1H18.9C18.6 9.5 17.5 8.1 15.9 7.5L16.6 6.2C16.9 5.7 16.7 5.1 16.2 4.8C15.7 4.5 15.1 4.7 14.8 5.2L13.9 6.8C13.4 6.7 12.7 6.7 12.2 6.8V4.5C12.2 3.9 11.8 3.5 11.2 3.5H9.2C8.7 3.5 8.2 3.9 8.2 4.5V6.7C7.7 6.7 7.2 6.8 6.7 7L6.2 5.5C6 5 5.4 4.8 4.9 5C4.4 5.2 4.2 5.8 4.4 6.3L5 7.8C3.8 8.6 2.9 9.8 2.5 11.3C2 12 1.8 12.8 1.8 13.7C1.8 17.2 4.6 20 8.1 20H15.9C19.4 20 22.2 17.2 22.2 13.7C22.2 13.5 22.1 13.2 22 13Z" fill="#2496ED" />
          <rect x="7" y="12" width="2" height="2" rx="0.5" fill="#FFFFFF" />
          <rect x="10" y="12" width="2" height="2" rx="0.5" fill="#FFFFFF" />
          <rect x="13" y="12" width="2" height="2" rx="0.5" fill="#FFFFFF" />
          <rect x="10" y="9" width="2" height="2" rx="0.5" fill="#FFFFFF" />
        </svg>
      );

    default:
      return (
        <div className="w-5 h-5 rounded bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[10px] font-bold text-white">
          {id.slice(0, 2).toUpperCase()}
        </div>
      );
  }
};
