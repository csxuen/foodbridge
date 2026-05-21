import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { 
  LayoutDashboard, Search, CalendarCheck, ShieldCheck, Clock, 
  LogOut, MapPin, X, Check, Star, Navigation
} from 'lucide-react';
import clsx from 'clsx';
import QRCode from 'react-qr-code';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import confetti from 'canvas-confetti';
import UserProfile from '../components/UserProfile';

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

export default function ReceiverDashboard() {
  const { user, logout } = useAuth();
  const { foodListings, bookings, addBooking, cancelBooking, addReview, updateReceiverAllergy, donors, updateBookingStatus } = useAppData();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('Overview');
  const [profileOpen, setProfileOpen] = useState(false);

  const sidebarItems = [
    { id: 'Overview', icon: LayoutDashboard },
    { id: 'Browse Food', icon: Search },
    { id: 'My Bookings', icon: CalendarCheck },
    { id: 'Trust Score', icon: ShieldCheck },
    { id: 'History', icon: Clock },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Overview': return <OverviewTab user={user} updateReceiverAllergy={updateReceiverAllergy} bookings={bookings} showToast={showToast} />;
      case 'Browse Food': return <BrowseFoodTab user={user} foodListings={foodListings} addBooking={addBooking} donors={donors} showToast={showToast} />;
      case 'My Bookings': return <MyBookingsTab user={user} bookings={bookings} cancelBooking={cancelBooking} addReview={addReview} foodListings={foodListings} donors={donors} showToast={showToast} updateBookingStatus={updateBookingStatus} />;
      case 'Trust Score': return <TrustScoreTab user={user} />;
      case 'History': return <HistoryTab user={user} bookings={bookings} foodListings={foodListings} donors={donors} />;
      default: return <OverviewTab user={user} updateReceiverAllergy={updateReceiverAllergy} bookings={bookings} showToast={showToast} />;
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
              <div className="text-xs bg-primary-tint text-primary-dark px-2 py-0.5 rounded-full inline-block font-semibold">Receiver</div>
            </div>
          </button>
          <nav className="flex flex-col gap-2 relative">
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
                {activeTab === item.id && <div className="absolute inset-0 bg-primary-tint rounded-xl -z-10" />}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-white/10">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-sm text-red-400 hover:bg-white/5 w-full transition-colors">
            <LogOut className="w-5 h-5" /> Logout
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
    </div>
  );
}

// -------------------------------------------------------------
// TAB COMPONENTS
// -------------------------------------------------------------

const OverviewTab = ({ user, updateReceiverAllergy, bookings, showToast }) => {
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
    showToast('Allergy profile updated. Food listings will be filtered accordingly.', 'success');
  };

  const toggleAllergy = (tag) => {
    setProfile(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-heading font-black">Receiver Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-4"><Check className="w-5 h-5"/></div>
          <div><div className="text-sm text-gray-500 font-semibold mb-1">Pickups Completed</div><div className="text-3xl font-black tabular-nums">{pickups}</div></div>
        </div>
        <div className="md:col-span-2 bg-white rounded-card p-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div><h3 className="text-lg font-bold mb-1">Trust Score</h3><p className="text-gray-500 text-sm mb-4">Higher scores unlock priority bookings.</p><div className="text-4xl font-black tabular-nums">{score}/100</div></div>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" />
              <motion.circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={40 * 2 * Math.PI} 
                initial={{ strokeDashoffset: 40 * 2 * Math.PI }} animate={{ strokeDashoffset: 40 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} className={user?.trustScore > 70 ? 'text-primary' : 'text-amber-500'} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-lg text-gray-800">
              {score}%
            </div>
          </div>
        </div>
        <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mb-4"><CalendarCheck className="w-5 h-5"/></div>
          <div><div className="text-sm text-gray-500 font-semibold mb-1">Active Bookings</div><div className="text-3xl font-black tabular-nums">{activeBookings}</div></div>
        </div>
      </div>
      <div className="bg-white rounded-card p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold mb-2">My Dietary Restrictions</h3>
        <p className="text-gray-500 text-sm mb-4">Set your allergies to automatically warn you about unsafe food listings.</p>
        <div className="flex flex-wrap gap-2 mb-6">
          {allergyOptions.map(tag => (
            <button key={tag} onClick={() => toggleAllergy(tag)} className={clsx("px-4 py-2 rounded-full text-sm font-semibold transition-colors border", profile.includes(tag) ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}>{tag}</button>
          ))}
        </div>
        <button onClick={handleSaveAllergies} className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded-lg font-bold transition-colors">Save Profile</button>
      </div>
    </div>
  );
};

const BrowseFoodTab = ({ user, foodListings, addBooking, donors, showToast }) => {
  const [view, setView] = useState('List View'); // List View | Map View
  const [filter, setFilter] = useState('All Categories');
  const [allergySafe, setAllergySafe] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null); // For modal
  const [allergyWarningSlot, setAllergyWarningSlot] = useState(null);

  const activeFood = foodListings.filter(f => f.status === 'Active');
  
  let displayed = filter === 'All Categories' ? activeFood : activeFood.filter(f => f.category === filter);
  if (allergySafe && user?.allergyProfile?.length > 0) {
    displayed = displayed.filter(f => !f.allergyTags.some(tag => user.allergyProfile.includes(tag)));
  }

  // Generate mock coords near KL for the map
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
      qrValue: `FB-${Date.now()}-${user.id}`,
      reviewSubmitted: false
    });
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#ffffff'] });
    showToast('Pickup slot booked successfully!', 'success');
    setSelectedFood(null);
    setAllergyWarningSlot(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-heading font-black">Browse Food Nearby</h1>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {['List View', 'Map View'].map(v => (
            <button key={v} onClick={() => setView(v)} className={clsx("px-4 py-1.5 text-sm font-semibold rounded-md relative z-10", view === v ? "text-gray-900" : "text-gray-500")}>
              {v}
              {view === v && <div className="absolute inset-0 bg-white rounded-md shadow-sm -z-10" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {['All Categories', 'Cooked Meal', 'Raw Produce', 'Bakery', 'Canned Goods'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={clsx("px-4 py-2 rounded-full text-sm font-semibold transition-colors border", filter === f ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}>{f}</button>
        ))}
        <button onClick={() => setAllergySafe(!allergySafe)} className={clsx("px-4 py-2 rounded-full text-sm font-semibold transition-colors border flex items-center gap-1 ml-auto", allergySafe ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50")}>
          <ShieldCheck className="w-4 h-4"/> Allergy-Safe Only
        </button>
      </div>

      {view === 'List View' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayed.map(food => (
            <FoodCard key={food.id} food={food} donors={donors} user={user} onBook={() => setSelectedFood(food)} />
          ))}
          {displayed.length === 0 && <div className="col-span-full text-center py-20 text-gray-500">No active food listings matching your criteria.</div>}
        </div>
      ) : (
        <div className="h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
          <MapContainer center={[3.1390, 101.6869]} zoom={13} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
            {displayed.map((food, idx) => {
              const diff = new Date(food.expiry).getTime() - Date.now();
              const color = diff <= 0 ? '#ef4444' : diff < 12 * 3600000 ? '#eab308' : '#16a34a';
              return (
              <CircleMarker 
                key={food.id} 
                center={mockCoords[idx % mockCoords.length]} 
                radius={25} 
                pathOptions={{ color, fillColor: color, fillOpacity: 0.4 }}
                className="pulse-marker"
              >
                <Popup>
                  <div className="font-bold text-base">{food.name}</div>
                  <div className="text-sm text-gray-500 mb-2">{donors.find(d=>d.id===food.donorId)?.name}</div>
                  <div className="text-xs text-primary font-bold mb-2">{food.distance}km away</div>
                  <button onClick={() => setSelectedFood(food)} className="w-full bg-primary text-white text-xs font-bold py-1.5 rounded text-center block hover:bg-primary-dark">Book Pickup</button>
                </Popup>
              </CircleMarker>
            )})}
          </MapContainer>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedFood && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedFood(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Select Pickup Time</h3>
                <button onClick={() => setSelectedFood(null)} className="p-1 hover:bg-gray-100 rounded-full"><X/></button>
              </div>
              
              <div className="space-y-3 mb-6">
                {selectedFood.pickupSlots.map((slot, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => handleBookSlot(slot)} className="p-4 border-2 border-gray-100 hover:border-primary rounded-xl cursor-pointer flex justify-between items-center group transition-colors">
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-primary">{slot.date}</div>
                      <div className="text-sm text-gray-500">{slot.start} - {slot.end}</div>
                    </div>
                    <Navigation className="text-gray-300 group-hover:text-primary w-5 h-5" />
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800 text-sm">
                <span className="text-xl">⚠️</span>
                <p>You must arrive within your selected time slot. Missing your pickup will lower your Trust Score. Repeated misses may result in a temporary ban.</p>
              </div>
            </motion.div>
          </div>
        )}
        {allergyWarningSlot && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setAllergyWarningSlot(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 relative z-10 w-full max-w-sm text-center shadow-2xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Allergy Warning</h3>
              <p className="text-gray-600 text-sm mb-6">This food contains ingredients that match your allergy profile. Are you sure you want to book this pickup?</p>
              <div className="flex gap-3">
                <button onClick={() => setAllergyWarningSlot(null)} className="flex-1 py-3 bg-gray-100 rounded-lg font-bold hover:bg-gray-200">Cancel</button>
                <button onClick={() => confirmBooking(allergyWarningSlot)} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors shadow-sm">Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
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
      setTimeLeft(`${h}h ${m}m remaining`);
      setIsUrgent(h < 2);
    }
  }, 1000);

  const donor = donors.find(d => d.id === food.donorId);
  const userAllergies = user?.allergyProfile || [];
  const hasConflict = food.allergyTags.some(t => userAllergies.includes(t)) && !food.allergyTags.includes('None');

  return (
    <div className="bg-white rounded-card overflow-hidden shadow-sm border border-gray-100 hover:-translate-y-1 transition-transform">
      <div className="h-40 w-full bg-gray-100 relative">
        <img src={food.imageUrl} alt="" className="w-full h-full object-cover" />
        <div className={clsx("absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1", isUrgent ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-800')}>
          <Clock className="w-3 h-3" /> {timeLeft}
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">{food.name}</h3>
          <span className="text-sm font-semibold text-primary flex items-center gap-1"><MapPin className="w-3 h-3"/>{food.distance}km</span>
        </div>
        
        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
          <span>By {donor?.name}</span>
          <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Score {donor?.trustScore}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-5">
          {food.allergyTags.map(tag => (
            <span key={tag} className={clsx("text-xs px-2 py-1 rounded-md font-semibold", tag === 'None' ? "bg-gray-100 text-gray-600" : hasConflict && userAllergies.includes(tag) ? "bg-red-100 text-red-700 border border-red-200" : "bg-orange-50 text-orange-700")}>
              {tag === 'None' ? 'Allergy Safe' : tag}
            </span>
          ))}
          {hasConflict && <span className="text-xs text-red-600 font-bold w-full mt-1">⚠️ Contains your allergens</span>}
        </div>

        <button onClick={onBook} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2.5 rounded-btn transition-colors text-sm">
          Select Pickup Time
        </button>
      </div>
    </div>
  );
};

const MyBookingsTab = ({ user, bookings, cancelBooking, addReview, foodListings, donors, showToast, updateBookingStatus }) => {
  const [scannerModal, setScannerModal] = useState(null);
  const [directionsModal, setDirectionsModal] = useState(null); // stores coordinates [lat, lng]
  const [reviewModal, setReviewModal] = useState(null); // bookingId
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [directionsRoute, setDirectionsRoute] = useState(null);

  useEffect(() => {
    if (directionsModal) {
      fetch(`https://router.project-osrm.org/route/v1/walking/${101.6750},${3.1250};${directionsModal[1]},${directionsModal[0]}?overview=full&geometries=geojson`)
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
    <div>
      <h1 className="text-3xl font-heading font-black mb-8">My Bookings</h1>
      
      <h2 className="text-xl font-bold mb-4">Upcoming Pickups</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {upcoming.map(b => {
          const food = foodListings.find(f => f.id === b.foodId);
          const donor = donors.find(d => d.id === b.donorId);
          return (
            <motion.div key={b.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-card shadow-sm border border-gray-100 flex overflow-hidden">
              <div className="w-32 bg-gray-100 shrink-0"><img src={food?.imageUrl} alt="" className="w-full h-full object-cover" /></div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold mb-1 line-clamp-1">{food?.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{donor?.name}</p>
                <div className="bg-primary-tint text-primary-dark font-bold text-xs p-2 rounded mb-auto">
                  {b.pickupSlot.date}, {b.pickupSlot.start} - {b.pickupSlot.end}
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setScannerModal(b.id)} className="flex-1 bg-gray-900 text-white text-xs font-bold py-2 rounded-lg hover:bg-black transition-colors">Scan QR</button>
                  <button onClick={() => setDirectionsModal([3.1390, 101.6869])} className="flex-1 bg-primary text-white text-xs font-bold py-2 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-1"><Navigation className="w-3 h-3"/> Directions</button>
                  <button onClick={() => handleCancel(b.id)} className="flex-1 bg-red-50 text-red-600 text-xs font-bold py-2 rounded-lg hover:bg-red-100 transition-colors">Cancel</button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {upcoming.length === 0 && <div className="col-span-full p-8 text-center border-2 border-dashed border-gray-200 rounded-xl text-gray-500">No upcoming pickups.</div>}
      </div>

      <h2 className="text-xl font-bold mb-4 border-t border-gray-100 pt-8">Past Bookings</h2>
      <div className="space-y-4">
        {past.map(b => {
          const food = foodListings.find(f => f.id === b.foodId);
          const donor = donors.find(d => d.id === b.donorId);
          return (
            <div key={b.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={clsx("w-3 h-12 rounded-full", b.status === 'Completed' ? "bg-green-500" : b.status === 'Missed' ? "bg-red-500" : "bg-gray-300")} />
                <div>
                  <h3 className="font-bold">{food?.name}</h3>
                  <p className="text-sm text-gray-500">{donor?.name} • {b.pickupSlot.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={clsx("text-sm font-heading italic px-3 py-1 rounded-full", b.status === 'Completed' ? "bg-green-100 text-green-700" : b.status === 'Missed' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700")}>{b.status}</span>
                {b.status === 'Completed' && !b.reviewSubmitted && (
                  <button onClick={() => setReviewModal(b.id)} className="text-sm text-primary font-bold hover:underline">Write Review</button>
                )}
                {b.status === 'Completed' && b.reviewSubmitted && (
                  <span className="text-sm text-gray-400 font-semibold flex items-center gap-1"><Check className="w-4 h-4"/> Reviewed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {scannerModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setScannerModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="bg-white rounded-2xl p-8 relative z-10 w-full max-w-sm flex flex-col items-center text-center">
               <h3 className="text-xl font-bold mb-2">Scan Donor's QR</h3>
               <p className="text-gray-500 text-sm mb-6">Ask the donor to show their pickup QR code.</p>
               <div className="w-full aspect-square bg-gray-900 rounded-xl mb-6 relative overflow-hidden flex items-center justify-center">
                  <div className="absolute inset-0 border-2 border-primary m-4 rounded-lg opacity-50"></div>
                  <div className="w-full h-0.5 bg-primary absolute top-1/2 shadow-[0_0_8px_2px_rgba(22,163,74,0.5)] animate-[scan_2s_ease-in-out_infinite]"></div>
                  <p className="text-white/50 text-sm z-10">Camera active...</p>
               </div>
               <button onClick={() => { 
                 const bId = scannerModal;
                 setScannerModal(null); 
                 updateBookingStatus(bId, 'Completed');
                 showToast('Pickup confirmed! Your food has been successfully claimed.', 'success'); 
               }} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark mb-2">Simulate Scan</button>
               <button onClick={() => setScannerModal(null)} className="w-full py-3 bg-gray-100 font-bold rounded-lg hover:bg-gray-200">Close</button>
             </motion.div>
          </div>
        )}
        {directionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDirectionsModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
             <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} className="bg-white rounded-2xl p-6 relative z-10 w-full max-w-lg flex flex-col h-[500px]">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold">Directions to Donor</h3>
                 <button onClick={() => setDirectionsModal(null)} className="p-1 hover:bg-gray-100 rounded-full"><X/></button>
               </div>
               <div className="flex-1 rounded-xl overflow-hidden border border-gray-200 relative z-0">
                  <MapContainer center={[3.1320, 101.6810]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[3.1250, 101.6750]}>
                      <Popup>Your Location</Popup>
                    </Marker>
                    <Marker position={directionsModal}>
                      <Popup>Donor Location</Popup>
                    </Marker>
                    {directionsRoute ? (
                      <Polyline positions={directionsRoute} color="#3b82f6" weight={5} />
                    ) : (
                      <Polyline positions={[[3.1250, 101.6750], directionsModal]} color="#16a34a" weight={4} dashArray="10, 10" />
                    )}
                  </MapContainer>
               </div>
             </motion.div>
          </div>
        )}
        {reviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setReviewModal(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-6 relative z-10 w-full max-w-md">
              <h3 className="text-xl font-bold mb-6">Rate your pickup</h3>
              <form onSubmit={handleReviewSubmit}>
                <div className="flex justify-center gap-2 mb-6">
                  {[1,2,3,4,5].map(star => (
                    <Star key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} className={clsx("w-10 h-10 cursor-pointer transition-colors", (hoverRating || rating) >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-200")} />
                  ))}
                </div>
                <textarea required value={comment} onChange={e=>setComment(e.target.value)} placeholder="How was the food and pickup experience?" className="w-full border border-gray-200 rounded-lg p-3 outline-none focus:border-primary mb-6 min-h-[100px]" />
                <div className="flex gap-3">
                  <button type="button" onClick={() => setReviewModal(null)} className="flex-1 py-3 bg-gray-100 rounded-lg font-bold">Cancel</button>
                  <button type="submit" disabled={!rating} className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold disabled:opacity-50">Submit</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const TrustScoreTab = ({ user }) => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-heading font-black mb-12 text-center">Trust Score</h1>
      
      <div className="flex justify-center mb-16">
        <div className="relative w-64 h-64">
           <svg className="w-64 h-64 transform -rotate-90 drop-shadow-xl">
             <circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="24" fill="transparent" className="text-gray-100" />
             <motion.circle cx="128" cy="128" r="110" stroke="currentColor" strokeWidth="24" fill="transparent" strokeDasharray={110 * 2 * Math.PI} 
               initial={{ strokeDashoffset: 110 * 2 * Math.PI }} animate={{ strokeDashoffset: 110 * 2 * Math.PI * (1 - (user?.trustScore || 0) / 100) }} transition={{ duration: 1.5, ease: "easeOut" }} className={user?.trustScore > 70 ? 'text-primary' : user?.trustScore > 40 ? 'text-amber-500' : 'text-red-500'} strokeLinecap="round" />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center">
             <div className="text-6xl font-black">{user?.trustScore}</div>
             <div className="text-gray-500 font-semibold uppercase tracking-wider text-sm">Score</div>
           </div>
        </div>
      </div>

      <div className="space-y-6 mb-12">
        {[
          { label: 'On-Time Pickup Rate', value: 95, color: 'bg-green-500' },
          { label: 'Reviews Submitted', value: 60, color: 'bg-blue-500' },
          { label: 'Violations (Missed/Late)', value: 5, color: 'bg-red-500', isBad: true }
        ].map((bar, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between gap-6">
            <span className="font-semibold text-gray-700 w-48 shrink-0">{bar.label}</span>
            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${bar.value}%` }} transition={{ duration: 1, delay: i * 0.2 }} className={clsx("h-full", bar.color)} />
            </div>
            <span className="font-bold tabular-nums w-12 text-right">{bar.value}%</span>
          </div>
        ))}
      </div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={clsx("p-6 rounded-xl border-l-4", user?.trustScore > 70 ? "bg-green-50 border-green-500" : user?.trustScore > 40 ? "bg-amber-50 border-amber-500" : "bg-red-50 border-red-500")}>
        <h3 className="font-bold text-lg mb-1">
          {user?.trustScore > 70 ? "Great standing! Keep it up." : user?.trustScore > 40 ? "Your score needs attention." : "Warning: Account at risk of suspension."}
        </h3>
        <p className="text-sm opacity-80">Maintain a high score by arriving on time for pickups and submitting reviews. Scores below 30 may result in an automatic ban.</p>
      </motion.div>
    </div>
  );
};

const HistoryTab = ({ user, bookings, foodListings, donors }) => {
  const history = bookings.filter(b => b.receiverId === user?.id && b.status !== 'Upcoming');
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-heading font-black mb-8">History</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {history.map((b, i) => {
          const food = foodListings.find(f => f.id === b.foodId);
          const donor = donors.find(d => d.id === b.donorId);
          return (
            <div key={b.id} className="flex items-center p-5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors gap-4">
              <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", b.status === 'Completed' ? "bg-green-100 text-green-600" : b.status === 'Missed' ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600")}>
                {b.status === 'Completed' ? <Check/> : b.status === 'Missed' ? <X/> : <Clock/>}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">{food?.name}</div>
                <div className="text-sm text-gray-500">{donor?.name} • {b.pickupSlot.date}</div>
              </div>
              <div className="text-right flex flex-col items-end">
                <span className={clsx("text-xs font-bold px-3 py-1 rounded-full mb-1", b.status === 'Completed' ? "bg-green-100 text-green-700" : b.status === 'Missed' ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700")}>{b.status}</span>
                {b.status === 'Missed' && <span className="text-xs font-bold text-red-500">-5 Points</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
