import React, { useEffect, useState } from 'react';
import { motion, useInView, useSpring, useMotionValue } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Crown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero3DScene from '../components/Hero3DScene';
import { donors, foodListings } from '../data/mockData';
import clsx from 'clsx';

// Custom hook for counting up numbers
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

// Reusable animated section wrapper
const Section = ({ children, className, id }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
      className={className}
    >
      {children}
    </motion.section>
  );
};

export default function LandingPage() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const handleMouseMove = (e) => {
    mouseX.set((e.clientX / window.innerWidth - 0.5) * 30);
    mouseY.set((e.clientY / window.innerHeight - 0.5) * 30);
  };

  const kgSaved = useCountUp(12400);
  const mealsShared = useCountUp(3200);
  const activeDonors = useCountUp(840);

  const headlinePart1 = "Food that's left behind —";
  const headlinePart2 = "finds a home.";

  return (
    <div className="relative bg-background font-body">
      <Navbar />

      {/* ─────────────────── HERO ─────────────────── */}
      <section
        className="relative w-full min-h-screen flex flex-col overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* Background grain + dot grid */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="absolute inset-0 w-full h-full opacity-[0.035]">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
          <motion.div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #16a34a 1px, transparent 0)',
              backgroundSize: '32px 32px',
              x: smoothX,
              y: smoothY,
            }}
          />
        </div>

        {/* Blurred green orb */}
        <motion.div
          className="absolute right-0 bottom-0 w-[500px] h-[500px] rounded-full bg-primary-tint blur-[120px] opacity-25 z-0 pointer-events-none"
          animate={{ x: ['0%', '-5%', '0%'], y: ['0%', '5%', '0%'] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Two-column hero content */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-28 pb-0 flex flex-col lg:flex-row items-center gap-8 flex-1">

          {/* LEFT — text */}
          <div className="w-full lg:w-[50%] flex flex-col justify-center py-10">

            {/* Eyebrow pill */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-tint text-primary-dark font-medium text-sm mb-6 border border-primary/20 self-start"
            >
              <span>🌱</span> Fighting food waste, one meal at a time
            </motion.div>

            {/* Headline — bold black, "finds a home." in blue */}
            <motion.h1
              className="text-5xl md:text-6xl lg:text-7xl font-heading font-black tracking-tighter leading-[1.1] mb-6"
              initial="hidden"
              animate="show"
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }}
            >
              {/* Line 1 — dark */}
              <span className="block text-textDark">
                {headlinePart1.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.2em]"
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20 } },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
              {/* Line 2 — blue */}
              <span className="block text-blue-500">
                {headlinePart2.split(' ').map((word, i) => (
                  <motion.span
                    key={i}
                    className="inline-block mr-[0.2em]"
                    variants={{
                      hidden: { opacity: 0, y: 50 },
                      show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 20, delay: 0.3 + i * 0.06 } },
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-lg text-textMuted max-w-lg mb-10 leading-relaxed"
            >
              Connect excess food with those who need it. A community-driven platform empowering
              businesses and individuals to share resources effortlessly.
            </motion.p>

            {/* CTA Buttons — simple side-by-side, no absolute positioning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="flex flex-col sm:flex-row gap-4 mb-12"
            >
              <Link
                to="/register"
                className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg shadow-glow transition-all hover:scale-105 active:scale-95"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 bg-white border-2 border-gray-200 hover:border-primary/50 text-gray-700 hover:text-primary px-8 py-4 rounded-full font-bold text-lg transition-colors"
              >
                <MapPin className="w-5 h-5" /> Sign In
              </Link>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex items-center gap-6 md:gap-10 border-t border-gray-100 pt-8"
            >
              <div>
                <div className="text-3xl font-black font-heading tabular-nums text-textDark">{kgSaved.toLocaleString()} kg</div>
                <div className="text-sm font-medium text-textMuted">Saved</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-black font-heading tabular-nums text-textDark">{mealsShared.toLocaleString()}</div>
                <div className="text-sm font-medium text-textMuted">Meals Shared</div>
              </div>
              <div className="w-px h-12 bg-gray-200" />
              <div>
                <div className="text-3xl font-black font-heading tabular-nums text-textDark">{activeDonors.toLocaleString()}</div>
                <div className="text-sm font-medium text-textMuted">Active Donors</div>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — 3D scene, bigger */}
          <div className="w-full lg:w-[50%] h-[380px] lg:h-[580px] relative">
            <Hero3DScene />
          </div>

        </div>
      </section>

      {/* ─────────────────── MARQUEE ─────────────────── */}
      <div className="bg-[#1a5c38] overflow-hidden py-4 flex whitespace-nowrap">
        <motion.div
          animate={{ x: [0, -1035] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="flex gap-10 text-white font-medium items-center text-base shrink-0"
        >
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span className="flex items-center gap-2">🥗 Nasi Lemak <span className="text-white/40">·</span> 1.2km <span className="text-white/40">·</span> Claimed 4 mins ago</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-2">🍱 Bento Box <span className="text-white/40">·</span> 3.4km <span className="text-white/40">·</span> Available now</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-2">🥕 Mixed Vegetables <span className="text-white/40">·</span> 0.8km <span className="text-white/40">·</span> Claimed 12 mins ago</span>
              <span className="text-white/30">•</span>
              <span className="flex items-center gap-2">🥖 Assorted Breads <span className="text-white/40">·</span> 2.1km <span className="text-white/40">·</span> Available now</span>
              <span className="text-white/30">•</span>
            </React.Fragment>
          ))}
        </motion.div>
      </div>

      {/* ─────────────────── HOW IT WORKS ─────────────────── */}
      <Section id="how-it-works" className="py-32 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-4 text-textDark">How It Works</h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            A seamless process designed to connect excess food with those who need it most, ensuring zero waste.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-[50%] top-0 bottom-0 w-0.5 border-l-2 border-dashed border-gray-200 hidden md:block" />
          <div className="space-y-24">

            {/* Step 1 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2 md:pr-12 md:text-right">
                <div className="inline-block bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4 md:ml-auto">1</div>
                <h3 className="text-3xl font-heading font-bold mb-3 text-textDark">List Excess Food</h3>
                <p className="text-gray-600 text-lg">Restaurants and donors easily snap a photo, add details like expiry and allergies, and list surplus food in seconds.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2 md:pl-12">
                <div className="bg-white rounded-card shadow-lg border border-gray-100 p-6 max-w-sm">
                  <div className="h-40 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-400">Photo Preview</div>
                  <div className="h-10 bg-gray-50 rounded mb-3 flex items-center px-3 text-gray-500 font-medium">Bento Box</div>
                  <div className="w-1/2 h-10 bg-primary rounded flex items-center justify-center text-white font-bold">List Item</div>
                </div>
              </motion.div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2 md:pl-12">
                <div className="inline-block bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
                <h3 className="text-3xl font-heading font-bold mb-3 text-textDark">Browse &amp; Book</h3>
                <p className="text-gray-600 text-lg">Receivers browse available food nearby on our live map, filter by dietary needs, and book a secure pickup time slot.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2 md:pr-12 flex justify-end">
                <div className="bg-white rounded-card shadow-lg border border-gray-100 p-6 max-w-sm w-full">
                  <div className="flex gap-2 mb-4">
                    <div className="h-8 w-20 bg-gray-100 rounded-full" />
                    <div className="h-8 w-24 bg-primary-tint rounded-full" />
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-8 bg-primary rounded-lg w-full mt-2" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col md:flex-row items-center gap-12">
              <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2 md:pr-12 md:text-right">
                <div className="inline-block bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl mb-4 md:ml-auto">3</div>
                <h3 className="text-3xl font-heading font-bold mb-3 text-textDark">Pickup via QR</h3>
                <p className="text-gray-600 text-lg">Arrive at the location, scan the secure QR code to verify the transaction, and enjoy! Reviews build trust in the community.</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="w-full md:w-1/2 md:pl-12">
                <div className="bg-white rounded-card shadow-lg border border-gray-100 p-6 max-w-sm flex flex-col items-center justify-center">
                  <div className="w-40 h-40 bg-gray-100 rounded-xl flex flex-wrap p-2 gap-1 relative overflow-hidden">
                    {[...Array(64)].map((_, i) => (
                      <div key={i} className={clsx('w-[10%] h-[10%]', Math.random() > 0.5 ? 'bg-black' : 'bg-transparent')} />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-400/20 to-transparent" style={{ animation: 'scan 2s linear infinite' }} />
                  </div>
                  <div className="mt-4 text-center font-semibold text-gray-700">Scan to Claim</div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </Section>

      {/* ─────────────────── LEADERBOARD ─────────────────── */}
      <Section id="leaderboard" className="py-24 bg-surface px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-heading font-black mb-2 text-textDark">Top Donors</h2>
              <p className="text-textMuted">Celebrating our most impactful community members.</p>
            </div>
            <Link to="/login" className="text-primary font-bold hover:text-primary-dark flex items-center gap-1">
              Sign in to view <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {donors.slice(0, 5).map((donor, idx) => (
              <motion.div
                key={donor.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className={clsx(
                  'flex items-center p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors',
                  idx === 0 && 'border-l-4 border-l-yellow-400 bg-yellow-50/30'
                )}
              >
                <div className="w-12 text-center font-bold text-gray-400 text-lg flex justify-center">
                  {idx === 0 ? <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" /> : `#${idx + 1}`}
                </div>
                <div className="w-12 h-12 rounded-full bg-primary-tint text-primary-dark flex items-center justify-center font-bold mr-4 shrink-0">
                  {donor.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={clsx('font-bold text-lg truncate', idx === 0 ? 'shimmer-text' : 'text-gray-900')}>{donor.name}</h4>
                  <div className="text-sm text-gray-500 flex gap-4">
                    <span>{donor.donationCount} donations</span>
                    <span>{donor.points} pts</span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                    Score: {donor.trustScore}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ─────────────────── COMMUNITY IMPACT ─────────────────── */}
      <Section className="py-32 px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-4 text-textDark">Community Impact</h2>
          <p className="text-lg text-textMuted max-w-2xl mx-auto">
            Real moments of sharing and caring from our incredible community of donors and receivers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[250px]">
          <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 md:row-span-2 bg-gray-100 rounded-3xl overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1593113565637-227c8d9fb821?w=800&q=80" alt="Volunteers organizing food" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 inline-block">Featured</span>
              <h3 className="text-white text-2xl font-bold">100 Meals Saved in Subang</h3>
              <p className="text-gray-300 text-sm mt-1">Local bakeries coming together to distribute weekend surplus.</p>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 rounded-3xl overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&q=80" alt="Fresh produce" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-bold">Fresh Produce</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} className="bg-gray-100 rounded-3xl overflow-hidden relative group">
            <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&q=80" alt="Hot meals" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white font-bold">Warm Meals</span>
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.01 }} className="md:col-span-3 bg-primary-tint rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-primary/20">
            <div>
              <h3 className="text-2xl font-bold text-primary-dark mb-2">Be part of the change.</h3>
              <p className="text-gray-700 max-w-xl">Every meal shared is a step towards a zero-waste community. Join thousands of Malaysians making a difference today.</p>
            </div>
            <Link to="/register" className="whitespace-nowrap bg-primary hover:bg-primary-dark text-white font-bold py-4 px-8 rounded-btn shadow-glow transition-transform hover:scale-105">
              Start Your Journey
            </Link>
          </motion.div>
        </div>
      </Section>

      {/* ─────────────────── FOOTER ─────────────────── */}
      <footer className="border-t border-primary px-6 lg:px-8 py-12 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-lg leading-none">F</span>
              </div>
              <span className="font-heading font-black text-xl tracking-tight text-textDark">FoodBridge</span>
            </div>
            <p className="text-sm text-gray-500">Made with 💚 to reduce food waste in Malaysia.</p>
          </div>
          <div className="flex gap-6 text-sm font-semibold text-gray-600">
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
}
