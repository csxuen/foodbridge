import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { foodListings, donors } from '../data/mockData';
import clsx from 'clsx';

export default function LoginPage() {
  const [role, setRole] = useState('Donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const roles = ['Donor', 'Receiver', 'Admin'];
  
  const placeholders = {
    Donor: { email: 'donor@food.com', pass: 'donor123' },
    Receiver: { email: 'receiver@food.com', pass: 'receiver123' },
    Admin: { email: 'admin@food.com', pass: 'admin123' }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(email, password, role);
    
    if (result.success) {
      showToast('Login successful! Welcome back.', 'success');
      navigate(`/${role.toLowerCase()}`);
    } else {
      setIsLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      showToast(result.message, 'error', 'Authentication Failed');
    }
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    // Auto-fill for convenience based on mock requirement
    setEmail(placeholders[selectedRole].email);
    setPassword(placeholders[selectedRole].pass);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-[45%] bg-gradient-to-br from-[#14532d] to-[#166534] flex-col justify-center items-center relative overflow-hidden">
        {/* Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}

        <div className="z-10 text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-primary-dark font-black text-3xl leading-none">F</span>
            </div>
            <span className="font-heading font-black text-4xl text-white tracking-tight">FoodBridge</span>
          </div>
          <p className="text-white/80 text-lg max-w-sm mx-auto text-balance">
            Join the movement to end food waste and support your local community.
          </p>
        </div>

        {/* Floating Cards Demo */}
        <div className="relative w-full max-w-sm h-[300px]">
          {foodListings.slice(0,3).map((card, idx) => (
            <motion.div
              key={card.id}
              className="absolute w-[240px] bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/20"
              style={{
                top: idx === 0 ? '10%' : idx === 1 ? '40%' : '70%',
                left: idx === 0 ? '15%' : idx === 1 ? '50%' : '10%',
                zIndex: 3 - idx
              }}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3 + idx, repeat: Infinity, ease: 'easeInOut' }}
            >
               <div className="flex items-center gap-3">
                 <div className="w-12 h-12 rounded-lg bg-white/20 overflow-hidden shrink-0">
                   <img src={card.imageUrl} alt="" className="w-full h-full object-cover opacity-80" />
                 </div>
                 <div>
                   <div className="text-white font-bold text-sm truncate w-32">{card.name}</div>
                   <div className="text-white/60 text-xs">{card.quantity} {card.unit}</div>
                 </div>
               </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <h2 className="text-3xl font-heading font-black mb-2">Welcome back</h2>
            <p className="text-textMuted">Log in to your account to continue.</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="flex p-1 bg-gray-100 rounded-xl mb-8 relative">
            {roles.map((r) => (
              <button
                key={r}
                onClick={() => handleRoleSelect(r)}
                className={clsx(
                  "flex-1 py-2 text-sm font-semibold rounded-lg relative z-10 transition-colors",
                  role === r ? "text-primary-dark" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {r}
                {role === r && (
                  <motion.div
                    layoutId="loginTab"
                    className="absolute inset-0 bg-white rounded-lg shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <motion.form 
            onSubmit={handleSubmit}
            animate={shake ? { x: [-12, 12, -8, 8, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50/50"
                  placeholder="Enter your email"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-gray-50/50"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-btn shadow-glow transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Authenticating...
                </>
              ) : (
                'Log In'
              )}
            </button>
          </motion.form>

          {/* Helper Text */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Mock Credentials for {role}:</p>
            <p className="font-mono mt-1 text-gray-700 bg-gray-100 py-2 rounded-lg inline-block px-4">
              {placeholders[role].email} / {placeholders[role].pass}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
