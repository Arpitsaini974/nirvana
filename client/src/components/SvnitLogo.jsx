import React from 'react';

/**
 * SVNIT Architectural building icon for footer
 */
export default function SvnitLogo({ className = "w-8 h-8", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Central Dome / Tower */}
      <path d="M43 28 L50 16 L57 28 Z" />
      <path d="M46 28 L46 34 L54 34 L54 28" />
      
      {/* Left & Right Turrets */}
      <path d="M22 28 L28 20 L34 28 Z" />
      <path d="M66 28 L72 20 L78 28 Z" />

      {/* Roof Pediment / Cornice */}
      <path d="M16 34 L84 34" />
      <path d="M18 38 L82 38" />

      {/* Main Building Body */}
      <path d="M20 38 L20 70 L80 70 L80 38" />

      {/* Central Arch Entrance */}
      <path d="M44 70 L44 54 C44 50 56 50 56 54 L56 70" />

      {/* Windows Left Side */}
      <rect x="25" y="44" width="6" height="8" rx="1" />
      <rect x="34" y="44" width="6" height="8" rx="1" />
      <rect x="25" y="56" width="6" height="8" rx="1" />
      <rect x="34" y="56" width="6" height="8" rx="1" />

      {/* Windows Right Side */}
      <rect x="60" y="44" width="6" height="8" rx="1" />
      <rect x="69" y="44" width="6" height="8" rx="1" />
      <rect x="60" y="56" width="6" height="8" rx="1" />
      <rect x="69" y="56" width="6" height="8" rx="1" />

      {/* Foundation Line */}
      <path d="M12 70 L88 70" />
      <path d="M10 74 L90 74" />
    </svg>
  );
}
