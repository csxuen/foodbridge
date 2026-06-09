import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Loader2, X, ArrowRight, Hexagon, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="min-h-screen w-full bg-parchment flex flex-col lg:flex-row font-sans selection:bg-lime/30 selection:text-forest overflow-hidden relative"
    >
      
      {/* ─── LEFT SIDE: SMALLER IMAGE WITH CUSTOM TICKET CROP ─── */}
      <div className="w-full lg:w-[45%] p-4 lg:py-12 lg:pl-16 xl:py-16 xl:pl-32 lg:pr-4 h-[350px] lg:h-auto flex flex-col relative z-20 order-2 lg:order-1">
        
        {/* Short Floating Back Button (Desktop) */}
        <Link to="/" className="absolute top-10 left-10 xl:left-24 z-50 hidden lg:flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-[#507255] hover:bg-white hover:scale-105 transition-all">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Link>

        {/* The weird shape crop container (Ticket style) */}
        <div className="w-full h-full relative overflow-hidden bg-forest rounded-[2.5rem] isolate">
          <img 
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000" 
            alt="Community donation" 
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a3f2d]/80 via-transparent to-transparent mix-blend-multiply" />
          
          {/* Top-Left Bite Cutout */}
          <div className="absolute -top-4 -left-4 w-28 h-28 bg-parchment rounded-br-[3rem] z-10 pointer-events-none origin-top-left scale-[1.05]" />
          
          {/* Bottom-Right Bite Cutout */}
          <div className="absolute -bottom-4 -right-4 w-36 h-36 bg-parchment rounded-tl-[4rem] z-10 pointer-events-none origin-bottom-right scale-[1.05]" />

          <div className="absolute bottom-12 left-10 right-10 text-white hidden sm:block z-20">
            <h2 className="font-display font-bold text-3xl leading-tight mb-2 drop-shadow-lg">
              Share what you can.<br/>Take what you need.
            </h2>
          </div>
        </div>
      </div>

      {/* ─── RIGHT SIDE: CLEAN BEIGE FORM ─── */}
      <div className="w-full lg:w-[55%] p-8 lg:p-12 lg:pl-10 xl:py-16 xl:pl-12 xl:pr-32 flex flex-col justify-center bg-parchment relative z-30 order-1 lg:order-2 overflow-y-auto hide-scrollbar">
        
        {/* Short Floating Back Button (Mobile) */}
        <Link to="/" className="lg:hidden self-start mb-8 flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur-md rounded-full shadow-sm text-[#507255] hover:bg-white hover:scale-105 transition-all">
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Link>

        {/* Brand / Logo Removed */}

        {/* Top right admin / demo toggle */}
        <div className="absolute top-24 right-8 lg:top-24 lg:right-12 text-right hidden sm:block">
           <button
            onClick={() => setAdminOpen(true)}
            className="text-[10px] text-forest/40 hover:text-forest transition-colors uppercase tracking-widest flex items-center gap-1 font-bold ml-auto mb-2"
          >
            Admin Access <ArrowRight className="w-3 h-3" />
          </button>
          <div className="text-[10px] font-mono text-forest/50 bg-white px-3 py-1.5 rounded-lg border border-forest/5 inline-block">
            Demo: {credentials[role].email}
          </div>
        </div>

        <div className="max-w-[400px] w-full mx-auto mt-4 lg:mt-0">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="font-display font-black text-4xl text-forest mb-3">Welcome Back</h1>
            <p className="font-sans text-forest/60 font-medium text-sm">Sign in to continue your food rescue journey.</p>
          </div>

          {/* Role Tabs */}
          <div className="flex gap-6 mb-8 border-b border-forest/10">
            {roles.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRoleSwitch(r)}
                className={`pb-3 text-sm font-bold transition-all relative ${
                  role === r ? 'text-[#507255]' : 'text-forest/40 hover:text-forest/70'
                }`}
              >
                {r}
                {role === r && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#507255]"
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-forest/70 uppercase tracking-widest mb-1.5 ml-1">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white border border-forest/5 focus:border-[#507255] rounded-xl px-4 py-3.5 text-forest placeholder:text-forest/30 outline-none transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-forest/70 uppercase tracking-widest mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-forest/5 focus:border-[#507255] rounded-xl px-4 py-3.5 text-forest placeholder:text-forest/30 outline-none transition-all pr-12 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest/40 hover:text-[#507255] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="w-4 h-4 rounded border border-forest/20 group-hover:border-[#507255] flex items-center justify-center transition-colors bg-white">
                  <div className="w-2 h-2 bg-transparent group-hover:bg-[#507255]/50 rounded-sm transition-colors" />
                </div>
                <span className="text-xs font-bold text-forest/70 group-hover:text-[#507255] transition-colors">Remember me</span>
              </label>
              <button type="button" className="text-xs font-bold text-[#507255] hover:text-[#3d5941] underline transition-colors">
                Forgot Password?
              </button>
            </div>

            <div className="pt-6 relative z-50">
              <motion.button
                animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
                transition={{ duration: 0.4 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#507255] hover:bg-[#3d5941] text-white font-bold py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : 'Sign In'}
              </motion.button>
              
              <p className="text-sm text-center text-forest/60 mt-6 font-medium">
                Don't have an account?{' '}
                <Link to="/register" className="text-[#507255] font-bold hover:underline transition-all relative z-50">
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
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
              className="absolute inset-0 bg-forest/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="bg-white rounded-[2rem] p-8 relative z-10 w-full max-w-sm shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-display text-2xl text-forest">Admin Access</h3>
                <button
                  onClick={() => setAdminOpen(false)}
                  className="p-2 hover:bg-forest/5 rounded-full text-forest/40 hover:text-forest transition-colors"
                >
                  <X className="w-5 h-5"/>
                </button>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-forest/60 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-parchment/50 border border-forest/10 focus:border-forest focus:bg-white rounded-xl px-4 py-3 text-forest outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-forest/60 uppercase tracking-widest mb-2 ml-1">Password</label>
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-parchment/50 border border-forest/10 focus:border-forest focus:bg-white rounded-xl px-4 py-3 text-forest outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={adminLoading}
                  className="w-full bg-forest hover:bg-[#111913] text-parchment font-bold py-3.5 rounded-xl shadow-glow transition-all mt-4 disabled:opacity-70"
                >
                  {adminLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto"/> : 'Authenticate'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

