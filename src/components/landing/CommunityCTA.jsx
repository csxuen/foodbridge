import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function ScrambleText({ finalValue, duration = 2, delay = 0 }) {
  const [displayText, setDisplayText] = useState("0".repeat(finalValue.toString().length));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = null;
    const finalValueStr = finalValue.toString();
    const finalLen = finalValueStr.length;
    const isNumeric = !isNaN(finalValue.replace(/,/g, '').replace(/\+/g, ''));
    const finalNumber = isNumeric ? parseInt(finalValue.replace(/,/g, '').replace(/\+/g, ''), 10) : 0;

    let timeout = setTimeout(() => {
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / (duration * 1000), 1);
        
        if (progress < 1) {
          if (isNumeric) {
            const currentNum = Math.floor(progress * finalNumber);
            const currentStr = currentNum.toString().padStart(finalLen - 1, '0');
            const scrambled = currentStr.split('').map((char, i) => {
              if (progress > (i / finalLen) * 0.8) return finalValueStr[i];
              return Math.floor(Math.random() * 10).toString();
            }).join('');
            
            const needsCommas = finalValue.includes(',');
            let val = needsCommas ? parseInt(scrambled || 0).toLocaleString() : scrambled;
            if (finalValue.includes('+')) val += '+';
            setDisplayText(val);
          }
          window.requestAnimationFrame(step);
        } else {
          setDisplayText(finalValue);
        }
      };
      window.requestAnimationFrame(step);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, finalValue, duration, delay]);

  return <span ref={ref}>{displayText}</span>;
}

export default function CommunityCTA() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const y2 = useTransform(scrollYProgress, [0, 1], [-80, 80]);
  const y3 = useTransform(scrollYProgress, [0, 1], [30, -100]);

  return (
    <section ref={containerRef} className="py-32 bg-parchment text-forest relative overflow-hidden flex flex-col items-center justify-center min-h-screen">
      
      {/* Floating Polaroids */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-[30%] left-[2%] md:left-[8%] xl:left-[12%] w-32 md:w-40 z-10"
      >
        <img 
          src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80" 
          alt="Community volunteer" 
          className="w-full h-auto aspect-[3/4] object-cover rounded-3xl filter grayscale shadow-xl"
        />
      </motion.div>

      <motion.div 
        style={{ y: y2 }}
        className="absolute top-[20%] right-[2%] md:right-[8%] xl:right-[12%] w-24 md:w-32 z-10"
      >
        <img 
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80" 
          alt="Community sharing" 
          className="w-full h-auto aspect-square object-cover rounded-[2rem] filter grayscale shadow-xl"
        />
      </motion.div>

      <motion.div 
        style={{ y: y3 }}
        className="absolute bottom-[20%] right-[5%] md:right-[12%] xl:right-[18%] w-32 md:w-40 z-10"
      >
        <img 
          src="https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&q=80" 
          alt="Community sharing" 
          className="w-full h-auto aspect-[4/5] object-cover rounded-3xl filter grayscale shadow-xl"
        />
      </motion.div>
      
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-[25%] left-[5%] md:left-[12%] xl:left-[18%] w-24 md:w-32 z-10 hidden md:block"
      >
        <img 
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80" 
          alt="Community sharing" 
          className="w-full h-auto aspect-square object-cover rounded-[2rem] filter grayscale shadow-xl"
        />
      </motion.div>

      {/* Main Text Container */}
      <div className="relative z-20 text-center px-6 max-w-4xl mx-auto flex flex-col items-center">
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display text-3xl md:text-5xl leading-snug text-balance mb-12"
        >
          Join our community for donating and be a part of a positive change in the world. With over:
        </motion.h2>

        <div className="font-display text-[15vw] md:text-[180px] leading-none tracking-tighter mb-8">
          <ScrambleText finalValue="120,859+" duration={1.5} delay={0.2} />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 1, duration: 0.8 }}
          className="font-sans text-sm font-medium mb-8"
        >
          people already joining
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <button 
            onClick={() => {
              if (user) {
                if (role === 'donor') navigate('/donor');
                else if (role === 'receiver') navigate('/receiver');
                else navigate('/admin');
              } else {
                navigate('/login');
              }
            }}
            className="bg-[#111913] text-parchment font-sans text-sm font-medium px-8 py-4 rounded-full hover:scale-105 transition-transform duration-300"
          >
            Yes, I want to join community
          </button>
        </motion.div>
      </div>

    </section>
  );
}
