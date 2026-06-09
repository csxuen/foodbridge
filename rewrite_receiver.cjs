const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { 
  LayoutDashboard, Search, CalendarCheck, ShieldCheck, Clock, 
  LogOut, MapPin, X, Check, Star, Navigation, Menu, Bell, Hexagon
} from 'lucide-react';
import clsx from 'clsx';
import QRCode from 'react-qr-code';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import confetti from 'canvas-confetti';
import UserProfile from '../components/UserProfile';
import SpotlightTour from '../components/SpotlightTour';

// Leaflet icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Custom interval hook
const useInterval = (callback, delay) => {
  const savedCallback = React.useRef();
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    function tick() { savedCallback.current(); }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// --- ANIMATION VARIANTS ---
const itemVariants = {
  initial: { opacity: 0, y: 15 },
  animate: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
};

export default function ReceiverDashboard() {
  const { user, logout } = useAuth();
  const { foodListings, bookings, addBooking, cancelBooking, addReview, updateReceiverAllergy, donors, updateBookingStatus } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['Overview', 'Browse Food', 'My Bookings', 'Trust Score', 'History'].includes(tab)) {
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
    if (tab && ['Overview', 'Browse Food', 'My Bookings', 'Trust Score', 'History'].includes(tab)) {
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

  const navItems = ['Overview', 'Browse Food', 'My Bookings', 'Trust Score', 'History'];

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
          
          <button onClick={logout} className="w-10 h-10 rounded-full bg-white border border-forest/10 hidden md:flex items-center justify-center text-forest/70 hover:bg-rose-50 hover:text-rose-500 transition-all">
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
            )}
            <button onClick={() => { setActiveTab('Notifications'); setMobileMenuOpen(false); }} className={clsx("p-4 text-left font-bold rounded-2xl transition-colors flex justify-between", activeTab === 'Notifications' ? "bg-lime/30 text-forest" : "text-forest/70 hover:bg-forest/5")}>
              Notifications <span className="w-2 h-2 bg-rose-400 rounded-full"></span>
            </button>
            <button onClick={logout} className="p-4 text-left font-bold rounded-2xl text-rose-500 hover:bg-rose-50 mt-2 border-t border-forest/5">
              Log Out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SCROLLABLE CONTENT VIEW */}
      <main className="flex-1 overflow-y-auto hide-scrollbar relative z-10 p-6 md:p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'Overview' && <OverviewTab key="Overview" user={user} updateReceiverAllergy={updateReceiverAllergy} bookings={bookings} showToast={showToast} setActiveTab={setActiveTab} />}
          {activeTab === 'Browse Food' && <BrowseFoodTab key="BrowseFood" user={user} foodListings={foodListings} addBooking={addBooking} donors={donors} showToast={showToast} />}
          {activeTab === 'My Bookings' && <MyBookingsTab key="MyBookings" user={user} bookings={bookings} cancelBooking={cancelBooking} addReview={addReview} foodListings={foodListings} donors={donors} showToast={showToast} updateBookingStatus={updateBookingStatus} />}
          {activeTab === 'Trust Score' && <TrustScoreTab key="TrustScore" user={user} />}
          {activeTab === 'History' && <HistoryTab key="History" user={user} bookings={bookings} foodListings={foodListings} donors={donors} />}
          {activeTab === 'Notifications' && <div key="Notifications" className="max-w-2xl mx-auto"><h2 className="text-3xl font-heading font-black mb-8 text-forest">Notifications</h2><div className="bg-white rounded-[2rem] p-8 text-center text-forest/60 border border-forest/5 shadow-xl shadow-forest/5">No new notifications.</div></div>}
        </AnimatePresence>
      </main>

      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SpotlightTour active={tourActive} onClose={handleCloseTour} />
    </div>
  );
}

// -------------------------------------------------------------
// TAB COMPONENTS
// -------------------------------------------------------------

const OverviewTab = ({ user, updateReceiverAllergy, bookings, showToast, setActiveTab }) => {
  const { updateCurrentUser } = useAuth();
  const pickups = useCountUp(user?.completedPickups || 0);
  const score = useCountUp(user?.trustScore || 0);
  const activeBookings = useCountUp(bookings.filter(b => b.receiverId === user?.id && b.status === 'Upcoming').length);
  const allergyOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Vegan-safe'];
  const [profile, setProfile] = useState(user?.allergyProfile || []);

  const handleSaveAllergies = () => {
    updateReceiverAllergy(user.id, profile);
    if (updateCurrentUser) {
      updateCurrentUser({ allergyProfile: profile });
    }
    showToast('Allergy profile updated.', 'success');
  };

  const toggleAllergy = (tag) => {
    setProfile(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <motion.div variants={{animate: {transition: {staggerChildren: 0.1}}}} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto space-y-8">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-forest mb-2">Receiver Overview</h1>
        <p className="text-forest/60 font-medium">Your hub for food rescue and profile management.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card A: Trust Score */}
        <motion.div variants={itemVariants} id="tour-trust-score" className="md:col-span-2 bg-white rounded-[3rem] p-8 md:p-10 shadow-xl shadow-forest/5 border border-forest/10 flex items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/3 group-hover:bg-lime/20 transition-colors"></div>
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-1 text-forest">Trust Score</h3>
            <p className="text-forest/60 text-sm mb-6 max-w-[200px]">Higher scores unlock priority bookings.</p>
            <div className="text-5xl font-black tabular-nums text-forest tracking-tighter">{score}/100</div>
          </div>
          <div className="relative w-32 h-32 flex-shrink-0 z-10">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-forest/5" />
              <motion.circle cx="64" cy="64" r="50" stroke="currentColor" strokeWidth="10" fill="transparent" strokeDasharray={50 * 2 * Math.PI} 
                initial={{ strokeDashoffset: 50 * 2 * Math.PI }} animate={{ strokeDashoffset: 50 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} className={user?.trustScore > 70 ? 'text-lime' : 'text-terracotta'} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-forest">
              {score}%
            </div>
          </div>
        </motion.div>

        {/* Card B, C: Stats */}
        <motion.div variants={itemVariants} id="tour-stat-cards" className="col-span-2 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-forest/5 border border-forest/10 flex flex-col justify-between group hover:border-lime/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-lime/20 text-forest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Check className="w-6 h-6"/></div>
            <div>
              <div className="text-sm text-forest/60 font-bold mb-1 uppercase tracking-wider">Completed</div>
              <div className="text-4xl font-black tabular-nums tracking-tighter text-forest">{pickups}</div>
            </div>
          </div>
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-forest/5 border border-forest/10 flex flex-col justify-between group hover:border-lime/50 transition-colors">
            <div className="w-12 h-12 rounded-full bg-lime/20 text-forest flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><CalendarCheck className="w-6 h-6"/></div>
            <div>
              <div className="text-sm text-forest/60 font-bold mb-1 uppercase tracking-wider">Active</div>
              <div className="text-4xl font-black tabular-nums tracking-tighter text-forest">{activeBookings}</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* CTA Button */}
      <motion.button
        variants={itemVariants}
        id="tour-main-cta"
        onClick={() => setActiveTab('Browse Food')}
        className="w-full relative group bg-forest text-parchment font-black text-xl py-6 rounded-[2.5rem] overflow-hidden transition-all hover:scale-[1.01] shadow-[0_10px_20px_rgba(28,43,30,0.15)]"
      >
        <span className="relative z-10 flex items-center justify-center gap-3"><Search className="w-6 h-6" /> Find Food Nearby</span>
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-lime/20 z-0"
        />
      </motion.button>

      <motion.div variants={itemVariants} className="bg-white rounded-[3rem] p-8 md:p-10 shadow-xl shadow-forest/5 border border-forest/10">
        <h3 className="text-2xl font-black mb-2 text-forest">My Dietary Restrictions</h3>
        <p className="text-forest/60 font-medium mb-6">Set your allergies to automatically warn you about unsafe food listings.</p>
        <div className="flex flex-wrap gap-3 mb-8">
          {allergyOptions.map(tag => (
            <button key={tag} onClick={() => toggleAllergy(tag)} className={clsx("px-5 py-2.5 rounded-full text-sm font-bold transition-all border", profile.includes(tag) ? "bg-forest text-parchment border-forest shadow-md" : "bg-white text-forest/60 border-forest/10 hover:bg-forest/5 hover:text-forest")}>{tag}</button>
          ))}
        </div>
        <button onClick={handleSaveAllergies} className="bg-lime hover:bg-lime/90 text-forest px-8 py-3 rounded-full font-black transition-colors shadow-sm">Save Profile</button>
      </motion.div>
    </motion.div>
  );
};

const BrowseFoodTab = ({ user, foodListings, addBooking, donors, showToast }) => {
  const [view, setView] = useState('List View');
  const [filter, setFilter] = useState('All Categories');
  const [allergySafe, setAllergySafe] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [allergyWarningSlot, setAllergyWarningSlot] = useState(null);

  const activeFood = foodListings.filter(f => f.status === 'Active');
  
  let displayed = filter === 'All Categories' ? activeFood : activeFood.filter(f => f.category === filter);
  if (allergySafe && user?.allergyProfile?.length > 0) {
    displayed = displayed.filter(f => !f.allergyTags.some(tag => user.allergyProfile.includes(tag)));
  }

  const mockCoords = [
    [3.1390, 101.6869], [3.1415, 101.6912], [3.1350, 101.6820], 
    [3.1450, 101.6980], [3.1300, 101.6800], [3.1500, 101.7000],
    [3.1250, 101.6750], [3.1550, 101.7050]
  ];

  const handleBookSlot = (slot) => {
    const hasConflict = selectedFood.allergyTags.some(t => user?.allergyProfile?.includes(t));
    if (hasConflict) {
      setAllergyWarningSlot(slot);
      return;
    }
    confirmBooking(slot);
  };

  const confirmBooking = (slot) => {
    addBooking({
      id: 'b' + Date.now(),
      receiverId: user.id,
      foodId: selectedFood.id,
      donorId: selectedFood.donorId,
      status: 'Upcoming',
      pickupSlot: slot,
      qrValue: \`FB-\${Date.now()}-\${user.id}\`,
      reviewSubmitted: false
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#bdf259', '#1c2b1e'] });
    showToast('Pickup slot booked successfully!', 'success');
    setSelectedFood(null);
    setAllergyWarningSlot(null);
  };

  return (
    <motion.div variants={{animate: {transition: {staggerChildren: 0.1}}}} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto">
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-forest">Browse Food Nearby</h1>
        <div className="flex bg-white p-1.5 rounded-full border border-forest/10 shadow-sm">
          {['List View', 'Map View'].map(v => (
            <button key={v} onClick={() => setView(v)} className={clsx("px-5 py-2 text-sm font-bold rounded-full relative z-10 transition-colors", view === v ? "text-forest" : "text-forest/60 hover:text-forest")}>
              {v}
              {view === v && <motion.div layoutId="viewToggle" className="absolute inset-0 bg-lime rounded-full shadow-sm -z-10" />}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap gap-3 mb-10">
        {['All Categories', 'Cooked Meal', 'Raw Produce', 'Bakery', 'Canned Goods'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={clsx("px-5 py-2.5 rounded-full text-sm font-bold transition-all border", filter === f ? "bg-forest text-parchment border-forest shadow-md" : "bg-white text-forest/60 border-forest/10 hover:bg-forest/5 hover:text-forest")}>{f}</button>
        ))}
        <button onClick={() => setAllergySafe(!allergySafe)} className={clsx("px-5 py-2.5 rounded-full text-sm font-bold transition-all border flex items-center gap-2 ml-auto", allergySafe ? "bg-lime text-forest border-lime shadow-md" : "bg-white text-forest/60 border-forest/10 hover:bg-forest/5 hover:text-forest")}>
          <ShieldCheck className="w-4 h-4"/> Allergy-Safe Only
        </button>
      </motion.div>

      {view === 'List View' ? (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayed.map(food => (
            <FoodCard key={food.id} food={food} donors={donors} user={user} onBook={() => setSelectedFood(food)} />
          ))}
          {displayed.length === 0 && <div className="col-span-full text-center py-24 text-forest/50 font-bold text-lg bg-white rounded-[3rem] border border-forest/10 border-dashed">No active food listings matching your criteria.</div>}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="h-[600px] rounded-[3rem] overflow-hidden border border-forest/10 shadow-xl shadow-forest/5 relative z-0">
          <MapContainer center={[3.1390, 101.6869]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {displayed.map((food, idx) => {
              const diff = new Date(food.expiry).getTime() - Date.now();
              const color = diff <= 0 ? '#ef4444' : diff < 12 * 3600000 ? '#f59e0b' : '#bdf259';
              return (
              <CircleMarker 
                key={food.id} 
                center={mockCoords[idx % mockCoords.length]} 
                radius={25} 
                pathOptions={{ color: '#1c2b1e', fillColor: color, fillOpacity: 0.8, weight: 3 }}
                className="pulse-marker"
              >
                <Popup className="rounded-2xl overflow-hidden font-sans">
                  <div className="font-black text-forest text-lg mb-1">{food.name}</div>
                  <div className="text-sm text-forest/60 font-bold mb-3">{donors.find(d=>d.id===food.donorId)?.name}</div>
                  <div className="text-xs bg-lime text-forest font-bold px-2 py-1 rounded inline-block mb-3">{food.distance}km away</div>
                  <button onClick={() => setSelectedFood(food)} className="w-full bg-forest text-parchment text-sm font-bold py-2 rounded-xl text-center block hover:scale-105 transition-transform">Book Pickup</button>
                </Popup>
              </CircleMarker>
            )})}
          </MapContainer>
        </motion.div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFood(null)} className="absolute inset-0 bg-forest/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-parchment rounded-[2.5rem] p-8 relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-forest/10 text-forest">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black">Select Pickup Time</h3>
                <button onClick={() => setSelectedFood(null)} className="p-2 hover:bg-forest/10 rounded-full transition-colors"><X className="w-6 h-6"/></button>
              </div>
              
              <div className="space-y-4 mb-8">
                {selectedFood.pickupSlots.map((slot, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleBookSlot(slot)} className="p-5 bg-white border border-forest/10 hover:border-lime rounded-[1.5rem] cursor-pointer flex justify-between items-center group transition-all shadow-sm hover:shadow-md">
                    <div>
                      <div className="font-black text-forest text-lg group-hover:text-lime">{slot.date}</div>
                      <div className="text-sm font-bold text-forest/60">{slot.start} - {slot.end}</div>
                    </div>
                    <Navigation className="text-forest/30 group-hover:text-lime w-6 h-6 transition-colors" />
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-terracotta/10 border border-terracotta/20 rounded-[1.5rem] p-5 flex gap-4 text-terracotta text-sm">
                <span className="text-2xl shrink-0">⚠️</span>
                <p className="font-bold">You must arrive within your selected time slot. Missing your pickup will lower your Trust Score. Repeated misses may result in a temporary ban.</p>
              </div>
            </motion.div>
          </div>
        )}
        {allergyWarningSlot && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAllergyWarningSlot(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-parchment rounded-[3rem] p-8 md:p-10 relative z-10 w-full max-w-sm text-center shadow-2xl border border-forest/10">
              <div className="w-20 h-20 bg-terracotta text-parchment rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-terracotta/30">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black mb-3 text-forest">Allergy Warning</h3>
              <p className="text-forest/70 font-medium mb-8">This food contains ingredients that match your allergy profile. Are you sure you want to book this pickup?</p>
              <div className="flex gap-4">
                <button onClick={() => setAllergyWarningSlot(null)} className="flex-1 py-4 bg-white text-forest border border-forest/10 rounded-full font-black hover:bg-forest/5 transition-colors">Cancel</button>
                <button onClick={() => confirmBooking(allergyWarningSlot)} className="flex-1 py-4 bg-terracotta hover:bg-[#d65140] text-white rounded-full font-black transition-colors shadow-lg">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FoodCard = ({ food, donors, user, onBook }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useInterval(() => {
    const now = new Date().getTime();
    const expiryTime = new Date(food.expiry).getTime();
    const diff = expiryTime - now;
    
    if (diff <= 0) {
      setTimeLeft('Expired');
      setIsUrgent(true);
    } else {
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(\`\${h}h \${m}m left\`);
      setIsUrgent(h < 2);
    }
  }, 1000);

  const donor = donors.find(d => d.id === food.donorId);
  const userAllergies = user?.allergyProfile || [];
  const hasConflict = food.allergyTags.some(t => userAllergies.includes(t)) && !food.allergyTags.includes('None');

  return (
    <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-forest/5 border border-forest/10 hover:-translate-y-2 transition-all duration-300 group flex flex-col h-full">
      <div className="h-48 w-full bg-forest/5 relative overflow-hidden">
        <img src={food.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className={clsx("absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 backdrop-blur-md", isUrgent ? 'bg-terracotta/90 text-white' : 'bg-parchment/90 text-forest')}>
          <Clock className="w-3.5 h-3.5" /> {timeLeft}
        </div>
        <div className="absolute top-4 right-4 bg-lime text-forest px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1">
          <MapPin className="w-3 h-3"/> {food.distance}km
        </div>
      </div>
      <div className="p-6 md:p-8 flex flex-col flex-1">
        <h3 className="font-black text-2xl text-forest mb-2 line-clamp-1">{food.name}</h3>
        
        <div className="flex items-center gap-2 mb-5 text-sm text-forest/60 font-bold">
          <span>By {donor?.name}</span>
          <span className="w-1 h-1 bg-forest/30 rounded-full"></span>
          <span className="text-lime flex items-center gap-1"><Star className="w-3 h-3 fill-lime" /> {donor?.trustScore}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6 mt-auto">
          {food.allergyTags.map(tag => (
            <span key={tag} className={clsx("text-xs px-3 py-1.5 rounded-full font-bold", tag === 'None' ? "bg-forest/5 text-forest/70" : hasConflict && userAllergies.includes(tag) ? "bg-terracotta/10 text-terracotta border border-terracotta/20" : "bg-orange-100 text-orange-800")}>
              {tag === 'None' ? 'Allergy Safe' : tag}
            </span>
          ))}
          {hasConflict && <span className="text-xs text-terracotta font-black w-full mt-2 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Contains allergens</span>}
        </div>

        <button onClick={onBook} className="w-full bg-forest hover:bg-[#152016] text-parchment font-black py-4 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] mt-2">
          Select Pickup Time
        </button>
      </div>
    </div>
  );
};

const MyBookingsTab = ({ user, bookings, cancelBooking, addReview, foodListings, donors, showToast, updateBookingStatus }) => {
  const [scannerModal, setScannerModal] = useState(null);
  const [directionsModal, setDirectionsModal] = useState(null);
  const [reviewModal, setReviewModal] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [directionsRoute, setDirectionsRoute] = useState(null);

  useEffect(() => {
    if (directionsModal) {
      fetch(\`https://router.project-osrm.org/route/v1/walking/\${101.6750},\${3.1250};\${directionsModal[1]},\${directionsModal[0]}?overview=full&geometries=geojson\`)
        .then(res => res.json())
        .then(data => {
          if (data.routes && data.routes[0]) {
             const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
             setDirectionsRoute(coords);
          }
        });
    } else {
      setDirectionsRoute(null);
    }
  }, [directionsModal]);

  const myBookings = bookings.filter(b => b.receiverId === user?.id);
  const upcoming = myBookings.filter(b => b.status === 'Upcoming');
  const past = myBookings.filter(b => b.status !== 'Upcoming');

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    addReview({ id: 'rev'+Date.now(), bookingId: reviewModal, rating, comment, date: new Date().toISOString() });
    showToast('Review submitted. Thank you!', 'success');
    setReviewModal(null); setRating(0); setComment('');
  };

  const handleCancel = (id) => {
    cancelBooking(id);
    showToast('Booking cancelled.', 'info');
  };

  return (
    <motion.div variants={{animate: {transition: {staggerChildren: 0.1}}}} initial="initial" animate="animate" exit="exit" className="max-w-5xl mx-auto">
      <motion.div variants={itemVariants}>
        <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tight text-forest mb-12">My Bookings</h1>
      </motion.div>
      
      <motion.h2 variants={itemVariants} className="text-2xl font-black mb-6 text-forest flex items-center gap-3"><CalendarCheck className="w-6 h-6 text-lime"/> Upcoming Pickups</motion.h2>
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
        {upcoming.map(b => {
          const food = foodListings.find(f => f.id === b.foodId);
          const donor = donors.find(d => d.id === b.donorId);
          return (
            <motion.div key={b.id} whileHover={{ scale: 1.01 }} className="bg-white rounded-[2.5rem] shadow-xl shadow-forest/5 border border-forest/10 flex flex-col sm:flex-row overflow-hidden group">
              <div className="w-full sm:w-40 h-48 sm:h-auto bg-forest/5 shrink-0 relative">
                <img src={food?.imageUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-black text-xl text-forest mb-1 line-clamp-1">{food?.name}</h3>
                <p className="text-sm font-bold text-forest/50 mb-3">{donor?.name}</p>
                <div className="bg-lime text-forest font-black text-sm p-3 rounded-2xl mb-auto flex items-center gap-2">
                  <Clock className="w-4 h-4"/> {b.pickupSlot.date}, {b.pickupSlot.start}
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-5">
                  <button onClick={() => setScannerModal(b.id)} className="flex-1 bg-forest text-parchment text-xs font-black py-3 rounded-xl hover:bg-[#152016] transition-colors">Scan QR</button>
                  <button onClick={() => setDirectionsModal([3.1390, 101.6869])} className="flex-1 bg-lime text-forest text-xs font-black py-3 rounded-xl hover:bg-[#a5db40] transition-colors flex items-center justify-center gap-1"><Navigation className="w-3 h-3"/> Map</button>
                  <button onClick={() => handleCancel(b.id)} className="flex-1 bg-white border border-forest/10 text-terracotta text-xs font-black py-3 rounded-xl hover:bg-terracotta/5 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {upcoming.length === 0 && <div className="col-span-full p-12 text-center border-2 border-dashed border-forest/20 rounded-[3rem] text-forest/50 font-bold bg-white/50">No upcoming pickups right now.</div>}
      </motion.div>

      <motion.h2 variants={itemVariants} className="text-2xl font-black mb-6 border-t border-forest/10 pt-10 text-forest flex items-center gap-3"><Clock className="w-6 h-6 text-forest/40"/> Past Bookings</motion.h2>
      <motion.div variants={itemVariants} className="space-y-4">
        {past.map(b => {
          const food = foodListings.find(f => f.id === b.foodId);
          const donor = donors.find(d => d.id === b.donorId);
          return (
            <div key={b.id} className="bg-white rounded-[2rem] p-5 shadow-sm border border-forest/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:shadow-md transition-shadow">
              <div className="flex items-center gap-5 w-full sm:w-auto">
                <div className={clsx("w-3 h-14 rounded-full shrink-0", b.status === 'Completed' ? "bg-lime" : b.status === 'Missed' ? "bg-terracotta" : "bg-forest/20")} />
                <div>
                  <h3 className="font-black text-lg text-forest">{food?.name}</h3>
                  <p className="text-sm font-bold text-forest/60">{donor?.name} • {b.pickupSlot.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 w-full sm:w-auto pl-8 sm:pl-0">
                <span className={clsx("text-sm font-black px-4 py-2 rounded-full whitespace-nowrap", b.status === 'Completed' ? "bg-lime/20 text-forest" : b.status === 'Missed' ? "bg-terracotta/10 text-terracotta" : "bg-forest/5 text-forest/60")}>{b.status}</span>
                {b.status === 'Completed' && !b.reviewSubmitted && (
                  <button onClick={() => setReviewModal(b.id)} className="text-sm text-forest font-black hover:text-lime whitespace-nowrap transition-colors bg-forest/5 px-4 py-2 rounded-full">Write Review</button>
                )}
                {b.status === 'Completed' && b.reviewSubmitted && (
                  <span className="text-sm text-forest/40 font-black flex items-center gap-1.5 whitespace-nowrap"><Check className="w-4 h-4 text-lime"/> Reviewed</span>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Modals remain mostly identical logically but restyled */}
      <AnimatePresence>
        {scannerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setScannerModal(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="bg-parchment rounded-[3rem] p-8 md:p-10 relative z-10 w-full max-w-sm flex flex-col items-center text-center shadow-2xl border border-forest/10">
               <h3 className="text-2xl font-black mb-2 text-forest">Scan Donor's QR</h3>
               <p className="text-forest/60 font-medium mb-8">Ask the donor to show their pickup QR code.</p>
               <div className="w-full aspect-square bg-[#152016] rounded-[2rem] mb-8 relative overflow-hidden flex items-center justify-center shadow-inner">
                  <div className="absolute inset-0 border-4 border-lime m-6 rounded-2xl opacity-40"></div>
                  <div className="w-full h-1 bg-lime absolute top-1/2 shadow-[0_0_15px_5px_rgba(189,242,89,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  <p className="text-lime/50 font-bold text-sm z-10">Camera active...</p>
               </div>
               <button onClick={() => { 
                 const bId = scannerModal;
                 setScannerModal(null); 
                 updateBookingStatus(bId, 'Completed');
                 showToast('Pickup confirmed! Your food has been successfully claimed.', 'success'); 
               }} className="w-full py-4 bg-lime text-forest font-black rounded-full hover:bg-lime/90 mb-3 transition-colors shadow-sm">Simulate Scan</button>
               <button onClick={() => setScannerModal(null)} className="w-full py-4 bg-white text-forest border border-forest/10 font-black rounded-full hover:bg-forest/5 transition-colors">Close</button>
             </motion.div>
          </div>
        )}
        {directionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDirectionsModal(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="bg-parchment rounded-[3rem] p-6 relative z-10 w-full max-w-lg flex flex-col h-[600px] shadow-2xl border border-forest/10">
               <div className="flex justify-between items-center mb-6 px-4 pt-2">
                 <h3 className="text-2xl font-black text-forest">Directions to Donor</h3>
                 <button onClick={() => setDirectionsModal(null)} className="p-2 hover:bg-forest/10 rounded-full transition-colors text-forest"><X/></button>
               </div>
               <div className="flex-1 rounded-[2rem] overflow-hidden border border-forest/10 relative z-0 shadow-inner">
                  <MapContainer center={[3.1320, 101.6810]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[3.1250, 101.6750]}>
                      <Popup className="font-bold">Your Location</Popup>
                    </Marker>
                    <Marker position={directionsModal}>
                      <Popup className="font-bold text-forest">Donor Location</Popup>
                    </Marker>
                    {directionsRoute ? (
                      <Polyline positions={directionsRoute} color="#1c2b1e" weight={5} />
                    ) : (
                      <Polyline positions={[[3.1250, 101.6750], directionsModal]} color="#bdf259" weight={5} dashArray="10, 10" />
                    )}
                  </MapContainer>
               </div>
             </motion.div>
          </div>
        )}
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewModal(null)} className="absolute inset-0 bg-forest/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-parchment rounded-[3rem] p-8 md:p-10 relative z-10 w-full max-w-md shadow-2xl border border-forest/10">
              <h3 className="text-3xl font-black mb-8 text-forest text-center">Rate your pickup</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="flex justify-center gap-3 mb-8">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className={clsx("w-12 h-12 cursor-pointer transition-all hover:scale-110", (hoverRating || rating) >= star ? "text-lime fill-lime" : "text-forest/10")} />
                  ))}
                </div>
                <textarea required value={comment} onChange={e=>setComment(e.target.value)} placeholder="How was the food and pickup experience?" className="w-full border-2 border-forest/10 rounded-[1.5rem] p-5 outline-none focus:border-lime bg-white mb-8 min-h-[120px] font-medium text-forest placeholder:text-forest/30 transition-colors resize-none shadow-inner" />
                <div className="flex gap-4">
                  <button type="button" onClick={() => setReviewModal(null)} className="flex-1 py-4 bg-white border border-forest/10 text-forest rounded-full font-black hover:bg-forest/5 transition-colors">Cancel</button>
                  <button type="submit" disabled={!rating} className="flex-1 py-4 bg-forest hover:bg-[#152016] text-parchment rounded-full font-black disabled:opacity-50 transition-colors shadow-md">Submit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const TrustScoreTab = ({ user }) => {
  return (
    <motion.div variants={{animate: {transition: {staggerChildren: 0.1}}}} initial="initial" animate="animate" exit="exit" className="max-w-3xl mx-auto">
      <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-heading font-black tracking-tight text-forest mb-16 text-center">Trust Score</motion.h1>
      
      <motion.div variants={itemVariants} className="flex justify-center mb-20">
        <div className="relative w-72 h-72">
           <svg className="w-72 h-72 transform -rotate-90 drop-shadow-2xl">
             <circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-white border-forest/5 shadow-inner drop-shadow-sm" />
             <motion.circle cx="144" cy="144" r="120" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray={120 * 2 * Math.PI} 
               initial={{ strokeDashoffset: 120 * 2 * Math.PI }} animate={{ strokeDashoffset: 120 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} className={user?.trustScore > 70 ? 'text-lime' : user?.trustScore > 40 ? 'text-amber-400' : 'text-terracotta'} strokeLinecap="round" />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="text-7xl font-black text-forest tracking-tighter">{user?.trustScore}</div>
             <div className="text-forest/50 font-black uppercase tracking-[0.2em] text-sm mt-1">Score</div>
           </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-6 mb-16">
        {[
          { label: 'On-Time Pickup Rate', value: 95, color: 'bg-lime' },
          { label: 'Reviews Submitted', value: 60, color: 'bg-forest/80' },
          { label: 'Violations (Missed/Late)', value: 5, color: 'bg-terracotta', isBad: true }
        ].map((bar, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-forest/10 shadow-xl shadow-forest/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-8">
            <span className="font-black text-forest sm:w-56 shrink-0">{bar.label}</span>
            <div className="flex-1 h-4 bg-forest/5 rounded-full overflow-hidden shadow-inner">
              <motion.div initial={{ width: 0 }} animate={{ width: \`\${bar.value}%\` }} transition={{ duration: 1, delay: i * 0.2 }} className={clsx("h-full rounded-full", bar.color)} />
            </div>
            <span className="font-black text-xl tabular-nums w-16 text-right text-forest">{bar.value}%</span>
          </div>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className={clsx("p-8 md:p-10 rounded-[3rem] border-2", user?.trustScore > 70 ? "bg-white border-lime" : user?.trustScore > 40 ? "bg-white border-amber-400" : "bg-terracotta/5 border-terracotta text-terracotta")}>
        <h3 className="font-black text-2xl mb-3 flex items-center gap-3">
          {user?.trustScore > 70 ? <><ShieldCheck className="w-8 h-8 text-lime"/> Great standing! Keep it up.</> : user?.trustScore > 40 ? "Your score needs attention." : "Warning: Account at risk of suspension."}
        </h3>
        <p className={clsx("font-bold text-lg", user?.trustScore > 70 ? "text-forest/60" : "opacity-90")}>Maintain a high score by arriving on time for pickups and submitting reviews. Scores below 30 may result in an automatic ban.</p>
      </motion.div>
    </motion.div>
  );
};

const HistoryTab = ({ user, bookings, foodListings, donors }) => {
  const history = bookings.filter(b => b.receiverId === user?.id && b.status !== 'Upcoming');
  
  return (
    <motion.div variants={{animate: {transition: {staggerChildren: 0.1}}}} initial="initial" animate="animate" exit="exit" className="max-w-4xl mx-auto">
      <motion.h1 variants={itemVariants} className="text-4xl md:text-5xl font-heading font-black tracking-tight text-forest mb-12">History</motion.h1>
      <motion.div variants={itemVariants} className="bg-white rounded-[3rem] shadow-xl shadow-forest/5 border border-forest/10 overflow-hidden">
        {history.map((b, i) => {
          const food = foodListings.find(f => f.id === b.foodId);
          const donor = donors.find(d => d.id === b.donorId);
          return (
            <div key={b.id} className="flex items-center p-6 md:p-8 border-b border-forest/5 last:border-0 hover:bg-forest/5 transition-colors gap-6">
              <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", b.status === 'Completed' ? "bg-lime/20 text-forest" : b.status === 'Missed' ? "bg-terracotta/10 text-terracotta" : "bg-forest/10 text-forest/50")}>
                {b.status === 'Completed' ? <Check className="w-6 h-6"/> : b.status === 'Missed' ? <X className="w-6 h-6"/> : <Clock className="w-6 h-6"/>}
              </div>
              <div className="flex-1">
                <div className="font-black text-xl text-forest mb-1 line-clamp-1">{food?.name}</div>
                <div className="font-bold text-forest/50 text-sm">{donor?.name} • {b.pickupSlot.date}</div>
              </div>
              <div className="text-right flex flex-col items-end shrink-0">
                <span className={clsx("text-xs font-black px-4 py-2 rounded-full mb-2", b.status === 'Completed' ? "bg-lime text-forest" : b.status === 'Missed' ? "bg-terracotta/10 text-terracotta" : "bg-forest/10 text-forest")}>{b.status}</span>
                {b.status === 'Missed' && <span className="text-xs font-black text-terracotta">-5 Points</span>}
              </div>
            </div>
          );
        })}
        {history.length === 0 && <div className="p-16 text-center text-forest/40 font-bold text-xl">No history found.</div>}
      </motion.div>
    </motion.div>
  );
};
`;

fs.writeFileSync('d:/SEM5/foodbridge prototype/foodbridge/src/pages/ReceiverDashboard.jsx', code);
