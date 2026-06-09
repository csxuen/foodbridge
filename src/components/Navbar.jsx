import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, role, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'How It Works', href: '/#how-it-works' },
    { name: 'Community Impact', href: '/#community-impact' },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100, x: '-50%' }}
        animate={{ 
          y: 0, 
          x: '-50%',
          scale: scrolled ? 0.96 : 1,
          boxShadow: scrolled 
            ? '0 20px 40px -10px rgba(26,92,56,0.15)' 
            : '0 10px 30px -10px rgba(0,0,0,0.1)'
        }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
        className="fixed top-5 left-1/2 z-50 w-[90%] max-w-5xl bg-white/60 backdrop-blur-xl border border-white/40 rounded-full px-6 py-3 flex items-center justify-between"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-forest rounded-full flex items-center justify-center shadow-glow">
            <span className="text-parchment font-heading italic text-xl leading-none pt-1 pr-0.5">F</span>
          </div>
          <span className="font-heading italic text-2xl tracking-tight text-forest pt-1">FoodBridge</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = link.href === '/' 
              ? location.pathname === '/' && !location.hash 
              : location.pathname === link.href.split('#')[0] && location.hash === ('#' + link.href.split('#')[1]);

            return (
              <a 
                key={link.name} 
                href={link.href}
                onClick={(e) => {
                  if (link.href.startsWith('/#') && location.pathname === '/') {
                    const id = link.href.substring(2);
                    const el = document.getElementById(id);
                    if (el) {
                      e.preventDefault();
                      el.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', link.href);
                    }
                  } else if (link.href === '/' && location.pathname === '/') {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    window.history.pushState(null, '', '/');
                  }
                }}
                className="relative text-sm font-medium text-forest hover:opacity-70 transition-opacity"
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="navDot"
                    className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-forest rounded-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link to={role === 'donor' ? '/donor' : role === 'receiver' ? '/receiver' : '/admin'} className="bg-forest hover:bg-[#111913] text-parchment text-sm font-medium px-6 py-2.5 rounded-full shadow-glow transition-all hover:scale-[1.03] active:scale-95">
                Dashboard
              </Link>
              <button onClick={logout} className="text-sm font-medium text-forest hover:text-red-600 transition-colors px-3 py-2">
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-forest hover:opacity-70 transition-opacity px-3 py-2">
                Log In
              </Link>
              <Link to="/register" className="bg-forest hover:bg-[#111913] text-parchment text-sm font-medium px-6 py-2.5 rounded-full shadow-glow transition-all hover:scale-[1.03] active:scale-95">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="md:hidden text-forest p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6" />}
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-24 left-1/2 w-[90%] max-w-md z-40 bg-surface/90 backdrop-blur-xl border border-white/40 rounded-[24px] shadow-xl overflow-hidden p-6 flex flex-col gap-4 md:hidden"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                className="text-lg font-medium text-forest py-2 border-b border-gray-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="flex flex-col gap-3 mt-4">
              {user ? (
                <>
                  <Link to={role === 'donor' ? '/donor' : role === 'receiver' ? '/receiver' : '/admin'} className="text-center font-medium text-parchment bg-forest py-3 rounded-full shadow-glow" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-center font-medium text-red-600 py-3 border-[1.5px] border-red-600 rounded-full hover:bg-red-50 transition-colors">
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-center font-medium text-forest py-3 border-[1.5px] border-forest rounded-full hover:bg-forest hover:text-parchment transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Log In
                  </Link>
                  <Link to="/register" className="text-center font-medium text-parchment bg-forest py-3 rounded-full shadow-glow" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
