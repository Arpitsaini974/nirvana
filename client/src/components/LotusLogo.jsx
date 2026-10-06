import React from 'react';

/**
 * Clean SVG lotus flower logo matching the NIRVANA emblem in the design
 */
export default function LotusLogo({ className = "w-8 h-8", color = "currentColor" }) {
  return (
    <svg
      viewBox="0 0 100 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Central Petal */}
      <path d="M50 8 C43 25 43 55 50 64 C57 55 57 25 50 8 Z" />
      
      {/* Left Inner Petal */}
      <path d="M47 22 C32 30 28 52 45 64 C40 50 42 34 47 22 Z" />
      
      {/* Right Inner Petal */}
      <path d="M53 22 C68 30 72 52 55 64 C60 50 58 34 53 22 Z" />
      
      {/* Left Outer Petal */}
      <path d="M37 38 C18 44 14 62 38 67 C28 58 30 46 37 38 Z" />
      
      {/* Right Outer Petal */}
      <path d="M63 38 C82 44 86 62 62 67 C72 58 70 46 63 38 Z" />
      
      {/* Base curves */}
      <path d="M22 66 C35 74 65 74 78 66" />
      <path d="M32 70 C42 75 58 75 68 70" />
    </svg>
  );
}
