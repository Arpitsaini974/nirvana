import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, ShieldCheck, Lock } from 'lucide-react';
import LotusLogo from './LotusLogo';

export default function Navbar() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Team', path: '/team' },
    { name: 'Alumni', path: '/alumni' },
    { name: 'About', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#E8DFD3] shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Title matching design */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <img
              src="/images/nirvana/nirvana_logo.png"
              alt="NIRVANA Logo"
              className="w-11 h-11 object-contain shrink-0 rounded-lg drop-shadow-xs"
            />
            <div className="flex flex-col text-left">
              <span className="font-serif font-bold text-2xl tracking-tight text-[#2B231D] leading-none">
                NIRVANA
              </span>
              <span className="text-[9px] font-semibold tracking-[0.2em] text-[#857467] uppercase mt-1 leading-none">
                LEARN &bull; EXPLORE &bull; GROW
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-sm font-medium transition-colors py-1.5 ${
                    active
                      ? 'text-[#B45309] font-semibold border-b-2 border-[#B45309]'
                      : 'text-[#574A40] hover:text-[#B45309]'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

            {/* Admin console entry only if already authenticated */}
            {isAuthenticated && (
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2B231D] hover:bg-[#3E322A] text-[#FAF7F2] text-xs font-medium transition-colors ml-2"
                title="Admin Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-[#574A40] hover:text-[#2B231D] hover:bg-[#F3EDE4] focus:outline-none"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#E8DFD3] bg-[#FFFDF9] px-4 pt-3 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium ${
                  active
                    ? 'text-[#B45309] bg-[#F7F2EA] font-semibold'
                    : 'text-[#574A40] hover:text-[#B45309] hover:bg-[#FAF7F2]'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          {isAuthenticated && (
            <Link
              to="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block mt-2 px-3 py-2 rounded-md bg-[#2B231D] text-[#FAF7F2] text-sm font-semibold text-center"
            >
              Admin Console
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
