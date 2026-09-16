import React from 'react';

interface M1LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  showGlow?: boolean;
}

export const M1Logo: React.FC<M1LogoProps> = ({
  size = 'md',
  className = '',
  showGlow = false
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    hero: 'w-40 h-40'
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}
      id="m1-brand-logo"
    >
      {showGlow && (
        <div className="absolute inset-0 bg-red-600/35 blur-xl rounded-full scale-125 pointer-events-none" />
      )}

      {/* Vector Match of M1 Logo from 5.jpg */}
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain filter drop-shadow-md select-none"
      >
        <defs>
          <linearGradient id="m1RedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3030" />
            <stop offset="100%" stopColor="#E51818" />
          </linearGradient>
          <linearGradient id="m1GreyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6C727A" />
            <stop offset="100%" stopColor="#464A50" />
          </linearGradient>
        </defs>

        {/* Left Shape: Red 'M' Left Wing & Center Leg */}
        <path
          d="M 115 155 
             C 107 155, 100 162, 100 170 
             L 100 338 
             C 100 345, 107 350, 115 350 
             L 165 350 
             C 173 350, 178 344, 178 336 
             L 178 275 
             L 218 340 
             C 223 347, 229 350, 236 350 
             L 272 350 
             C 281 350, 285 341, 278 332 
             L 176 168 
             C 171 160, 163 155, 153 155 
             Z"
          fill="url(#m1RedGrad)"
        />

        {/* Right Shape: Slanted Dark Grey / Slate 'M' Right Wing with Inner Cut */}
        <path
          d="M 235 155 
             C 225 155, 218 162, 218 172 
             L 218 226 
             L 282 328 
             L 282 338 
             C 282 345, 287 350, 294 350 
             L 392 350 
             C 401 350, 405 341, 399 332 
             L 290 168 
             C 285 160, 276 155, 266 155 
             Z"
          fill="url(#m1GreyGrad)"
        />
      </svg>
    </div>
  );
};

