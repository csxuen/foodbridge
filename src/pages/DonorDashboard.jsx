import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { 
  LayoutDashboard, PlusCircle, Package, Trophy, Ticket, Award, 
  LogOut, MapPin, Search, X, Check, Copy, Crown, Star 
} from 'lucide-react';
import clsx from 'clsx';
import QRCode from 'react-qr-code';
import confetti from 'canvas-confetti';
import UserProfile from '../components/UserProfile';
import SpotlightTour from '../components/SpotlightTour';

// Simple hook for counting up numbers
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
};

export default function DonorDashboard() {
  const { user, logout } = useAuth();
  const { foodListings, addFoodListing, donors, receivers } = useAppData();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('Overview');
  const [profileOpen, setProfileOpen] = useState(false);
  const [tourActive, setTourActive] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('foodbridge_tour_active') === 'true') {
      setTourActive(true);
    }
  }, []);

  const handleCloseTour = () => {
    setTourActive(false);
    localStorage.removeItem('foodbridge_tour_active');
  };

  // Sidebar items
  const sidebarItems = [
    { id: 'Overview', icon: LayoutDashboard },
    { id: 'Donate Food', icon: PlusCircle },
    { id: 'My Donations', icon: Package },
    { id: 'Leaderboard', icon: Trophy },
    { id: 'Vouchers', icon: Ticket },
    { id: 'Certificates', icon: Award },
  ];

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab user={user} setActiveTab={setActiveTab} />;
      case 'Donate Food': return <DonateFoodTab setActiveTab={setActiveTab} addFoodListing={addFoodListing} user={user} showToast={showToast} />;
      case 'My Donations': return <MyDonationsTab foodListings={foodListings} user={user} receivers={receivers} />;
      case 'Leaderboard': return <LeaderboardTab donors={donors} user={user} />;
      case 'Vouchers': return <VouchersTab user={user} />;
      case 'Certificates': return <CertificatesTab user={user} />;
      default: return <OverviewTab user={user} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      {/* SIDEBAR */}
      <div className="w-64 bg-gradient-to-b from-[#1a5c38] to-[#0f1f13] flex flex-col shrink-0 relative z-20">
        <div className="p-6">
          <button onClick={() => setProfileOpen(true)} className="flex items-center gap-3 mb-8 w-full text-left hover:bg-white/5 p-2 rounded-xl transition-colors">
            <div className="w-12 h-12 bg-primary-tint rounded-full flex items-center justify-center font-bold text-primary-dark shrink-0">
              {user?.initials}
            </div>
            <div className="overflow-hidden">
              <div className="font-bold text-[#fafaf8] truncate">{user?.name}</div>
              <div className="text-xs bg-primary-tint text-primary-dark px-2 py-0.5 rounded-full inline-block font-semibold">Donor</div>
            </div>
          </button>

          <nav id="tour-sidebar-nav" className="flex flex-col gap-2 relative">
            {sidebarItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm transition-colors relative z-10",
                  activeTab === item.id ? "text-textDark" : "text-white/55 hover:text-[#fafaf8]"
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.id}
                {activeTab === item.id && (
                  <motion.div
                    layoutId="sidebarActive"
                    className="absolute inset-0 bg-primary-tint rounded-xl -z-10"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-white/10">
          <div className="bg-white/5 rounded-xl p-4 mb-4 flex items-center gap-4">
            <div className="relative w-12 h-12 shrink-0">
               <svg className="w-12 h-12 transform -rotate-90">
                 <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-white/10" />
                 <motion.circle 
                   cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" 
                   strokeDasharray={20 * 2 * Math.PI} 
                   initial={{ strokeDashoffset: 20 * 2 * Math.PI }}
                   animate={{ strokeDashoffset: 20 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="text-white" 
                 />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-white">{user?.trustScore}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-white/55">Trust Score</div>
              <div className="text-sm font-bold text-white">Excellent</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-white/5 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-8 relative hide-scrollbar">
        <div className="max-w-5xl mx-auto h-full">
          {renderContent()}
        </div>
      </div>

      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
      <SpotlightTour active={tourActive} onClose={handleCloseTour} />
    </div>
  );
}

// -------------------------------------------------------------
// TAB COMPONENTS
// -------------------------------------------------------------

const OverviewTab = ({ user, setActiveTab }) => {
  const donations = useCountUp(user?.donationCount || 0);
  const vouchers = useCountUp(user?.vouchers?.length || 0);
  const certificates = useCountUp(user?.certificates?.length || 0);
  const score = useCountUp(user?.trustScore || 0);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-heading font-black">Overview</h1>
      
      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card A: Trust Score */}
        <div id="tour-trust-score" className="md:col-span-2 bg-white rounded-card p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-1">Trust Score</h3>
            <p className="text-gray-500 text-sm mb-4">Your community standing is excellent.</p>
            <div className="text-4xl font-black tabular-nums">{score}/100</div>
          </div>
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
              <motion.circle 
                cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                strokeDasharray={56 * 2 * Math.PI} 
                initial={{ strokeDashoffset: 56 * 2 * Math.PI }}
                animate={{ strokeDashoffset: 56 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className={user?.trustScore > 70 ? 'text-primary' : 'text-amber-500'} 
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-gray-800">
              {score}%
            </div>
          </div>
        </div>

        {/* Card B, C */}
        <div id="tour-stat-cards" className="col-span-2 grid grid-cols-2 gap-6">
          <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Package className="w-5 h-5"/></div>
            <div>
              <div className="text-sm text-gray-500 font-semibold mb-1">Total Donations</div>
              <div className="text-3xl font-black tabular-nums">{donations}</div>
            </div>
          </div>
          <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center mb-4"><Ticket className="w-5 h-5"/></div>
            <div>
              <div className="text-sm text-gray-500 font-semibold mb-1">Vouchers Earned</div>
              <div className="text-3xl font-black tabular-nums">{vouchers}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <motion.button
        id="tour-main-cta"
        onClick={() => setActiveTab('Donate Food')}
        className="w-full relative group bg-primary hover:bg-primary-dark text-white font-bold text-lg py-5 rounded-btn overflow-hidden transition-colors"
      >
        <span className="relative z-10 flex items-center justify-center gap-2"><PlusCircle /> Donate Food Now</span>
        {/* Pulse glow animation */}
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 bg-white/20 z-0"
        />
      </motion.button>

      {/* Recent Activity Card E */}
      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { icon: Check, color: 'text-green-500 bg-green-50', text: 'Pickup completed for Bento Box', time: '2 hours ago' },
            { icon: PlusCircle, color: 'text-blue-500 bg-blue-50', text: 'Listed 15 pieces of Assorted Breads', time: '5 hours ago' },
            { icon: Star, color: 'text-yellow-500 bg-yellow-50', text: 'Received a 5-star review from Ahmad', time: '1 day ago' }
          ].map((item, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * idx }}
              className="flex items-center gap-4"
            >
              <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0", item.color)}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900">{item.text}</div>
                <div className="text-sm text-gray-500">{item.time}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const DonateFoodTab = ({ setActiveTab, addFoodListing, user, showToast }) => {
  const [formData, setFormData] = useState({
    name: '', category: 'Cooked Meal', quantity: '', unit: 'portions', 
    expiry: '', address: '', allergyTags: []
  });
  const [slots, setSlots] = useState([]);
  
  const allergyOptions = ['Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Eggs', 'Soy', 'Vegan-safe', 'None'];

  const toggleAllergy = (tag) => {
    setFormData(prev => ({
      ...prev,
      allergyTags: prev.allergyTags.includes(tag) 
        ? prev.allergyTags.filter(t => t !== tag)
        : [...prev.allergyTags, tag]
    }));
  };

  const addSlot = () => setSlots([...slots, { date: '', start: '', end: '', id: Date.now() }]);
  const removeSlot = (id) => setSlots(slots.filter(s => s.id !== id));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.quantity || !formData.expiry) {
      showToast('Please fill all required fields.', 'warning');
      return;
    }
    if (slots.length === 0) {
      showToast('Please add at least one pickup slot.', 'warning');
      return;
    }

    const expiryTime = new Date(formData.expiry).getTime();
    for (const slot of slots) {
      if (!slot.date || !slot.end) {
        showToast('Please fill all slot dates and times.', 'warning');
        return;
      }
      const slotEnd = new Date(`${slot.date}T${slot.end}`).getTime();
      if (slotEnd >= expiryTime) {
        showToast('Pickup slots must end before the food expiry time.', 'warning');
        return;
      }
    }

    const newFood = {
      id: 'f' + Date.now(),
      donorId: user.id,
      name: formData.name,
      category: formData.category,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      expiry: new Date(formData.expiry).toISOString(),
      allergyTags: formData.allergyTags.length ? formData.allergyTags : ['None'],
      distance: (Math.random() * 5 + 0.5).toFixed(1), // Mock distance
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
      status: 'Active',
      pickupSlots: slots
    };

    addFoodListing(newFood);
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#ffffff', '#dcfce7'] });
    showToast('Food listed successfully!', 'success');
    setActiveTab('My Donations');
  };

  return (
    <motion.div 
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="bg-white rounded-t-3xl shadow-2xl p-8 min-h-screen border-t border-gray-200"
    >
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-3xl font-heading font-black">List Food for Donation</h2>
        <button onClick={() => setActiveTab('Overview')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X /></button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Food Name</label>
            <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" placeholder="e.g., Nasi Lemak" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none">
              {['Cooked Meal', 'Raw Produce', 'Bakery', 'Beverages', 'Canned Goods', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <input type="number" required min="1" value={formData.quantity} onChange={e=>setFormData({...formData, quantity: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
            </div>
            <div className="w-1/3">
              <label className="block text-sm font-semibold mb-2">Unit</label>
              <select value={formData.unit} onChange={e=>setFormData({...formData, unit: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none">
                <option value="portions">portions</option><option value="kg">kg</option><option value="pieces">pieces</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Expiry Date & Time</label>
            <input type="datetime-local" required value={formData.expiry} onChange={e=>setFormData({...formData, expiry: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3">Allergy Tags</label>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map(tag => {
              const isSelected = formData.allergyTags.includes(tag);
              return (
                <motion.button
                  type="button"
                  key={tag}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleAllergy(tag)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-semibold transition-colors border",
                    isSelected ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  )}
                >
                  {tag}
                </motion.button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Pickup Address</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input type="text" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Store address..." />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-semibold">Pickup Slots (Max 3)</label>
            {slots.length < 3 && (
              <button type="button" onClick={addSlot} className="text-primary font-bold text-sm hover:underline flex items-center gap-1">+ Add Time Slot</button>
            )}
          </div>
          <div className="space-y-3">
            <AnimatePresence>
              {slots.map((slot, idx) => (
                <motion.div 
                  key={slot.id} 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="flex gap-3 items-center overflow-hidden"
                >
                  <input type="date" className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex-1 text-sm outline-none focus:border-primary" onChange={e => {
                    const newSlots = [...slots]; newSlots[idx].date = e.target.value; setSlots(newSlots);
                  }} />
                  <input type="time" className="p-3 bg-gray-50 border border-gray-200 rounded-lg w-32 text-sm outline-none focus:border-primary" onChange={e => {
                    const newSlots = [...slots]; newSlots[idx].start = e.target.value; setSlots(newSlots);
                  }} />
                  <span className="font-bold text-gray-400">to</span>
                  <input type="time" className="p-3 bg-gray-50 border border-gray-200 rounded-lg w-32 text-sm outline-none focus:border-primary" onChange={e => {
                    const newSlots = [...slots]; newSlots[idx].end = e.target.value; setSlots(newSlots);
                  }} />
                  <button type="button" onClick={() => removeSlot(slot.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><X className="w-5 h-5"/></button>
                </motion.div>
              ))}
            </AnimatePresence>
            {slots.length === 0 && <p className="text-sm text-gray-500 italic">No slots added. Receivers need a time window to book.</p>}
          </div>
        </div>

        <button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-btn shadow-glow transition-all text-lg hover:scale-[1.01] active:scale-[0.99]">
          List Food for Donation
        </button>
      </form>
    </motion.div>
  );
};

const MyDonationsTab = ({ foodListings, user, receivers }) => {
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Active', 'Claimed', 'Completed', 'Expired'];
  const [selectedQR, setSelectedQR] = useState(null);

  const myFoods = foodListings.filter(f => f.donorId === user?.id);
  const filtered = filter === 'All' ? myFoods : myFoods.filter(f => f.status === filter);

  return (
    <div>
      <h1 className="text-3xl font-heading font-black mb-8">My Donations</h1>
      
      {/* Filters */}
      <div className="flex gap-2 mb-8 bg-white p-1 rounded-full border border-gray-100 shadow-sm w-fit">
        {filters.map(f => (
          <button 
            key={f} onClick={() => setFilter(f)}
            className={clsx("px-5 py-2 rounded-full text-sm font-semibold relative transition-colors z-10", filter === f ? "text-white" : "text-gray-600 hover:text-gray-900")}
          >
            {f}
            {filter === f && (
              <motion.div layoutId="filterPill" className="absolute inset-0 bg-primary rounded-full -z-10" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-card border border-gray-100 p-8 shadow-sm text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300 animate-pulse" />
            <p className="font-bold text-gray-700">No donations found</p>
            <p className="text-sm mt-1">You don't have any donations matching this filter.</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(food => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={food.id}
                className="bg-white rounded-card overflow-hidden shadow-sm border border-gray-100 hover:shadow-glow hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className="h-48 w-full bg-gray-100 relative">
                  <img src={food.imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-sm font-heading italic shadow-sm",
                      food.status === 'Active' ? 'bg-green-100 text-green-700' :
                      food.status === 'Claimed' ? 'bg-amber-100 text-amber-700' :
                      food.status === 'Completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    )}>
                      {food.status}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-1">{food.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{food.quantity} {food.unit} • {food.category}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <span className="font-semibold text-gray-900">Expires:</span> 
                    {new Date(food.expiry).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    {food.status === 'Claimed' && (
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Check className="text-green-500 w-4 h-4"/> 
                        Claimed by Receiver
                      </p>
                    )}
                    {(food.status === 'Claimed' || food.status === 'Active') && (
                      <button 
                        onClick={() => setSelectedQR(food.id)}
                        className="w-full py-2.5 bg-primary-tint text-primary-dark hover:bg-primary hover:text-white font-bold rounded-lg transition-colors text-sm mt-2"
                      >
                        Show QR Code for Pickup
                      </button>
                    )}
                    {food.status === 'Completed' && (
                      <p className="text-sm font-semibold flex items-center gap-2 text-blue-600">
                        <Check className="w-4 h-4"/> 
                        Pickup Completed
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {selectedQR && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQR(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-8 relative z-10 w-full max-w-sm flex flex-col items-center"
            >
              <h3 className="text-xl font-bold mb-2">Pickup Verification</h3>
              <p className="text-gray-500 text-sm text-center mb-6">Let the receiver scan this code when they arrive to complete the pickup.</p>
              <div className="p-4 bg-white border-2 border-gray-100 rounded-xl mb-6 shadow-sm">
                <QRCode value={`FB-pickup-${selectedQR}`} size={200} />
              </div>
              <button onClick={() => setSelectedQR(null)} className="w-full py-3 bg-gray-100 hover:bg-gray-200 font-bold rounded-lg transition-colors">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LeaderboardTab = ({ donors, user }) => {
  const [search, setSearch] = useState('');
  const sortedDonors = [...donors].sort((a,b) => a.rank - b.rank);
  const filtered = sortedDonors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black mb-2">Leaderboard</h1>
          <p className="text-gray-500">See how you rank among other generous donors.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search donors..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary text-sm bg-white" />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {filtered.map((donor, idx) => (
          <motion.div
            key={donor.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={clsx(
              "flex items-center p-4 border-b border-gray-50 last:border-0 transition-colors",
              donor.id === user?.id ? "bg-primary-tint/30" : "hover:bg-gray-50",
              donor.rank === 1 && "bg-yellow-50/20 border-l-4 border-l-yellow-400"
            )}
          >
            <div className="w-12 text-center font-bold text-gray-400">
              {donor.rank === 1 ? <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500 mx-auto" /> : `#${donor.rank}`}
            </div>
            <div className="w-10 h-10 rounded-full bg-primary-tint text-primary-dark flex items-center justify-center font-bold mx-4 shrink-0 text-sm">
              {donor.initials}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className={clsx("font-bold truncate", donor.rank === 1 ? "shimmer-text" : "text-gray-900")}>{donor.name}</span>
              {donor.id === user?.id && <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">You</span>}
            </div>
            <div className="text-right flex items-center gap-6">
               <div className="hidden sm:block text-sm">
                 <div className="font-bold text-gray-900">{donor.donationCount}</div>
                 <div className="text-gray-500 text-xs">Donations</div>
               </div>
               <div className="text-sm w-20 text-right">
                 <div className="font-bold text-primary">{donor.points}</div>
                 <div className="text-gray-500 text-xs">Pts</div>
               </div>
               <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-gray-100" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" 
                      strokeDasharray={20 * 2 * Math.PI} strokeDashoffset={20 * 2 * Math.PI * (1 - donor.trustScore / 100)}
                      className={donor.trustScore > 70 ? 'text-green-500' : 'text-amber-500'} />
                  </svg>
                  <span className="text-[10px] font-bold">{donor.trustScore}</span>
               </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const VouchersTab = ({ user }) => {
  const mockVouchers = [
    { id: 'v1', partner: 'GrabFood', discount: 'RM10 Off Delivery', expiry: '2026-12-31', code: 'GRABFB10', redeemed: false, initials: 'GF' },
    { id: 'v2', partner: 'Jaya Grocer', discount: '5% Off Bill', expiry: '2026-10-31', code: 'JAYA5FB', redeemed: false, initials: 'JG' },
    { id: 'v3', partner: 'Tealive', discount: 'Free Upsize', expiry: '2026-08-31', code: 'TLFBUP', redeemed: true, initials: 'TL' },
  ];

  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id, code) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <h1 className="text-3xl font-heading font-black mb-8">Rewards & Vouchers</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockVouchers.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
            className={clsx(
              "relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex",
              v.redeemed && "opacity-60 grayscale"
            )}
          >
            {/* Dashed line effect */}
            <div className="w-4 flex flex-col justify-between items-center py-2 border-r-2 border-dashed border-gray-200 relative bg-gray-50">
              <div className="w-4 h-4 bg-surface rounded-full absolute -top-2 -left-2 border border-gray-200"></div>
              <div className="w-4 h-4 bg-surface rounded-full absolute -bottom-2 -left-2 border border-gray-200"></div>
            </div>
            
            <div className="flex-1 p-5 relative">
              {v.redeemed && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"><span className="bg-gray-800 text-white font-bold px-4 py-2 rounded-lg transform -rotate-12 uppercase tracking-widest border-2 border-gray-800">Redeemed</span></div>}
              <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 rounded-full bg-primary-tint text-primary-dark flex items-center justify-center font-bold text-sm shrink-0">
                  {v.initials}
                </div>
                <Ticket className="w-5 h-5 text-gray-300" />
              </div>
              <div className="font-bold text-gray-500 text-sm mb-1">{v.partner}</div>
              <div className="text-xl font-black text-gray-900 mb-4">{v.discount}</div>
              <div className="text-xs text-gray-500 mb-4 border-b border-gray-100 pb-4">Valid until {new Date(v.expiry).toLocaleDateString()}</div>
              
              <button 
                disabled={v.redeemed}
                onClick={() => handleCopy(v.id, v.code)}
                className={clsx(
                  "w-full py-2.5 rounded-lg font-bold text-sm flex justify-center items-center gap-2 transition-all",
                  copiedId === v.id ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {copiedId === v.id ? <><Check className="w-4 h-4" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Code</>}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const CertificatesTab = ({ user }) => {
  const mockCerts = [
    { id: 'c1', title: 'Food Hero Q1 2026', dateRange: 'Jan 2026 - Mar 2026', totalDonations: 45, satisfactionScore: 4.8 },
    { id: 'c2', title: 'Community Champion Q4 2025', dateRange: 'Oct 2025 - Dec 2025', totalDonations: 30, satisfactionScore: 4.5 },
  ];

  return (
    <div>
      <h1 className="text-3xl font-heading font-black mb-8">Certificates of Impact</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockCerts.map((cert, i) => (
          <motion.div
            key={cert.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="bg-white rounded-card shadow-sm border border-gray-200 p-8 flex flex-col items-center text-center relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-tint via-primary to-primary-tint"></div>
            <Award className="w-16 h-16 text-yellow-500 mb-4" />
            <h3 className="text-2xl font-heading font-bold mb-1">{cert.title}</h3>
            <p className="text-gray-500 font-medium mb-6">{user?.name}</p>
            
            <div className="w-full bg-gray-50 rounded-xl p-4 mb-6 grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Period</div>
                <div className="font-semibold text-sm">{cert.dateRange}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Donations</div>
                <div className="font-semibold text-sm">{cert.totalDonations}</div>
              </div>
            </div>

            <div className="flex flex-col items-center mb-8 w-full border-t border-gray-100 pt-6">
              <div className="text-sm font-semibold mb-2">Receiver Satisfaction</div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, idx) => (
                   <motion.div 
                     key={idx} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + idx * 0.1 }}
                   >
                     <Star className={clsx("w-6 h-6", idx < Math.floor(cert.satisfactionScore) ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                   </motion.div>
                ))}
              </div>
              <div className="mt-2 text-xs font-bold text-gray-400">{cert.satisfactionScore}/5.0</div>
            </div>

            <button onClick={() => window.print()} className="w-full py-3 bg-white border-2 border-primary text-primary font-bold rounded-btn hover:bg-primary hover:text-white transition-colors">
              Download Certificate
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
