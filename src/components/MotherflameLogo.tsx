import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export const MotherflameLogo: React.FC<LogoProps> = ({
  size = 40,
  className = '',
  showText = false,
  textClassName = '',
}) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Hexagonal Motherflame Vector Badge */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          {/* Inner Dark Background */}
          <radialGradient id="hexBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Flame Gradients */}
          {/* Cyan/Blue outer flame */}
          <linearGradient id="blueFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" /> {/* blue-600 */}
            <stop offset="50%" stopColor="#3b82f6" /> {/* blue-500 */}
            <stop offset="100%" stopColor="#06b6d4" /> {/* cyan-500 */}
          </linearGradient>

          {/* Orange/Yellow inner flame */}
          <linearGradient id="orangeFlameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" /> {/* orange-600 */}
            <stop offset="50%" stopColor="#f97316" /> {/* orange-500 */}
            <stop offset="100%" stopColor="#facc15" /> {/* yellow-400 */}
          </linearGradient>

          {/* White core */}
          <linearGradient id="whiteCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          {/* Outer Ring Glow Effects */}
          <linearGradient id="outerRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" />
            <stop offset="30%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#475569" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shadow / Glow (Motherflame themed) */}
        <polygon
          points="50,4 90,27 90,73 50,96 10,73 10,27"
          fill="none"
          stroke="var(--brand-primary, #f97316)"
          strokeWidth="3"
          opacity="0.15"
          filter="url(#glow)"
        />

        {/* Outer Hexagon Border with Tech Accents */}
        <polygon
          points="50,6 88,28 88,72 50,94 12,72 12,28"
          fill="url(#hexBg)"
          stroke="url(#outerRingGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Tech Corner Insets & Lines */}
        <polygon
          points="50,11 84,31 84,69 50,89 16,69 16,31"
          fill="none"
          stroke="#475569"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Small Tech Details & Accents */}
        {/* S-108 Label area (top right) */}
        <path d="M 68 18 L 74 21" stroke="#facc15" strokeWidth="1.5" />
        {/* VP Label area (left side) */}
        <path d="M 14 42 L 14 58" stroke="#06b6d4" strokeWidth="1.5" />

        {/* Inner Circle Base */}
        <circle cx="50" cy="50" r="28" fill="#0b0f19" stroke="#334155" strokeWidth="1.5" />

        {/* --- SWIRLING FLAMES --- */}
        {/* Flame Background Glow */}
        <circle cx="50" cy="50" r="18" fill="var(--brand-primary, #f97316)" opacity="0.1" filter="url(#glow)" />

        {/* 1. Outer Swirling Blue/Cyan Flame */}
        <path
          d="M 36 62 
             C 28 50, 32 34, 46 30 
             C 50 28, 55 31, 58 35
             C 52 38, 48 44, 48 50
             C 48 58, 55 64, 62 60
             C 68 56, 70 46, 64 38
             C 68 46, 68 56, 60 64
             C 54 70, 42 68, 36 62 Z"
          fill="url(#blueFlameGrad)"
          opacity="0.9"
        />

        {/* 2. Inner Swirling Orange/Yellow Flame */}
        <path
          d="M 40 58
             C 35 48, 40 38, 48 35
             C 52 33, 56 36, 58 40
             C 54 41, 52 45, 52 49
             C 52 54, 56 58, 60 56
             C 64 54, 65 48, 62 44
             C 64 48, 64 54, 58 58
             C 54 62, 44 62, 40 58 Z"
          fill="url(#orangeFlameGrad)"
          opacity="0.95"
        />

        {/* 3. Bright White Hot Flame Core */}
        <path
          d="M 44 54
             C 41 48, 44 42, 49 40
             C 51 39, 53 41, 54 43
             C 52 44, 51 46, 51 48
             C 51 51, 53 53, 55 52
             C 57 51, 58 48, 56 46
             C 57 48, 57 51, 53 53
             C 51 55, 46 55, 44 54 Z"
          fill="url(#whiteCoreGrad)"
        />
      </svg>

      {/* Optional typography branding */}
      {showText && (
        <div className="flex flex-col">
          <span className={`text-xl font-extrabold tracking-tight leading-none uppercase ${textClassName}`}>
            Mother<span className="text-slate-800 dark:text-slate-200 font-bold normal-case">flame</span>
          </span>
          <span className="text-[7.5px] font-bold font-mono tracking-widest text-slate-400 uppercase mt-0.5 whitespace-nowrap">
            The Undying Energy Source
          </span>
        </div>
      )}
    </div>
  );
};
