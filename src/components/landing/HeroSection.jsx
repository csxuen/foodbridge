import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function HeroSection() {
  const containerRef = useRef(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const headline = "Food that's left behind — find a home.";
  const words = headline.split(" ");

  const wordVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        delay: i * 0.05,
        type: 'spring',
        damping: 15,
        stiffness: 100,
      }
    })
  };

  return (
    <section ref={containerRef} className="relative min-h-[60vh] w-full flex flex-col items-center justify-center pt-48 pb-32">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-lime/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply" />

      <motion.div 
        style={{ y: textY, opacity }} 
        className="relative z-20 w-full max-w-5xl mx-auto px-6 text-center flex flex-col items-center"
      >
        <h1 className="font-display text-[10vw] md:text-[6vw] leading-[1.1] text-forest tracking-tight text-balance flex flex-wrap justify-center max-w-4xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={wordVariants}
              className="mr-[1.5vw] md:mr-[1vw] inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8 font-sans text-forest/70 max-w-lg text-balance"
        >
          The world's largest food rescue platform, optimized for your community in a more easy way.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-8 flex flex-wrap gap-4 items-center justify-center relative z-50 pointer-events-auto"
        >
          <button 
            onClick={() => {
              if (user) {
                if (role === 'donor') navigate('/donor?tab=Donate');
                else if (role === 'receiver') navigate('/receiver');
                else navigate('/admin');
              } else {
                navigate('/register');
              }
            }}
            className="bg-[#111913] text-parchment font-sans font-medium text-sm px-8 py-4 rounded-[2rem] hover:scale-105 transition-transform duration-300"
          >
            Donate now
          </button>
          <button 
            onClick={() => setIsVideoOpen(true)}
            className="text-forest font-sans font-medium text-sm px-6 py-4 rounded-[2rem] flex items-center gap-2 hover:bg-forest/5 transition-colors duration-300 group"
          >
            <Play className="w-4 h-4 fill-forest group-hover:scale-110 transition-transform" />
            View impact
          </button>
        </motion.div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsVideoOpen(false)} 
              className="absolute inset-0 bg-black/80 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="bg-forest border border-parchment/20 rounded-[2.5rem] p-6 relative z-10 w-full max-w-4xl aspect-video overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="flex justify-between items-center mb-4 text-parchment">
                <h3 className="font-display text-2xl">Food Rescue: How It Works</h3>
                <button 
                  onClick={() => setIsVideoOpen(false)} 
                  className="p-2 bg-white/10 hover:bg-white/20 active:scale-95 rounded-full transition-all"
                >
                  <X className="w-5 h-5 text-parchment" />
                </button>
              </div>
              <div className="flex-1 rounded-2xl overflow-hidden bg-black/40">
                <iframe 
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/5-b8S-D231E?autoplay=1" 
                  title="Food Rescue Video" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen
                ></iframe>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
