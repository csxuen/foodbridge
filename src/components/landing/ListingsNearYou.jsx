import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const items = [
  { id: 1, title: "17 Thousand People Fed During Recent Floods", tag: "Emergency Relief", img: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80" },
  { id: 2, title: "Lifeskills for 2,587 Children", tag: "Education", img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80" },
  { id: 3, title: "5000+ Active Volunteers", tag: "Community", img: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80" },
  { id: 4, title: "Sponsor daily meals for Orphans", tag: "Welfare", img: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&q=80" },
  { id: 5, title: "Zero Waste Neighborhoods", tag: "Environment", img: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&q=80" },
  { id: 6, title: "Hot meals for the Homeless", tag: "Shelter", img: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" },
];

export default function ListingsNearYou() {
  return (
    <section id="community-impact" className="py-32 bg-forest text-parchment overflow-hidden border-t border-parchment/10">
      <div className="px-6 md:px-24 mb-16">
        <h2 className="font-display text-[5vw] leading-none">
          Community Impact
        </h2>
        <p className="font-sans text-parchment/70 mt-4 max-w-md text-balance">
          See the real difference we're making together. Fresh surplus food rescued and delivered across neighborhoods daily.
        </p>
      </div>

      <div className="px-6 md:px-24 grid grid-cols-1 md:grid-cols-4 gap-6">
        {items.map((item, i) => {
          // Asymmetric but balanced row logic
          // Row 1: [Large (span 2)] [Small (span 1)] [Small (span 1)]
          // Row 2: [Small (span 1)] [Small (span 1)] [Large (span 2)]
          const isLarge = i === 0 || i === 5;
          const spanClass = isLarge ? "md:col-span-2" : "md:col-span-1";
          
          return (
            <motion.div 
              key={item.id}
              className={`${spanClass} h-[400px] relative rounded-3xl overflow-hidden`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
            >
              <img 
                src={item.img} 
                alt={item.title} 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/40 to-transparent opacity-90 pointer-events-none" />
              
              <div className="absolute bottom-6 left-6 pointer-events-none pr-6">
                <span className="bg-lime text-forest font-sans text-xs uppercase font-bold tracking-widest px-3 py-1.5 rounded-full mb-3 inline-block">
                  {item.tag}
                </span>
                <h3 className={`font-display text-parchment leading-tight ${isLarge ? 'text-3xl md:text-4xl' : 'text-2xl md:text-3xl'}`}>
                  {item.title}
                </h3>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
