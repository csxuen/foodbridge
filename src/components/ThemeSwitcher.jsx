import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, Check } from 'lucide-react';
import clsx from 'clsx';

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState('green'); // 'green', 'orange', 'blue'

  const themes = [
    { id: 'green', name: 'Emerald (Default)', class: '', color: '#16a34a' },
    { id: 'orange', name: 'Vibrant Orange', class: 'theme-orange', color: '#f97316' },
    { id: 'blue', name: 'Ocean Blue', class: 'theme-blue', color: '#0ea5e9' },
  ];

  useEffect(() => {
    // Read from local storage if exists
    const saved = localStorage.getItem('foodbridge-theme');
    if (saved) {
      applyTheme(saved);
    }
  }, []);

  const applyTheme = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem('foodbridge-theme', themeId);
    
    // Remove old theme classes
    document.documentElement.classList.remove('theme-orange', 'theme-blue');
    
    // Add new theme class if not default
    const selected = themes.find(t => t.id === themeId);
    if (selected && selected.class) {
      document.documentElement.classList.add(selected.class);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 flex items-center justify-center text-gray-700 hover:text-primary transition-colors hover:scale-110 active:scale-95"
      >
        <Palette className="w-5 h-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed bottom-24 right-6 z-50 bg-white rounded-2xl p-5 shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-gray-100 w-64"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">Choose Theme</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
              </div>
              <div className="space-y-3">
                {themes.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={clsx(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all",
                      activeTheme === t.id ? "border-primary bg-primary/5" : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: t.color }}></div>
                      <span className={clsx("text-sm font-semibold", activeTheme === t.id ? "text-primary-dark" : "text-gray-700")}>{t.name}</span>
                    </div>
                    {activeTheme === t.id && <Check className="w-4 h-4 text-primary" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
