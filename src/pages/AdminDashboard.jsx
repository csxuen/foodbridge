import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { 
  Users, Package, CheckCircle, TrendingDown, AlertTriangle, LogOut, 
  Search, ShieldAlert, Flag, BarChart2
} from 'lucide-react';
import clsx from 'clsx';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { weeklyStats } from '../data/mockData';
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

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('Heatmap');
  const [profileOpen, setProfileOpen] = useState(false);

  const tabs = ['Heatmap', 'User Management', 'Donations', 'Trust Rules', 'Reports'];

  return (
    <div className="flex flex-col h-screen bg-surface overflow-hidden">
      {/* NAVBAR */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-black leading-none text-sm">F</span>
          </div>
          <span className="font-heading font-black text-xl tracking-tight text-textDark">FoodBridge</span>
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ml-2">Admin Panel</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setProfileOpen(true)} className="flex items-center gap-2 border-r border-gray-200 pr-4 hover:bg-gray-50 rounded-lg p-1 transition-colors">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-bold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-500">{user?.role}</div>
            </div>
            <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs">
              AD
            </div>
          </button>
          <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* TABS HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 shrink-0 pt-4 flex gap-6 overflow-x-auto hide-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              "pb-4 text-sm font-semibold relative whitespace-nowrap transition-colors",
              activeTab === tab ? "text-primary-dark" : "text-gray-500 hover:text-gray-800"
            )}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />}
          </button>
        ))}
      </div>

      {/* STATS ROW */}
      <div className="bg-surface px-6 pt-6 shrink-0 z-10 relative">
        <StatsRow />
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto p-6 relative">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === 'Heatmap' && <HeatmapTab />}
          {activeTab === 'User Management' && <UserManagementTab />}
          {activeTab === 'Donations' && <DonationsTab />}
          {activeTab === 'Trust Rules' && <TrustRulesTab />}
          {activeTab === 'Reports' && <ReportsTab />}
        </div>
      </div>

      <UserProfile isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}

const StatsRow = () => {
  const { donors, receivers, bookings, foodListings } = useAppData();
  
  const stats = [
    { label: 'Total Users', value: donors.length + receivers.length, icon: Users, color: 'text-blue-500 bg-blue-50', span: true },
    { label: 'Donations', value: foodListings.length, icon: Package, color: 'text-green-500 bg-green-50' },
    { label: 'Success Pickups', value: bookings.filter(b=>b.status==='Completed').length, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-50' },
    { label: 'Food Saved (kg)', value: 12400, icon: TrendingDown, color: 'text-purple-500 bg-purple-50' },
    { label: 'Flagged Users', value: 2, icon: AlertTriangle, color: 'text-red-500 bg-red-50' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, i) => (
        <motion.div 
          key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className={clsx("bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center gap-4", stat.span && "col-span-2 lg:col-span-1")}
        >
          <div className={clsx("w-12 h-12 rounded-lg flex items-center justify-center shrink-0", stat.color)}><stat.icon className="w-6 h-6"/></div>
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-0.5">{stat.label}</div>
            <div className="text-xl font-black tabular-nums">{useCountUp(stat.value).toLocaleString()}</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

const HeatmapTab = () => {
  const [mapType, setMapType] = useState('Donations');
  const types = ['Donations', 'Pickups', 'Violations'];
  
  // Mock data for heatmap
  const getPoints = () => {
    const base = [[3.1390, 101.6869], [3.1415, 101.6912], [3.1350, 101.6820], [3.1450, 101.6980]];
    if(mapType === 'Donations') return base.map(p => ({ pos: p, color: '#16a34a', radius: 20 }));
    if(mapType === 'Pickups') return base.map(p => ({ pos: [p[0]+0.01, p[1]-0.01], color: '#3b82f6', radius: 15 }));
    return [[3.15, 101.7]].map(p => ({ pos: p, color: '#ef4444', radius: 25 }));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 relative z-50">
        <h2 className="font-bold text-gray-800">Live GPS Heatmap</h2>
        <div className="flex flex-wrap bg-white p-1 rounded-lg shadow-sm border border-gray-200 w-full sm:w-auto">
          {types.map(t => (
             <button key={t} onClick={() => setMapType(t)} className={clsx("px-4 py-1.5 text-xs font-bold rounded-md relative z-10", mapType === t ? "text-white" : "text-gray-500")}>
               <span className="relative z-10">{t}</span>
               {mapType === t && <div className={clsx("absolute inset-0 rounded-md z-0", t==='Donations'?'bg-primary':t==='Pickups'?'bg-blue-500':'bg-red-500')} />}
             </button>
          ))}
        </div>
      </div>
      <div className="h-[550px] relative z-0">
        <MapContainer center={[3.1390, 101.6869]} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {getPoints().map((pt, i) => (
            <CircleMarker key={mapType + i} center={pt.pos} radius={pt.radius} pathOptions={{ color: pt.color, fillColor: pt.color, fillOpacity: 0.4 }} className="pulse-marker">
              <Popup>
                <div className="font-bold">{mapType} Heatmap Point</div>
                <div className="text-xs text-gray-500 mt-1">Location: {pt.pos[0].toFixed(4)}, {pt.pos[1].toFixed(4)}</div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      <style>{`
        .pulse-marker { animation: pulseMap 2s infinite alternate; }
        @keyframes pulseMap { from { fill-opacity: 0.3; } to { fill-opacity: 0.6; } }
      `}</style>
    </div>
  );
};

const UserManagementTab = () => {
  const { donors, receivers, setDonors, setReceivers } = useAppData();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  
  // Combine users and add mock status if not present
  const [usersList, setUsersList] = useState([]);
  
  useEffect(() => {
    const d = donors.map(u => ({...u, role: 'Donor', status: u.status || 'Active'}));
    const r = receivers.map(u => ({...u, role: 'Receiver', status: u.status || 'Active'}));
    setUsersList([...d, ...r]);
  }, [donors, receivers]);

  let filtered = filter === 'All' ? usersList : usersList.filter(u => u.role === filter);
  if(search) filtered = filtered.filter(u => u.name.toLowerCase().includes(search.toLowerCase()));

  const handleAction = (id, role, newStatus) => {
    const list = role === 'Donor' ? donors : receivers;
    const setList = role === 'Donor' ? setDonors : setReceivers;
    setList(list.map(u => u.id === id ? { ...u, status: newStatus } : u));
    showToast(`User ${newStatus.toLowerCase()} successfully`, newStatus === 'Active' ? 'success' : newStatus === 'Warned' ? 'warning' : 'error');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50">
        <div className="flex gap-2">
          {['All', 'Donor', 'Receiver'].map(f => (
             <button key={f} onClick={() => setFilter(f)} className={clsx("px-4 py-1.5 rounded-full text-xs font-bold transition-colors border", filter === f ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200")}>{f}</button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search users..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:border-primary outline-none" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Trust Score</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 rounded-tr-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(u => (
              <tr key={u.id} className={clsx("hover:bg-gray-50 transition-colors", u.status === 'Banned' && "opacity-60")}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">{u.initials}</div>
                  <div className="font-bold text-gray-900">{u.name}</div>
                </td>
                <td className="px-6 py-4"><span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase", u.role === 'Donor' ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700")}>{u.role}</span></td>
                <td className="px-6 py-4">
                  <span className={clsx("font-bold tabular-nums", u.trustScore < 40 ? "text-red-500" : u.trustScore < 70 ? "text-amber-500" : "text-green-500")}>{u.trustScore}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase border", u.status === 'Active' ? "bg-green-50 border-green-200 text-green-700" : u.status === 'Warned' ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700")}>{u.status}</span>
                </td>
                <td className="px-6 py-4 flex gap-2">
                  {u.status === 'Active' && (
                    <>
                      <button onClick={() => handleAction(u.id, u.role, 'Warned')} className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-700 rounded text-xs font-bold transition-colors">Warn</button>
                      <button onClick={() => handleAction(u.id, u.role, 'Banned')} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-bold transition-colors">Ban</button>
                    </>
                  )}
                  {u.status !== 'Active' && (
                     <button onClick={() => handleAction(u.id, u.role, 'Active')} className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-bold transition-colors">Restore</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DonationsTab = () => {
  const { foodListings, donors } = useAppData();
  const [filter, setFilter] = useState('All');
  
  const [localFood, setLocalFood] = useState(foodListings.map(f=>({...f, isFlagged: false})));
  
  let displayed = filter === 'All' ? localFood : localFood.filter(f => filter === 'Flagged' ? f.isFlagged : f.status === filter);

  const toggleFlag = (id) => {
    setLocalFood(prev => prev.map(f => f.id === id ? {...f, isFlagged: !f.isFlagged} : f));
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 bg-gray-50 flex gap-2">
         {['All', 'Active', 'Completed', 'Flagged'].map(f => (
             <button key={f} onClick={() => setFilter(f)} className={clsx("px-4 py-1.5 rounded-full text-xs font-bold transition-colors border", filter === f ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200")}>{f}</button>
          ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Food</th>
              <th className="px-6 py-4">Donor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {displayed.map(f => (
              <tr key={f.id} className={clsx("hover:bg-gray-50 transition-colors", f.isFlagged && "border-l-4 border-l-red-500 bg-red-50/20")}>
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-900">{f.name}</div>
                  <div className="text-xs text-gray-500">{f.category}</div>
                </td>
                <td className="px-6 py-4 font-medium">{donors.find(d=>d.id===f.donorId)?.name}</td>
                <td className="px-6 py-4">
                  <span className={clsx("px-2 py-1 rounded text-[10px] font-bold uppercase", f.status === 'Active' ? "bg-green-100 text-green-700" : f.status === 'Completed' ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700")}>{f.status}</span>
                  {f.isFlagged && <span className="ml-2 px-2 py-1 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700">Flagged</span>}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toggleFlag(f.id)} className={clsx("p-2 rounded-lg transition-colors", f.isFlagged ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-600")}><Flag className="w-4 h-4"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TrustRulesTab = () => {
  const { banThreshold, updateBanThreshold, donors, receivers } = useAppData();
  const { showToast } = useToast();
  const [val, setVal] = useState(banThreshold);

  const save = () => {
    updateBanThreshold(val);
    showToast('Trust threshold updated successfully', 'success');
  };

  const atRisk = [...donors, ...receivers].filter(u => u.trustScore < val).sort((a,b)=>a.trustScore-b.trustScore);

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
        <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><ShieldAlert className="text-red-500 w-6 h-6"/> Automated Trust Rules</h2>
        <p className="text-gray-500 text-sm mb-8">Set the threshold score for automatic account suspension.</p>
        
        <div className="mb-10 relative pt-10">
           <div className="absolute top-0 transform -translate-x-1/2 -ml-2 transition-all duration-300" style={{ left: `${val}%` }}>
              <div className="bg-red-500 text-white font-bold px-3 py-1 rounded text-sm relative">
                {val}
                <div className="absolute w-2 h-2 bg-red-500 rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
              </div>
           </div>
           <input type="range" min="0" max="100" value={val} onChange={(e)=>setVal(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500" />
           <div className="flex justify-between text-xs text-gray-400 mt-2 font-bold"><span>0</span><span>100</span></div>
        </div>
        
        <button onClick={save} className="bg-gray-900 hover:bg-black text-white font-bold py-3 px-6 rounded-lg transition-colors">Save Threshold</button>
      </div>

      <h3 className="font-bold text-lg mb-4">Users At Risk (<span className="text-red-500">{atRisk.length}</span>)</h3>
      <div className="space-y-3">
        {atRisk.map(u => (
           <div key={u.id} className="bg-white rounded-lg p-4 border border-red-200 flex justify-between items-center">
             <div>
               <div className="font-bold text-gray-900">{u.name}</div>
               <div className="text-xs text-gray-500 uppercase">{u.email}</div>
             </div>
             <div className="text-right">
               <div className="text-xl font-black text-red-500 tabular-nums">{u.trustScore}</div>
             </div>
           </div>
        ))}
        {atRisk.length === 0 && <div className="text-gray-500 text-sm italic">No users currently below threshold.</div>}
      </div>
    </div>
  );
};

const ReportsTab = () => {
  const data = weeklyStats;
  const pieData = [
    { name: 'Cooked Meal', value: 40, color: '#16a34a' },
    { name: 'Raw Produce', value: 30, color: '#22c55e' },
    { name: 'Bakery', value: 20, color: '#4ade80' },
    { name: 'Canned', value: 10, color: '#86efac' }
  ];

  return (
    <div className="space-y-6" id="reports-section">
      <div className="flex justify-end mb-2">
        <button onClick={() => window.print()} className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors print:hidden">
          Export PDF
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
          <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-gray-400"/> Weekly Donations & Pickups</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="donations" fill="#16a34a" radius={[4,4,0,0]} animationDuration={1500} />
              <Bar dataKey="pickups" fill="#86efac" radius={[4,4,0,0]} animationDuration={1500} delay={200} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80 flex flex-col">
          <h3 className="font-bold mb-4">Food Categories</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" animationDuration={1500}>
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>{d.name}</div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-80">
        <h3 className="font-bold mb-4">Total kg Saved (Cumulative)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
             <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
             <Tooltip cursor={{ stroke: '#16a34a', strokeWidth: 1, strokeDasharray: '5 5' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
             <Line type="monotone" dataKey="kgSaved" stroke="#16a34a" strokeWidth={3} dot={{ fill: '#16a34a', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6 }} animationDuration={2000} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
