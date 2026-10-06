import React from 'react';
import { Link } from 'react-router-dom';
import LotusLogo from './LotusLogo';
import SvnitLogo from './SvnitLogo';

export default function Footer() {
  return (
    <footer className="bg-[#1F1914] text-[#FAF7F2] border-t border-[#382C24]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
          
          {/* Left: NIRVANA Club Brand */}
          <div className="flex items-center gap-3">
            <img
              src="/images/nirvana/nirvana_logo.png"
              alt="NIRVANA Logo"
              className="w-11 h-11 object-contain shrink-0 rounded-lg bg-[#FAF7F2] p-1 shadow-xs"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-xl tracking-wider text-[#FAF7F2] leading-none">
                NIRVANA
              </span>
              <span className="text-[9px] font-medium tracking-[0.2em] text-[#C4B5A5] uppercase mt-1 leading-none">
                LEARN &bull; EXPLORE &bull; GROW
              </span>
            </div>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm text-[#D8CCC0] font-medium border-y md:border-y-0 md:border-x border-[#382C24] py-3 md:py-0 px-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-[#5C4A3E]">|</span>
            <Link to="/team" className="hover:text-white transition-colors">Team</Link>
            <span className="text-[#5C4A3E]">|</span>
            <Link to="/alumni" className="hover:text-white transition-colors">Alumni</Link>
            <span className="text-[#5C4A3E]">|</span>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>

          {/* Right: SVNIT Institutional Identity */}
          <div className="flex items-center gap-3">
            <SvnitLogo className="w-10 h-10 text-[#FAF7F2] shrink-0" color="#FAF7F2" />
            <div className="flex flex-col text-left">
              <span className="font-bold text-base tracking-wide text-[#FAF7F2] leading-none">
                SVNIT
              </span>
              <span className="text-[10px] text-[#A8998C] mt-1 leading-none">
                Building a better tomorrow
              </span>
            </div>
          </div>

        </div>

        {/* Discreet Sub-footer with Copyright & Admin Portal Link */}
        <div className="mt-6 pt-4 border-t border-[#2E241D] flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8C7D70] gap-2">
          <span>&copy; {new Date().getFullYear()} NIRVANA Student Society, SVNIT Surat. All rights reserved.</span>
          <Link
            to="/admin/login"
            className="hover:text-[#FAF7F2] transition-colors inline-flex items-center gap-1 opacity-75 hover:opacity-100 text-[10px] tracking-wide"
            title="Officer & Administrator Access"
          >
            <span>Executive Portal</span>
            <span>&bull;</span>
            <span>Login &rarr;</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
