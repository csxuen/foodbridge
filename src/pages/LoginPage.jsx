import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, X, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { foodListings } from '../data/mockData';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [role, setRole] = useState('Donor');
  const [email, setEmail] = useState('donor@food.com');
  const [password, setPassword] = useState('donor123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Admin modal
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('admin@food.com');
  const [adminPassword, setAdminPassword] = useState('admin123');
  const [adminLoading, setAdminLoading] = useState(false);

  const roles = ['Donor', 'Receiver'];
  const credentials = {
    Donor:    { email: 'donor@food.com',    pass: 'donor123' },
    Receiver: { email: 'receiver@food.com', pass: 'receiver123' },
  };

  const handleRoleSwitch = (r) => {
    setRole(r);
    setEmail(credentials[r].email);
    setPassword(credentials[r].pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await login(email, password, role);
    if (result.success) {
      showToast('Welcome back!', 'success');
      navigate(`/${role.toLowerCase()}`);
    } else {
      setIsLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast(result.message || 'Invalid credentials', 'error', 'Authentication Failed');
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    const result = await login(adminEmail, adminPassword, 'Admin');
    if (result.success) {
      showToast('Welcome, Admin!', 'success');
      navigate('/admin');
    } else {
      setAdminLoading(false);
      showToast('Invalid admin credentials', 'error', 'Authentication Failed');
    }
  };

  // Floating card data (3 food listings for left panel)
  const floatingCards = foodListings.slice(0, 3);

  return (
    <div className="flex min-h-screen bg-[#fafaf8] font-body overflow-hidden">

      {/* ─── LEFT DECORATIVE PANEL ─── */}
      <div className="hidden lg:flex w-[46%] bg-gradient-to-br from-[#0f2e1c] via-[#1a5c38] to-[#14532d] flex-col justify-between relative overflow-hidden shrink-0 p-10">

        {/* Grain texture */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none">
          <filter id="grain-l">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch"/>
          </filter>
          <rect width="100%" height="100%" filter="url(#grain-l)"/>
        </svg>

        {/* Orbs */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], x: [0, 30, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-[#2d9e5f] blur-[120px] opacity-30 pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-[#a8e6c1] blur-[100px] opacity-20 pointer-events-none"
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-heading font-black text-[#1a5c38] text-2xl leading-none italic">F</span>
            </div>
            <span className="font-heading font-black text-white text-2xl tracking-tight">FoodBridge</span>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 flex flex-col gap-8">
          <div>
            <h2 className="font-heading font-black text-white text-4xl leading-tight mb-3 italic">
              Every meal<br/>deserves a<br/>second chance.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Join hundreds of donors and receivers making food rescue happen every day across Malaysia.
            </p>
          </div>

          {/* Floating food cards */}
          <div className="relative h-52">
            {floatingCards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: [0, idx % 2 === 0 ? -10 : -6, 0],
                }}
                transition={{
                  opacity: { delay: idx * 0.15, duration: 0.5 },
                  y: { duration: 3 + idx * 0.7, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.4 },
                }}
                className="absolute w-[200px] bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/15 shadow-xl"
                style={{
                  top:  idx === 0 ? '0%' : idx === 1 ? '38%' : '68%',
                  left: idx === 0 ? '5%' : idx === 1 ? '45%' : '10%',
                  zIndex: 3 - idx,
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-white/20 overflow-hidden shrink-0">
                    <img src={card.imageUrl} alt="" className="w-full h-full object-cover opacity-90"/>
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-bold text-xs truncate">{card.name}</div>
                    <div className="text-white/55 text-[10px] mt-0.5">{card.quantity} {card.unit}</div>
                    <div className="text-[#a8e6c1] text-[10px] font-semibold">{card.distance} km away</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom stat strip */}
        <div className="relative z-10 flex gap-8 pt-6 border-t border-white/10">
          {[['2,400+', 'Meals rescued'], ['180+', 'Active donors'], ['92%', 'Pickup rate']].map(([val, label]) => (
            <div key={label}>
              <div className="font-heading font-black text-white text-xl">{val}</div>
              <div className="text-white/50 text-[11px] mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── RIGHT SIGN-IN PANEL ─── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">

        {/* Subtle background orb */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-[#a8e6c1] blur-[120px] opacity-20 pointer-events-none"
        />

        <div className="w-full max-w-md relative z-10">

          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#1a5c38] rounded-lg flex items-center justify-center">
              <span className="font-heading font-black text-white text-base leading-none italic">F</span>
            </div>
            <span className="font-heading font-black text-[#1a5c38] text-xl tracking-tight">FoodBridge</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-heading font-black text-3xl text-textDark mb-1">Welcome back</h1>
            <p className="text-textMuted text-sm mb-8">
              New here?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Create an account →
              </Link>
            </p>

            {/* Role Selector */}
            <div className="flex p-1 bg-gray-100 rounded-xl mb-6 relative">
              {roles.map((r) => (
                <button
                  key={r}
                  onClick={() => handleRoleSwitch(r)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors ${
                    role === r ? 'text-primary-dark' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {r === 'Donor' ? '🏪 Donor' : '👤 Receiver'}
                  {role === r && (
                    <motion.div
                      layoutId="loginTabIndicator"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Login Form */}
            <motion.form
              onSubmit={handleSubmit}
              animate={shake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all bg-gray-50/50 text-sm pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin"/> Authenticating...</>
                ) : (
                  <><span>Sign In</span><ArrowRight className="w-4 h-4"/></>
                )}
              </button>
            </motion.form>

            {/* Demo credentials hint */}
            <div className="mt-5 p-3.5 bg-gray-50 rounded-xl border border-gray-100 text-center">
              <p className="text-[10px] font-bold text-textMuted uppercase tracking-wider mb-1.5">Demo Credentials</p>
              <p className="font-mono text-xs text-gray-700 bg-white py-1.5 px-3 rounded-lg inline-block border border-gray-100">
                {credentials[role].email} / {credentials[role].pass}
              </p>
            </div>

            {/* Admin access */}
            <p className="mt-6 text-center text-xs text-textMuted">
              Joining as admin?{' '}
              <button
                onClick={() => setAdminOpen(true)}
                className="text-primary font-bold hover:underline"
              >
                Admin access
              </button>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ─── ADMIN MODAL ─── */}
      <AnimatePresence>
        {adminOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdminOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-2xl p-6 relative z-10 w-full max-w-sm shadow-2xl border border-gray-100"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-black italic text-2xl text-[#1a5c38]">Admin Login</h3>
                <button
                  onClick={() => setAdminOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm bg-gray-50/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-sm bg-gray-50/50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full bg-[#1a5c38] hover:bg-[#0f2e1c] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {adminLoading ? <><Loader2 className="w-4 h-4 animate-spin"/> Authenticating...</> : 'Authenticate'}
                </button>
              </form>

              <div className="mt-4 p-2.5 bg-gray-50 rounded-lg text-center text-[10px] text-textMuted border border-gray-100">
                <span className="font-bold">Credential:</span> admin@food.com / admin123
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
