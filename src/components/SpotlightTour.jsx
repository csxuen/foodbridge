import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';

const tourSteps = [
  {
    id: 'tour-sidebar-nav',
    title: 'Sidebar Navigation',
    description: 'Your navigation hub. Use this to jump between your overview dashboard, browse food listings, and check rewards.'
  },
  {
    id: 'tour-trust-score',
    title: 'Trust Score Card',
    description: 'Your reputation score. Keep it high (above 70) to maintain good standing and priority access in the community.'
  },
  {
    id: 'tour-main-cta',
    title: 'Main Action Button',
    description: 'Ready to get started? Use this button to immediately list a donation or find food nearby.'
  },
  {
    id: 'tour-stat-cards',
    title: 'Top Stat Cards',
    description: 'Track your impact! View your completed listings, active bookings, rank standing, and trust history in one glance.'
  }
];

export default function SpotlightTour({ active, onClose }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const currentStepData = tourSteps[step];

  useEffect(() => {
    if (!active) return;

    const updateRect = () => {
      const el = document.getElementById(currentStepData.id);
      if (el) {
        setRect(el.getBoundingClientRect());
      } else {
        // If element is not rendered yet, retry in 100ms
        const t = setTimeout(() => {
          const elRetry = document.getElementById(currentStepData.id);
          if (elRetry) setRect(elRetry.getBoundingClientRect());
        }, 100);
        return () => clearTimeout(t);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    // Also monitor scrolling
    window.addEventListener('scroll', updateRect, true);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [step, active]);

  if (!active) return null;

  const nextStep = () => {
    if (step < tourSteps.length - 1) {
      setStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setStep(prev => prev - 1);
    }
  };

  // Calculate tooltip coordinates relative to spotlight
  let tooltipStyle = {
    position: 'fixed',
    zIndex: 10000,
    width: '320px',
  };

  if (rect) {
    const fitsBelow = rect.bottom + 220 < window.innerHeight;
    const fitsRight = rect.right + 340 < window.innerWidth;
    
    if (fitsBelow) {
      tooltipStyle.top = rect.bottom + 16;
      tooltipStyle.left = Math.max(16, Math.min(window.innerWidth - 336, rect.left + rect.width / 2 - 160));
    } else if (fitsRight) {
      tooltipStyle.top = rect.top;
      tooltipStyle.left = rect.right + 16;
    } else {
      tooltipStyle.bottom = window.innerHeight - rect.top + 16;
      tooltipStyle.left = Math.max(16, Math.min(window.innerWidth - 336, rect.left + rect.width / 2 - 160));
    }
  } else {
    // Fallback to screen center
    tooltipStyle.top = '50%';
    tooltipStyle.left = '50%';
    tooltipStyle.transform = 'translate(-50%, -50%)';
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Background Dimming Overlay */}
      <div 
        className="absolute inset-0 bg-[#0f1f13]/30 pointer-events-auto"
        style={{ backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Spotlight cutout */}
      <AnimatePresence>
        {rect && (
          <motion.div
            initial={{
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              opacity: 0
            }}
            animate={{
              left: rect.left - 8,
              top: rect.top - 8,
              width: rect.width + 16,
              height: rect.height + 16,
              opacity: 1
            }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            style={{
              position: 'fixed',
              boxShadow: '0 0 0 9999px rgba(15, 31, 19, 0.75)',
              borderRadius: '16px',
              zIndex: 9999,
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      {/* Tooltip Content Card */}
      <div style={tooltipStyle} className="pointer-events-auto">
        <motion.div
          key={step}
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl p-5 border border-gray-100 flex flex-col relative"
        >
          {/* Arrow Pointer */}
          {rect && (
            <div 
              className="absolute w-3 h-3 bg-white rotate-45 border-l border-t border-gray-100"
              style={{
                top: rect.bottom + 220 < window.innerHeight ? '-6px' : 'auto',
                bottom: rect.bottom + 220 >= window.innerHeight ? '-6px' : 'auto',
                left: 'calc(50% - 6px)',
              }}
            />
          )}

          {/* Header */}
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-bold text-primary bg-primary-tint px-2.5 py-1 rounded-full uppercase tracking-wider">
              Step {step + 1} of {tourSteps.length}
            </span>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-50 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Title */}
          <h4 className="font-heading font-black text-xl text-textDark mb-1.5">
            {currentStepData.title}
          </h4>

          {/* Description */}
          <p className="text-sm text-textMuted leading-relaxed mb-5">
            {currentStepData.description}
          </p>

          {/* Footer Controls */}
          <div className="flex justify-between items-center border-t border-gray-50 pt-4 mt-auto">
            <button
              onClick={onClose}
              className="text-xs text-textMuted hover:text-textDark font-semibold transition-colors"
            >
              Skip Tour
            </button>
            <div className="flex gap-2">
              {step > 0 && (
                <button
                  onClick={prevStep}
                  className="p-2 border border-gray-200 hover:bg-gray-50 rounded-lg transition-colors text-gray-600"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={nextStep}
                className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] text-xs shadow-glow"
              >
                {step === tourSteps.length - 1 ? 'Finish' : 'Next'} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
