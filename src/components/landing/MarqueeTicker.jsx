import { motion } from 'framer-motion';

export default function MarqueeTicker() {
  const text = "let's help each other * ";
  const repeatedText = Array(15).fill(text).join(" ");

  return (
    <div className="relative h-48 md:h-64 flex items-center justify-center overflow-hidden bg-gradient-to-b from-parchment from-50% to-forest to-50% w-full">
      {/* Back Dark Marquee */}
      <div className="absolute w-[110vw] -left-[5vw] bg-forest text-parchment py-4 md:py-6 flex whitespace-nowrap rotate-[3deg] shadow-2xl z-10">
        <motion.div
          className="font-display text-3xl md:text-5xl tracking-wide inline-block"
          animate={{ x: ["-50%", "0%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          <span>{repeatedText}</span>
          <span>{repeatedText}</span>
        </motion.div>
      </div>

      {/* Front Lime Marquee */}
      <div className="absolute w-[110vw] -left-[5vw] bg-lime text-forest py-4 md:py-6 flex whitespace-nowrap -rotate-[3deg] shadow-2xl z-20 border-y border-forest/10">
        <motion.div
          className="font-display text-3xl md:text-5xl tracking-wide inline-block"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 30 }}
        >
          <span>{repeatedText}</span>
          <span>{repeatedText}</span>
        </motion.div>
      </div>
    </div>
  );
}
