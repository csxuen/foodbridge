import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from './HeroSection';
import MarqueeTicker from './MarqueeTicker';
import LiveListingsBento from './LiveListingsBento';
import StatsBand from './StatsBand';
import HowItWorks from './HowItWorks';
import ListingsNearYou from './ListingsNearYou';
import CommunityCTA from './CommunityCTA';
import Footer from './Footer';

import { Link } from 'react-router-dom';

import Navbar from '../Navbar';

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="noise-bg" />
      
      <Navbar />

      <main className="bg-parchment min-h-screen">
        <HeroSection />
        <LiveListingsBento />
        <StatsBand />
        <HowItWorks />
        <ListingsNearYou />
        <CommunityCTA />
        <MarqueeTicker />
      </main>
      
      <Footer />
    </motion.div>
  );
}
