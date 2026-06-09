import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

function ScrambleText({ finalValue, duration = 2, delay = 0 }) {
  const [displayText, setDisplayText] = useState("0".repeat(finalValue.toString().length));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    let start = null;
    const finalValueStr = finalValue.toString();
    const finalLen = finalValueStr.length;
    
    // Convert to number for interpolation if it's numeric
    const isNumeric = !isNaN(finalValue.replace(/,/g, ''));
    const finalNumber = isNumeric ? parseInt(finalValue.replace(/,/g, ''), 10) : 0;

    let timeout;
    timeout = setTimeout(() => {
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / (duration * 1000), 1);
        
        if (progress < 1) {
          if (isNumeric) {
            // Count up + scramble
            const currentNum = Math.floor(progress * finalNumber);
            const currentStr = currentNum.toString().padStart(finalLen, '0');
            // Add some random scrambling to the end
            const scrambled = currentStr.split('').map((char, i) => {
              // The further we are, the more characters lock into place
              if (progress > (i / finalLen) * 0.8) return finalValueStr[i];
              return Math.floor(Math.random() * 10).toString();
            }).join('');
            
            // Format back with commas if original had commas
            const needsCommas = finalValue.includes(',');
            if (needsCommas) {
               setDisplayText(parseInt(scrambled).toLocaleString());
            } else {
               setDisplayText(scrambled);
            }
          } else {
             // Just pure scramble for text
             const scrambled = finalValueStr.split('').map((char, i) => {
              if (progress > (i / finalLen) * 0.8) return finalValueStr[i];
              return String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }).join('');
            setDisplayText(scrambled);
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

export default function StatsBand() {
  const stats = [
    { value: "45,000", label: "Meals Rescued", prefix: "+" },
    { value: "1,200", label: "Active Donors", prefix: "" },
    { value: "850", label: "Receivers Fed", prefix: "" },
  ];

  return (
    <section className="bg-forest text-parchment mt-24 py-16 overflow-hidden border-t border-parchment/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 max-w-[1400px] mx-auto gap-16 md:gap-8">
        {stats.map((stat, i) => (
          <div key={i} className="flex-1 w-full relative">
            <div className="overflow-hidden h-[60px] md:h-[90px] flex items-end pb-2">
              <motion.div
                initial={{ y: "100%" }}
                whileInView={{ y: "0%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: [0.33, 1, 0.68, 1] }}
                className="font-display text-6xl md:text-8xl leading-none tracking-tight mix-blend-screen opacity-90 text-lime"
              >
                {stat.prefix}
                <ScrambleText finalValue={stat.value} delay={i * 0.2 + 0.5} duration={1.5} />
              </motion.div>
            </div>
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 + 1, duration: 1 }}
              className="mt-4 border-t border-parchment/20 pt-4"
            >
              <h3 className="font-syne uppercase text-xs tracking-[0.3em] font-bold text-parchment/70">
                {stat.label}
              </h3>
            </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}
