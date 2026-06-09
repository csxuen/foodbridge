import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { 
  PlusCircle, Package, Trophy, Ticket, Award, 
  LogOut, Check, Star, Heart, Flame, Hexagon, Search, Bell, ChevronRight, Shield, Target, ArrowRight, X, MapPin, Menu
} from 'lucide-react';
import clsx from 'clsx';
import QRCode from 'react-qr-code';
import confetti from 'canvas-confetti';
import UserProfile from '../components/UserProfile';
import SpotlightTour from '../components/SpotlightTour';
import { vouchers, certificates } from '../data/mockData';

// --- CUSTOM HOOKS ---
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

// --- ANIMATION VARIANTS ---
const pageVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30, staggerChildren: 0.1 } },
  exit: { opacity: 0, y: -15, transition: { duration: 0.2 } }
};

const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
};





export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const { foodListings, addFoodListing, donors, receivers } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['Overview', 'Donate', 'My Donations', 'Leaderboard', 'Vouchers', 'Certificates', 'Notifications'].includes(tab)) {
      return tab;
    }
    return 'Overview';
  });
  const [profileOpen, setProfileOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && ['Overview', 'Donate', 'My Donations', 'Leaderboard', 'Vouchers', 'Certificates', 'Notifications'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  useEffect(() => {
    if (localStorage.getItem('foodbridge_tour_active') === 'true') {
      setTourActive(true);
    }
  }, []);

  const handleCloseTour = () => {
    setTourActive(false);
    localStorage.removeItem('foodbridge_tour_active');
  };

  const handleLogout = () => {
    logout();
  };

  const navItems = ['Overview', 'Donate', 'My Donations', 'Leaderboard', 'Vouchers', 'Certificates'];

  return (
    <div className="h-screen w-screen text-forest font-sans selection:bg-lime/30 overflow-hidden flex flex-col relative bg-parchment">
        
      {/* FULL WIDTH TOP NAVIGATION HEADER (Frosted Glass) */}
      <header className="h-20 px-6 md:px-10 flex items-center justify-between bg-parchment/80 backdrop-blur-2xl border-b border-forest/10 z-40 relative">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-6 text-forest">
          <div className="flex items-center gap-2">
            <Hexagon className="w-8 h-8 text-lime fill-lime/20" />
            <span className="font-heading font-black text-xl tracking-tight hidden md:block">FoodBridge</span>
          </div>
        </div>

        {/* Center: Segmented Pill Navigation */}
        <nav className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/50 backdrop-blur-xl p-1.5 rounded-full border border-forest/5 shadow-sm hidden md:flex">
          {navItems.map(item => {
            const isActive = activeTab === item;
            return (
              <button
                key={item}
                onClick={() => setActiveTab(item)}
                className={clsx(
                  "relative px-6 py-2 rounded-full text-sm font-bold transition-colors z-10 whitespace-nowrap",
                  isActive ? "text-forest" : "text-forest/60 hover:text-forest hover:bg-forest/5"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="pillIndicator" 
                    className="absolute inset-0 bg-lime rounded-full shadow-sm -z-10" 
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {item}
              </button>
            )
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setActiveTab('Notifications')} className="w-10 h-10 rounded-full bg-white border border-forest/10 hidden md:flex items-center justify-center text-forest/70 hover:bg-forest/5 hover:text-forest transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-400 rounded-full border-2 border-white"></span>
          </button>
          
          <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 group mx-1">
            <div className="w-10 h-10 rounded-full bg-forest p-[2px] shadow-sm group-hover:shadow-md transition-shadow">
              <div className="w-full h-full bg-parchment rounded-full flex items-center justify-center font-bold text-forest text-sm">
                {user?.initials}
              </div>
            </div>
          </button>

          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden w-10 h-10 rounded-full bg-white border border-forest/10 flex items-center justify-center text-forest/70 hover:bg-forest/5 hover:text-forest transition-all">
            <Menu className="w-5 h-5" />
          </button>
          
          <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-white border border-forest/10 hidden md:flex items-center justify-center text-forest/70 hover:bg-rose-50 hover:text-rose-500 transition-all">
            <LogOut className="w-5 h-5 ml-1" />
          </button>
        </div>
      </header>

      {/* MOBILE NAV OVERLAY */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-xl shadow-xl z-30 flex flex-col items-stretch px-6 py-4 gap-2 md:hidden border-b border-forest/10 overflow-hidden"
          >
            {navItems.map(item => (
              <button key={item} onClick={() => { setActiveTab(item); setMobileMenuOpen(false); }}
                className={clsx("p-4 text-left font-bold rounded-2xl transition-colors", activeTab === item ? "bg-lime/30 text-forest" : "text-forest/70 hover:bg-forest/5")}
              >
                {item}
              </button>
            ))}
            <button onClick={() => { setActiveTab('Notifications'); setMobileMenuOpen(false); }} className={clsx("p-4 text-left font-bold rounded-2xl transition-colors flex justify-between", activeTab === 'Notifications' ? "bg-lime/30 text-forest" : "text-forest/70 hover:bg-forest/5")}>
              Notifications <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
            </button>
            <button onClick={handleLogout} className="p-4 text-left font-bold rounded-2xl text-rose-500 hover:bg-rose-50 mt-2 border-t border-forest/5">
              Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLLABLE CONTENT VIEW */}
      <main className="flex-1 overflow-y-auto hide-scrollbar relative z-10 p-6 md:p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && <OverviewTab key="Overview" user={user} setActiveTab={setActiveTab} />}
          {activeTab === 'Donate' && <DonateTab key="Donate" setActiveTab={setActiveTab} addFoodListing={addFoodListing} user={user} showToast={showToast} />}
          {activeTab === 'My Donations' && <MyDonationsTab key="Donations" foodListings={foodListings} user={user} />}
          {activeTab === 'Leaderboard' && <LeaderboardTab key="Leaderboard" donors={donors} user={user} />}
          {activeTab === 'Vouchers' && <VouchersTab key="Vouchers" />}
          {activeTab === 'Certificates' && <CertificatesTab key="Certificates" />}
          {activeTab === 'Notifications' && <NotificationsTab key="Notifications" />}
        </AnimatePresence>
      </main>

      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SpotlightTour active={tourActive} onClose={handleCloseTour} />
    </div>
  );
}

// ============================================================================
// OVERVIEW TAB (Asymmetric Scrapbook Theme)
// ============================================================================
const OverviewTab = ({ user, setActiveTab }) => {
  const donations = useCountUp(user?.donationCount || 0);
  const vouchers = useCountUp(user?.vouchers?.length || 0);
  const score = useCountUp(user?.trustScore || 0);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto pb-20 relative">
      
      {/* Decorative Sparkles in Background */}
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute top-20 -left-10 text-lime/40 text-4xl select-none z-0">✨</motion.div>
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="absolute top-60 right-0 text-amber-200/50 text-5xl select-none z-0">✺</motion.div>

      <div className="flex flex-col lg:flex-row gap-8 relative z-10">
        
        {/* ================================================================= */}
        {/* LEFT COLUMN: Profile Ticket & Stats (Narrower)                    */}
        {/* ================================================================= */}
        <div className="w-full lg:w-1/3 flex flex-col gap-8">
          
          {/* Profile Card */}
          <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 md:p-12 border border-forest/10 shadow-xl shadow-forest/5 relative overflow-hidden group">
            
            <div className="text-center mt-6">
              <div className="w-20 h-20 mx-auto bg-forest text-parchment rounded-full flex items-center justify-center text-2xl font-black shadow-inner mb-4 group-hover:scale-110 transition-transform">
                {user?.initials}
              </div>
              <h1 className="font-display font-black text-4xl text-forest mb-1 tracking-tight">
                Hello, {user?.name.split(' ')[0]}
              </h1>
              <p className="text-sm text-forest/60 font-medium mb-8">Ready to make an impact?</p>

              {/* Minimalist Trust Score Ring inside Ticket */}
              <div className="w-40 h-40 mx-auto relative flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" r="70" stroke="rgba(28,43,30,0.05)" strokeWidth="18" fill="transparent" />
                  <motion.circle 
                    cx="80" cy="80" r="70" stroke="#C8F04A" strokeWidth="18" fill="transparent" 
                    strokeDasharray={70 * 2 * Math.PI} 
                    initial={{ strokeDashoffset: 70 * 2 * Math.PI }}
                    animate={{ strokeDashoffset: 70 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }}
                    transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
                    strokeLinecap="round" 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-4xl font-black text-forest tabular-nums tracking-tighter">{score}</div>
                  <div className="font-bold text-[9px] tracking-widest text-forest/50 uppercase mt-1">Trust Score</div>
                </div>
              </div>
            </div>
          </motion.div>

            <div className="lg:hidden w-full">
              {/* Mobile Only CTA */}
              <motion.button 
                variants={itemVariants}
                onClick={() => setActiveTab('Donate')}
                className="w-full bg-forest text-parchment rounded-[3rem] p-8 text-left relative overflow-hidden group shadow-[0_10px_20px_rgba(28,43,30,0.15)] border border-forest/50"
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-lime/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/3"></div>
                <div className="relative z-10">
                  <h2 className="font-display font-black text-4xl leading-[1.1] mb-4 text-parchment">
                    Got Surplus?<br />Donate It!
                  </h2>
                  <div className="inline-flex items-center gap-2 bg-lime text-forest px-6 py-3 rounded-full font-bold text-sm">
                    List New Donation <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            </div>

          {/* Floating Stat Bubbles */}
          <div className="flex gap-4">
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="flex-1 bg-lime/30 rounded-[2rem] py-5 md:py-8 text-center border border-lime shadow-sm relative overflow-hidden">
              <div className="absolute top-2 right-4 text-2xl opacity-40">📦</div>
              <div className="text-3xl md:text-4xl font-black text-forest relative z-10 tabular-nums">{donations}</div>
              <div className="text-[10px] font-bold uppercase mt-1 text-forest/70 relative z-10">Donations</div>
            </motion.div>
            
            <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="flex-1 bg-amber-100 rounded-[2rem] py-5 md:py-8 text-center border border-amber-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-2 right-4 text-2xl opacity-40">🎟️</div>
              <div className="text-3xl md:text-4xl font-black text-amber-900 relative z-10 tabular-nums">{vouchers}</div>
              <div className="text-[10px] font-bold uppercase mt-1 text-amber-900/70 relative z-10">Vouchers</div>
            </motion.div>
          </div>

          {/* Info Tile 1 (Moved to Left Column - Hidden on Mobile) */}
          <motion.div variants={itemVariants} className="hidden lg:flex flex-1 flex-col bg-[#fcfcfb] rounded-[2.5rem] p-8 border border-forest/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 rounded-full blur-[30px] -translate-y-1/2 translate-x-1/2" />
            <div className="w-12 h-12 bg-lime/20 text-forest rounded-full flex items-center justify-center mb-6 border border-lime shadow-sm">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-2xl text-forest mb-2">Food Safety First</h3>
            <p className="text-forest/70 font-medium flex-1">
              Ensure all donations meet our safety guidelines. Package securely and verify expiration dates before listing.
            </p>
            <button className="mt-4 text-forest font-bold text-sm uppercase tracking-widest flex items-center gap-1 hover:text-lime-700 transition-colors">
              Read Guidelines <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
          
        </div>

        {/* ================================================================= */}
        {/* RIGHT COLUMN: Super CTA & Activity Timeline                       */}
        {/* ================================================================= */}
        <div className="w-full lg:w-2/3 flex flex-col gap-8">
          
          {/* MASSIVE SUPER-CTA (Breaks the grid, organic feel) */}
          <div className="hidden lg:block">
            <motion.button 
              variants={itemVariants}
              onClick={() => setActiveTab('Donate')}
              className="w-full bg-forest text-parchment rounded-[3rem] p-10 md:p-14 text-left relative overflow-hidden group hover:scale-[1.02] transition-transform shadow-[0_20px_40px_rgba(28,43,30,0.2)] border border-forest/50 cursor-pointer block"
            >
              {/* Soft decorative blur */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 group-hover:bg-lime/20 transition-colors"></div>
              
              <div className="relative z-10 w-full md:w-3/4">
                <h2 className="font-display font-black text-5xl md:text-7xl leading-[1.1] mb-6 drop-shadow-sm text-parchment">
                  Got Surplus?<br />Donate It Now!
                </h2>
                <div className="inline-flex items-center gap-3 bg-lime text-forest px-8 py-4 rounded-full font-bold text-lg group-hover:bg-[#c1ff72] group-hover:shadow-lg transition-all shadow-[0_0_15px_rgba(193,255,114,0.3)]">
                  List New Donation <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Bouncing Floating Emojis */}
              <motion.div animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="absolute top-10 right-10 text-7xl md:text-8xl drop-shadow-xl hidden sm:block">🍞</motion.div>
              <motion.div animate={{ y: [0, 20, 0], rotate: [0, -15, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} className="absolute bottom-8 right-32 text-6xl md:text-7xl drop-shadow-xl hidden sm:block">🥗</motion.div>
              <motion.div animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="absolute bottom-12 right-12 text-5xl drop-shadow-xl hidden sm:block">🥭</motion.div>
            </motion.button>
          </div>

          {/* Scrapbook Activity Feed (More organic list) */}
          <motion.div variants={itemVariants} className="flex-1 bg-white rounded-[3rem] p-8 md:p-12 border border-forest/10 shadow-xl shadow-forest/5 relative">
            {/* Scrapbook Tape Decoration */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-parchment/80 border border-forest/5 backdrop-blur-sm -rotate-2 z-10 shadow-sm"></div>

            <h3 className="font-heading font-black text-2xl text-forest mb-8">Recent Activity</h3>
            
            <div className="relative border-l-2 border-forest/10 ml-6 pl-8 space-y-8">
              {[
                { icon: Check, color: 'text-lime-700 bg-lime/30', text: 'Pickup Complete', detail: 'Nasi Lemak successfully picked up by John D.', time: '2 hours ago' },
                { icon: Flame, color: 'text-amber-700 bg-amber-200', text: 'Milestone Reached', detail: 'You hit a 5-Day Donation Streak!', time: 'Yesterday' },
                { icon: Heart, color: 'text-rose-600 bg-rose-100', text: 'Listing Published', detail: 'Assorted Breads published to the map.', time: '2 days ago' }
              ].map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline Node */}
                  <div className={clsx("absolute -left-[3.25rem] w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm border-4 border-white", item.color)}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="bg-parchment/50 p-5 rounded-2xl border border-forest/5 group-hover:bg-forest/5 transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-bold text-forest text-lg">{item.text}</div>
                      <div className="text-xs font-bold text-forest/40 uppercase tracking-wider">{item.time}</div>
                    </div>
                    <div className="text-sm font-medium text-forest/70">{item.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>

      {/* ================================================================= */}
      {/* BOTTOM SECTION: Full-Width Information Tile                       */}
      {/* ================================================================= */}
      <div className="relative z-10 mt-8 flex flex-col gap-4">
        
        {/* Mobile ONLY: 2-column grid for Food Safety & Community Goal */}
        <div className="grid grid-cols-2 gap-4 lg:hidden">
           {/* Mini Food Safety Card */}
           <motion.div variants={itemVariants} className="flex flex-col bg-[#fcfcfb] rounded-[2rem] p-5 border border-forest/10 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-lime/10 rounded-full blur-[20px] -translate-y-1/2 translate-x-1/2" />
            <div className="w-10 h-10 bg-lime/20 text-forest rounded-full flex items-center justify-center mb-4 border border-lime shadow-sm shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-forest mb-2">Safety First</h3>
            <p className="text-forest/70 text-xs font-medium flex-1 line-clamp-3">
              Ensure all donations meet guidelines. Package securely.
            </p>
          </motion.div>

          {/* Mini Community Goal Card */}
          <motion.div variants={itemVariants} className="flex flex-col bg-forest rounded-[2rem] p-5 border border-forest shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-lime/10 rounded-full blur-[20px] translate-y-1/4 translate-x-1/4" />
            <div className="w-10 h-10 bg-[#2a3f2d] text-lime rounded-full flex items-center justify-center mb-4 shadow-inner shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-display font-bold text-lg text-parchment mb-2">Comm. Goal</h3>
            <div className="flex-1 flex flex-col justify-end mt-2">
              <div className="flex justify-between text-parchment font-bold text-[10px] uppercase tracking-wider mb-2">
                <span>120 left</span>
                <span className="text-lime">85%</span>
              </div>
              <div className="w-full bg-[#111913] h-2 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-lime rounded-full" 
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Desktop ONLY: Info Tile 2 (Community Goal - Full Width) */}
        <motion.div variants={itemVariants} className="hidden lg:flex w-full bg-forest rounded-[2.5rem] p-8 md:p-12 border border-forest shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-lime/10 rounded-full blur-[40px] translate-y-1/4 translate-x-1/4" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10 w-full">
            <div className="max-w-2xl">
              <div className="w-12 h-12 bg-[#2a3f2d] text-lime rounded-full flex items-center justify-center mb-6 shadow-inner">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-3xl md:text-4xl text-parchment mb-4">Community Goal</h3>
              <p className="text-parchment/70 font-medium text-lg">
                We are only 120 meals away from hitting our monthly community milestone. Keep up the amazing work!
              </p>
            </div>
            
            <div className="w-full md:w-1/3 flex flex-col justify-center">
              <div className="flex justify-between text-parchment font-bold mb-3">
                <span>Progress</span>
                <span className="text-lime">85%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full bg-[#111913] h-4 rounded-full overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-lime rounded-full relative overflow-hidden"
                />
              </div>
            </div>
          </div>
        </motion.div>

      </div>

    </motion.div>
  );
};


// ============================================================================
// DONATE TAB (Colorful Glass Form)
// ============================================================================
const DonateTab = ({ setActiveTab, addFoodListing, user, showToast }) => {
  const [formData, setFormData] = useState({
    name: '', category: 'Cooked Meal', quantity: '', unit: 'portions', 
    expiry: '', address: '', allergyTags: []
  });
  const allergyOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Vegan-safe', 'None'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.expiry) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    const newFood = {
      id: 'f' + Date.now(), donorId: user.id, name: formData.name, category: formData.category,
      quantity: Number(formData.quantity), unit: formData.unit, expiry: new Date(formData.expiry).toISOString(),
      allergyTags: formData.allergyTags.length ? formData.allergyTags : ['None'], distance: '1.2',
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', status: 'Active',
      pickupSlots: [{ id: 1, date: formData.expiry.split('T')[0], start: '09:00', end: '18:00' }]
    };
    addFoodListing(newFood);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#f59e0b', '#047857'] });
    showToast('Food listed successfully!', 'success');
    setActiveTab('My Donations');
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto pb-20 px-4">
      <div className="mb-8 md:mb-12">
        <h2 className="text-4xl md:text-5xl font-display font-black text-forest mb-3 tracking-tight">Donate Food</h2>
        <p className="text-forest/60 font-medium text-lg">List your surplus to share with the community.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {/* Left Panel (Image Upload) */}
          <div className="w-full md:w-[32%] order-2 md:order-1 bg-forest text-parchment rounded-[2rem] p-8 flex flex-col shadow-2xl shadow-forest/20 border border-forest/20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-lime/20 rounded-full flex items-center justify-center text-lime">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            </div>
            <h2 className="text-2xl font-display font-black tracking-tight text-white">Food Photo</h2>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer group">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white/50 group-hover:text-lime group-hover:bg-lime/20 transition-all mb-4">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">Upload Image</h4>
            <p className="text-sm font-medium text-parchment/60 leading-relaxed">Drag and drop a clear photo of the food item, or click to browse.</p>
            <p className="text-xs text-parchment/40 mt-6">Supports JPG, PNG (Max 5MB)</p>
          </div>

          <div className="mt-8 bg-black/20 rounded-xl p-4 border border-white/5">
            <h5 className="text-[10px] font-bold uppercase tracking-widest text-parchment/50 mb-2 pl-1">Photo Guidelines</h5>
            <ul className="text-sm text-parchment/70 space-y-2 font-medium">
              <li className="flex gap-2"><span>•</span> Ensure good lighting</li>
              <li className="flex gap-2"><span>•</span> Show the actual portion size</li>
              <li className="flex gap-2"><span>•</span> Packaging should be visible</li>
            </ul>
          </div>
        </div>

        {/* Right Panel (White Form Area) */}
        <div className="w-full md:w-[68%] order-1 md:order-2 bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-forest/5 border border-forest/10 flex flex-col">
          <div className="flex flex-col h-full">
            
            {/* Top Header & Actions */}
            <div className="flex justify-between items-center mb-10">
              <h3 className="text-2xl font-display font-black tracking-tight text-forest">Food Details</h3>
              <button type="button" onClick={() => setActiveTab('Overview')} className="w-10 h-10 rounded-full bg-gray-50 text-forest flex items-center justify-center hover:bg-gray-100 hover:text-red-500 transition-colors shadow-sm shrink-0">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Food Designation</label>
                  <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-forest/10 focus:border-forest outline-none transition-all text-forest font-medium placeholder:text-forest/30" placeholder="e.g. Assorted Pastries" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Category</label>
                  <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-forest/10 focus:border-forest outline-none transition-all text-forest font-medium appearance-none">
                    {['Cooked Meal', 'Raw Produce', 'Bakery', 'Beverages', 'Canned Goods'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Expiry Date & Time</label>
                  <input type="datetime-local" required value={formData.expiry} onChange={e=>setFormData({...formData, expiry: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-forest/10 focus:border-forest outline-none transition-all text-forest font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Quantity</label>
                  <input type="number" required min="1" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-forest/10 focus:border-forest outline-none transition-all text-forest font-medium" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Unit</label>
                  <select value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl p-3.5 focus:ring-2 focus:ring-forest/10 focus:border-forest outline-none transition-all text-forest font-medium appearance-none">
                    <option value="portions">portions</option><option value="kg">kg</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-4 mt-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Allergy Tags</label>
                <div className="flex flex-wrap gap-3">
                  {allergyOptions.map(tag => {
                    const isSelected = formData.allergyTags.includes(tag);
                    return (
                      <button type="button" key={tag} onClick={() => setFormData(prev => ({...prev, allergyTags: isSelected ? prev.allergyTags.filter(t=>t!==tag) : [...prev.allergyTags, tag]}))}
                        className={clsx(
                          "px-5 py-2.5 rounded-full text-sm font-bold border transition-all shadow-sm",
                          isSelected ? "bg-forest text-lime border-forest" : "bg-white text-forest/70 border-gray-200 hover:border-forest/40 hover:text-forest"
                        )}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2 pt-4 mt-2 border-t border-forest/10">
                <label className="text-[10px] font-bold uppercase tracking-widest text-forest/50 pl-1">Pickup Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <input type="text" required value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full bg-white border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 focus:ring-2 focus:ring-forest/10 focus:border-forest outline-none transition-all text-forest font-medium placeholder:text-gray-400" placeholder="Store address..." />
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Full-width Action Button */}
        <div className="w-full mt-2">
          <button type="submit" className="w-full bg-lime text-forest font-black py-5 rounded-[2rem] hover:bg-[#b4d330] transition-colors shadow-glow flex items-center justify-center gap-2 text-xl">
            Publish Donation <ArrowRight className="w-6 h-6" />
          </button>
        </div>

      </form>
    </motion.div>
  );
};


// ============================================================================
// PACKING TUTORIAL MODAL (IMMERSIVE)
// ============================================================================
const tutorialSteps = [
  {
    title: "Hygiene & Safety Check",
    description: "Ensure all surfaces, hands, and utensils are thoroughly sanitized. Food safety is our absolute highest priority. Separate raw and cooked foods completely to prevent cross-contamination. Only pack food that is completely safe for immediate human consumption.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"
  },
  {
    title: "Weighing & Portioning",
    description: "Carefully divide large batches into single or family-sized portions. This makes it much easier for receivers to collect. Use food-grade, leak-proof containers. If possible, weigh the packages so the receiver knows exactly what they are getting.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
  },
  {
    title: "Sealing & Packaging",
    description: "Secure lids tightly to prevent any spills during transport. If you are packing hot food, ensure the container is heat-safe and allow steam to vent slightly if necessary before sealing. Clean the outside of the container.",
    image: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&q=80"
  },
  {
    title: "QR Labelling & Handoff",
    description: "Click 'Show QR Code' on your dashboard. Print or clearly write the tracking code on a label and affix it securely to the top of the container. When the receiver arrives, let them scan the code to complete the secure handoff.",
    image: "https://images.unsplash.com/photo-1622556498246-755f44ca76f3?w=800&q=80"
  }
];

const PackingTutorialModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) setStep(0);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-forest/95 backdrop-blur-md">
          
          <button onClick={onClose} className="absolute top-4 right-4 md:top-6 md:right-6 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 transition-colors z-10">
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>

          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-3xl md:rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl relative">
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-100 flex">
              <motion.div 
                className="h-full bg-lime"
                initial={{ width: '0%' }}
                animate={{ width: `${((step + 1) / tutorialSteps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-6 md:p-12 flex flex-col md:flex-row gap-6 md:gap-12 items-center">
              
              <div className="w-full md:w-1/2 relative h-[180px] md:h-[450px] rounded-2xl md:rounded-[2.5rem] overflow-hidden shadow-lg shrink-0">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={step}
                    src={tutorialSteps[step].image}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white font-black text-5xl md:text-7xl opacity-20">
                  0{step + 1}
                </div>
              </div>

              <div className="w-full md:w-1/2 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-3 md:space-y-6"
                  >
                    <div className="inline-block px-3 py-1 md:px-4 md:py-1.5 bg-lime/20 text-forest font-black uppercase tracking-widest text-[8px] md:text-[10px] rounded-full">
                      Step {step + 1} of {tutorialSteps.length}
                    </div>
                    <h2 className="text-2xl md:text-5xl font-display font-black text-forest leading-tight">
                      {tutorialSteps[step].title}
                    </h2>
                    <p className="text-forest/70 font-medium text-sm md:text-lg leading-relaxed">
                      {tutorialSteps[step].description}
                    </p>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-6 md:mt-12 flex items-center gap-3 md:gap-4 pb-4 md:pb-0">
                  <button 
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-forest/10 flex items-center justify-center text-forest hover:bg-forest/5 disabled:opacity-30 disabled:hover:bg-transparent transition-colors shrink-0"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 rotate-180" />
                  </button>
                  
                  {step < tutorialSteps.length - 1 ? (
                    <button 
                      onClick={() => setStep(s => Math.min(tutorialSteps.length - 1, s + 1))}
                      className="flex-1 bg-forest text-lime font-bold py-3 md:py-4 rounded-full hover:bg-[#0a2a1a] transition-colors shadow-xl shadow-forest/20 flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      Next Step <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  ) : (
                    <button 
                      onClick={onClose}
                      className="flex-1 bg-lime text-forest font-black py-3 md:py-4 rounded-full hover:bg-[#b4d330] transition-colors shadow-glow flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                      I'm Ready <Check className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// QR CODE MODAL
// ============================================================================
const QRCodeModal = ({ isOpen, foodId, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-forest/80 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden flex flex-col shadow-2xl">
            
            <div className="p-8 pb-6 text-center">
              <h2 className="text-2xl font-display font-black text-forest">Pickup Verification</h2>
              <p className="text-forest/60 font-medium mt-2 text-sm max-w-[260px] mx-auto">Let the receiver scan this code when they arrive to complete the pickup.</p>
            </div>

            <div className="px-8 pb-8 flex justify-center">
              <div className="border border-forest/10 p-6 rounded-3xl shadow-sm">
                <QRCode value={`foodbridge://pickup/${foodId}`} size={200} />
              </div>
            </div>
            
            <div className="px-8 pb-8">
              <button onClick={onClose} className="bg-gray-50 text-forest font-bold py-4 rounded-xl hover:bg-gray-100 transition-colors w-full">
                Close
              </button>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MY DONATIONS (Colorful Gallery)
// ============================================================================
const MyDonationsTab = ({ foodListings, user }) => {
  const [filter, setFilter] = useState('All');
  const [showTutorial, setShowTutorial] = useState(false);
  const [selectedQrFoodId, setSelectedQrFoodId] = useState(null);

  const myFoods = foodListings.filter(f => f.donorId === user?.id);
  const filteredFoods = filter === 'All' ? myFoods : filter === 'Completed' ? myFoods.filter(f => f.status === 'Completed' || f.status === 'Claimed') : myFoods.filter(f => f.status === filter);

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-6xl mx-auto pb-20">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-display font-black text-forest mb-3 tracking-tight">My Donations</h2>
          <p className="text-forest/60 font-medium max-w-lg">Track the real-time status of the food items you have listed for donation.</p>
        </div>
        
        {/* Filter Bar */}
        <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-forest/10 w-fit shrink-0 relative">
          {['All', 'Active', 'Completed', 'Expired'].map(f => {
            const isActive = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} className={clsx(
                "px-5 py-2 rounded-xl text-sm font-bold transition-colors relative z-10",
                isActive ? "text-lime" : "text-forest/60 hover:text-forest hover:bg-forest/5"
              )}>
                {isActive && (
                  <motion.div layoutId="filterPill" className="absolute inset-0 bg-forest rounded-xl -z-10" />
                )}
                <span className="relative z-10">{f}</span>
              </button>
            )
          })}
        </div>
      </div>

      {filteredFoods.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-[2.5rem] border border-forest/10 p-16 flex flex-col items-center justify-center text-center shadow-sm w-full py-24">
          <Package className="w-16 h-16 text-forest/20 mb-6" />
          <h3 className="text-2xl font-bold text-forest mb-2">No donations found</h3>
          <p className="text-forest/60 font-medium">You don't have any donations matching this filter.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredFoods.map((food, i) => (
            <motion.div 
              key={food.id} variants={itemVariants} layoutId={`card-${food.id}`}
              className="bg-white rounded-3xl md:rounded-[2.5rem] border border-forest/10 overflow-hidden shadow-xl shadow-forest/5 hover:-translate-y-2 transition-all duration-300 group flex flex-col text-forest"
            >
              <div className="h-32 md:h-48 relative overflow-hidden shrink-0">
                <img src={food.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90" />
                <div className="absolute top-2 right-2 md:top-4 md:right-4">
                  <span className={clsx("px-2 py-1 md:px-4 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-sm",
                    food.status === 'Active' ? 'bg-lime text-forest' :
                    (food.status === 'Claimed' || food.status === 'Completed') ? 'bg-forest text-parchment' : 'bg-white text-gray-900'
                  )}>{food.status === 'Claimed' ? 'Completed' : food.status}</span>
                </div>
              </div>
              <div className="p-4 md:p-6 flex-1 flex flex-col relative">
                
                <h3 className="text-base md:text-xl font-bold mb-1.5 relative z-10 truncate">{food.name}</h3>
                <p className="text-forest font-bold text-[10px] md:text-xs mb-4 bg-parchment inline-block px-2 md:px-3 py-1 rounded-xl w-fit relative z-10 truncate max-w-full">{food.quantity} {food.unit} • {food.category}</p>
                
                <div className="mt-2 pt-3 border-t border-forest/10 flex justify-between items-center text-xs font-bold relative z-10 mb-5">
                  <span className="text-forest/60">Expires: {new Date(food.expiry).toLocaleDateString()}</span>
                  {food.status === 'Claimed' && <span className="text-forest flex items-center gap-1"><Check className="w-3.5 h-3.5"/> Locked In</span>}
                </div>

                {food.status !== 'Completed' && food.status !== 'Expired' ? (
                  <div className="mt-auto space-y-2 relative z-10">
                    <button onClick={() => setSelectedQrFoodId(food.id)} className="w-full bg-[#8ce69f] hover:bg-[#7ad68d] text-forest font-bold py-2.5 text-sm rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2">
                      Show QR Code for Pickup
                    </button>
                    <button onClick={() => setShowTutorial(true)} className="w-full bg-forest/5 hover:bg-forest/10 text-forest font-bold py-2.5 text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                      How to pack
                    </button>
                  </div>
                ) : (
                  <div className="mt-auto" />
                )}
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        </div>
      )}

      <PackingTutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
      <QRCodeModal isOpen={!!selectedQrFoodId} foodId={selectedQrFoodId} onClose={() => setSelectedQrFoodId(null)} />
    </motion.div>
  );
};


// ============================================================================
// LEADERBOARD (Dynamic Podium)
// ============================================================================
const LeaderboardTab = ({ donors, user }) => {
  const sorted = [...donors].sort((a,b) => a.rank - b.rank);
  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const podiumOrder = [
    top3.find(d => d.rank === 2),
    top3.find(d => d.rank === 1),
    top3.find(d => d.rank === 3)
  ].filter(Boolean);

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return { bg: "bg-amber-50/50 border-amber-200", icon: <Trophy className="w-6 h-6 text-amber-500 mx-auto drop-shadow-sm" />, text: "text-amber-500" };
      case 2: return { bg: "bg-slate-50/80 border-slate-200", icon: <Award className="w-6 h-6 text-slate-500 mx-auto drop-shadow-sm" />, text: "text-slate-500" };
      case 3: return { bg: "bg-orange-50/50 border-orange-200", icon: <Award className="w-6 h-6 text-orange-500 mx-auto drop-shadow-sm" />, text: "text-orange-500" };
      default: return { bg: "bg-white border-forest/10 hover:border-forest/20 hover:shadow-lg", icon: `#${rank}`, text: "text-forest/40" };
    }
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto pb-20">
      
      <div className="mb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-display font-black text-forest mb-4 tracking-tight">Global Ranks</h2>
        <p className="text-forest/60 font-medium">The most generous contributors in our network.</p>
      </div>

      {/* PODIUM SECTION */}
      <div className="flex justify-center items-end gap-2 md:gap-6 mb-16 px-4 mt-16 md:mt-24">
        {podiumOrder.map((donor, idx) => {
          const isFirst = donor.rank === 1;
          const isMe = donor.id === user.id;
          const heightClass = isFirst ? 'h-64 md:h-72 z-10' : donor.rank === 2 ? 'h-52 md:h-60' : 'h-44 md:h-52';
          
          let podiumBg = '';
          let icon = null;
          let textColor = '';
          if (isFirst) {
            podiumBg = 'bg-gradient-to-t from-amber-100 to-amber-50 border-amber-200 shadow-amber-500/20';
            icon = <Trophy className="w-10 h-10 text-amber-500 mb-2 drop-shadow-md" />;
            textColor = 'text-amber-600';
          } else if (donor.rank === 2) {
            podiumBg = 'bg-gradient-to-t from-slate-100 to-slate-50 border-slate-200 shadow-slate-500/10';
            icon = <Award className="w-8 h-8 text-slate-500 mb-2 drop-shadow-md" />;
            textColor = 'text-slate-600';
          } else {
            podiumBg = 'bg-gradient-to-t from-orange-100 to-orange-50 border-orange-200 shadow-orange-500/10';
            icon = <Award className="w-8 h-8 text-orange-500 mb-2 drop-shadow-md" />;
            textColor = 'text-orange-600';
          }

          if (isMe) {
            podiumBg = 'bg-gradient-to-t from-lime to-lime/40 border-lime shadow-lime/40';
            textColor = 'text-forest';
            if (isFirst) icon = <Trophy className="w-10 h-10 text-forest mb-2 drop-shadow-md" />;
            else icon = <Award className="w-8 h-8 text-forest mb-2 drop-shadow-md" />;
          }

          return (
            <motion.div 
              key={donor.id} 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
              className={clsx("w-1/3 max-w-[200px] flex flex-col items-center justify-end relative", isFirst ? "z-10 scale-105" : "z-0")}
            >
              {/* Avatar & Name - Standard Flow above Podium */}
              <div className="flex flex-col items-center w-full mb-3">
                {icon}
                <div className="relative">
                  <div className={clsx("w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-black text-2xl md:text-3xl shadow-xl border-4 z-10", 
                    isMe ? "bg-forest text-lime border-lime" : "bg-white border-white text-forest"
                  )}>
                    {donor.initials}
                  </div>
                  {isMe && <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-forest text-lime text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest shadow-sm z-20">You</span>}
                </div>
                <div className={clsx("font-display font-black text-base md:text-xl text-center leading-tight mt-3 truncate w-[120%] px-1", textColor, isFirst ? "text-lg md:text-2xl" : "")}>
                  {donor.name.split(' ')[0]}
                </div>
              </div>

              {/* Podium Block */}
              <div className={clsx("w-full rounded-t-3xl border-t-4 border-l border-r shadow-2xl flex flex-col items-center justify-start pt-6 md:pt-8 pb-4 transition-transform hover:-translate-y-2", heightClass, podiumBg)}>
                <div className={clsx("text-3xl md:text-4xl font-black tabular-nums", textColor)}>{donor.points}</div>
                <div className={clsx("text-[10px] font-bold uppercase tracking-widest opacity-60 mb-auto", textColor)}>Points</div>
                <div className={clsx("text-6xl md:text-8xl font-black opacity-10 leading-none", textColor)}>{donor.rank}</div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* REST OF THE LIST */}
      <div className="space-y-4 px-4 max-w-2xl mx-auto">
        {rest.map((donor, i) => {
          const rankStyle = getRankStyle(donor.rank);
          const isMe = donor.id === user.id;

          return (
            <motion.div key={donor.id} variants={itemVariants} className={clsx(
              "relative overflow-hidden rounded-[2rem] p-5 md:p-6 flex items-center gap-4 md:gap-6 transition-all border group shadow-sm hover:shadow-md",
              isMe ? "bg-forest text-lime scale-[1.02] shadow-xl border-forest/20 my-6" : "bg-white border-forest/5 hover:border-forest/10 text-forest"
            )}>
              {/* Subtle background glow effect on hover */}
              {!isMe && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-forest/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />}

              <div className={clsx("w-10 md:w-14 text-center text-xl md:text-2xl font-black opacity-40 group-hover:opacity-100 transition-opacity", isMe ? "text-lime opacity-100" : rankStyle.text)}>
                #{donor.rank}
              </div>
              
              <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 shadow-sm relative z-10 border", 
                isMe ? "bg-lime text-forest border-lime" : "bg-gradient-to-br from-parchment to-white border-forest/10 text-forest"
              )}>
                {donor.initials}
              </div>
              
              <div className="flex-1 min-w-0 relative z-10">
                <div className="font-bold text-lg md:text-xl flex items-center gap-3">
                  <span className="truncate">{donor.name}</span>
                  {isMe && <span className="shrink-0 px-3 py-1 bg-lime text-forest text-[9px] font-black rounded-full uppercase tracking-widest shadow-sm">You</span>}
                </div>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className={clsx("flex items-center gap-1.5 text-xs font-bold", isMe ? "text-lime/70" : "text-forest/60")}>
                    <Shield className="w-3.5 h-3.5" />
                    Trust Score: {donor.trustScore}
                  </div>
                  
                  {/* Visual Points Bar */}
                  <div className="flex-1 max-w-[120px] h-1.5 rounded-full bg-forest/5 overflow-hidden hidden md:block">
                    <div className={clsx("h-full rounded-full transition-all duration-1000", isMe ? "bg-lime" : "bg-lime/80")} style={{ width: `${Math.min((donor.points / 5000) * 100, 100)}%` }} />
                  </div>
                </div>
              </div>
              
              <div className="text-right relative z-10">
                <div className="text-2xl md:text-3xl font-black tabular-nums">{donor.points}</div>
                <div className={clsx("text-[9px] font-bold uppercase tracking-widest mt-1", isMe ? "text-lime/70" : "text-forest/40")}>Points</div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  );
};

// ============================================================================
// VOUCHERS TAB
// ============================================================================
const VouchersTab = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h2 className="text-4xl font-display font-black text-forest mb-3 tracking-tight">Rewards & Vouchers</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {vouchers.map((v, i) => (
          <motion.div key={v.id} variants={itemVariants} className="bg-white rounded-2xl p-4 md:p-6 shadow-sm border border-forest/10 relative overflow-hidden flex flex-col min-h-[180px] md:min-h-[220px]">
            
            {/* The Ticket Dashed Edge Effect */}
            <div className="absolute left-0 top-0 bottom-0 w-1 border-l-[3px] border-dashed border-gray-200" />

            <div className="flex justify-between items-start mb-6 pl-2">
              <div className="w-12 h-12 rounded-full bg-lime/30 text-forest font-black flex items-center justify-center">
                {v.partner.substring(0,2).toUpperCase()}
              </div>
              <Ticket className="w-6 h-6 text-forest/20" />
            </div>

            <div className="pl-2 flex-1">
              <div className="text-[10px] md:text-sm font-bold text-forest/60 mb-1 truncate">{v.partner}</div>
              <div className="text-base md:text-xl font-black text-forest mb-4 leading-tight">{v.discount}</div>
              <div className="text-[8px] md:text-[10px] font-bold text-forest/40 uppercase tracking-widest leading-tight">Valid until {new Date(v.expiry).toLocaleDateString()}</div>
            </div>

            <div className="mt-4 md:mt-6 relative">
              {v.redeemed ? (
                <>
                  <button disabled className="w-full bg-gray-50 text-gray-300 font-bold py-2.5 md:py-3 rounded-xl flex justify-center items-center gap-1 md:gap-2 text-xs md:text-base">
                    <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> <span className="hidden md:inline">Copy Code</span><span className="md:hidden">Copy</span>
                  </button>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] bg-gray-800 text-white font-black px-3 py-1 md:px-6 md:py-2 rounded-lg text-xs md:text-lg tracking-widest shadow-xl border border-gray-700 pointer-events-none">
                    REDEEMED
                  </div>
                </>
              ) : (
                <button className="w-full bg-forest/5 text-forest font-bold py-2.5 md:py-3 rounded-xl hover:bg-forest hover:text-white transition-colors flex justify-center items-center gap-1 md:gap-2 text-xs md:text-base">
                  <svg className="w-3 h-3 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg> <span className="hidden md:inline">Copy Code</span><span className="md:hidden">Copy</span>
                </button>
              )}
            </div>

          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// CERTIFICATES TAB
// ============================================================================
const CertificatesTab = () => {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto pb-20">
      <div className="mb-10">
        <h2 className="text-4xl font-display font-black text-forest mb-3 tracking-tight">Certificates of Impact</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
        {certificates.map((c, i) => (
          <motion.div key={c.id} variants={itemVariants} className="bg-white rounded-2xl md:rounded-[2rem] p-5 md:p-10 shadow-xl shadow-forest/5 border border-forest/10 relative overflow-hidden flex flex-col text-center">
            
            {/* Top Green Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-lime to-forest" />

            <div className="mx-auto w-10 h-10 md:w-16 md:h-16 bg-amber-50 rounded-full flex items-center justify-center mb-4 md:mb-6 border border-amber-100 shadow-sm text-amber-500">
              <Award className="w-5 h-5 md:w-8 md:h-8" />
            </div>

            <h3 className="text-base md:text-2xl font-display font-black text-forest mb-1 leading-tight">
              {i === 0 ? "Food Hero Q1 2026" : "Community Champion Q4 2025"}
            </h3>
            <p className="text-forest/60 font-medium text-xs md:text-base mb-4 md:mb-8">{c.donorName}</p>

            <div className="bg-gray-50/80 rounded-2xl p-3 md:p-6 mb-4 md:mb-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-3 md:gap-0">
              <div>
                <div className="text-[8px] md:text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-0.5 md:mb-1">Period</div>
                <div className="text-xs md:text-sm font-bold text-forest leading-tight">{c.dateRange}</div>
              </div>
              <div className="md:text-right">
                <div className="text-[8px] md:text-[10px] font-bold text-forest/40 uppercase tracking-widest mb-0.5 md:mb-1">Donations</div>
                <div className="text-base md:text-lg font-black text-forest leading-tight">{c.totalDonations}</div>
              </div>
            </div>

            <div className="mb-4 md:mb-8">
              <div className="text-[8px] md:text-[10px] font-bold text-forest/60 uppercase tracking-widest mb-1 md:mb-2">Receiver Satisfaction</div>
              <div className="flex justify-center items-center gap-0.5 md:gap-1">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={clsx("w-3 h-3 md:w-5 md:h-5", star <= Math.floor(c.satisfactionScore) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")} />
                ))}
              </div>
              <div className="text-[10px] md:text-sm font-bold text-forest/60 mt-1 md:mt-2">{c.satisfactionScore} / 5.0</div>
            </div>

            <button className="w-full bg-white border-2 border-forest text-forest font-bold py-2 md:py-4 rounded-xl hover:bg-forest hover:text-white transition-colors shadow-sm text-xs md:text-base">
              Download Certificate
            </button>

          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

// ============================================================================
// NOTIFICATIONS TAB
// ============================================================================
const NotificationsTab = () => {
  const dummyNotifications = [
    { id: 1, type: 'alert', title: 'Action Required: Food expiring soon', desc: 'Your listed Assorted Breads & Pastries will expire in 3 hours.', time: '10 mins ago', read: false },
    { id: 2, type: 'success', title: 'Donation Completed', desc: 'Fresh Bakery KL successfully collected your 20kg vegetables.', time: '2 hours ago', read: false },
    { id: 3, type: 'info', title: 'New Voucher Unlocked', desc: 'You reached Trust Score 98! A new GrabFood voucher is waiting for you.', time: '1 day ago', read: true },
    { id: 4, type: 'info', title: 'Community Update', desc: 'We rescued over 1,500kg of food this week thanks to heroes like you!', time: '3 days ago', read: true },
  ];

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto pb-20">
      <div className="mb-10">
        <h2 className="text-4xl font-display font-black text-forest mb-3 tracking-tight">Notifications</h2>
        <p className="text-forest/60 font-medium">Stay updated on your donations and account activity.</p>
      </div>

      <div className="space-y-4">
        {dummyNotifications.map(notif => (
          <motion.div key={notif.id} variants={itemVariants} className={clsx("p-6 rounded-[2rem] border transition-all flex gap-5 shadow-sm", notif.read ? "bg-white border-forest/10" : "bg-lime/20 border-lime shadow-md")}>
            <div className="shrink-0 mt-1">
              {notif.type === 'alert' && <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center"><Bell className="w-5 h-5" /></div>}
              {notif.type === 'success' && <div className="w-10 h-10 rounded-full bg-lime-100 text-lime-700 flex items-center justify-center"><Check className="w-5 h-5" /></div>}
              {notif.type === 'info' && <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"><Star className="w-5 h-5" /></div>}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={clsx("font-bold text-lg", notif.read ? "text-forest/80" : "text-forest")}>{notif.title}</h4>
                <span className="text-xs font-bold text-forest/40 uppercase tracking-widest">{notif.time}</span>
              </div>
              <p className={clsx("text-sm", notif.read ? "text-forest/60" : "text-forest/80 font-medium")}>{notif.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
