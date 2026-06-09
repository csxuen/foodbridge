import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft, Check, Eye, EyeOff, Loader2, MapPin,
  ShieldCheck, PlusCircle, Shield, Trophy, Package,
  Heart, Camera, UploadCloud, X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useAppData } from '../contexts/AppDataContext';
import { useOnboarding } from '../contexts/OnboardingContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const auth = useAuth();
  const toast = useToast();
  const appData = useAppData();

  const {
    currentStep,
    direction,
    role,
    formData,
    nextStep,
    prevStep,
    jumpToStep,
    setRole,
    updateFormData,
    completeOnboarding,
  } = useOnboarding();

  /* ── local UI state ── */
  const [geoLoading,    setGeoLoading]    = useState(false);
  const [emailValid,    setEmailValid]    = useState(null);
  const [showPassword,  setShowPassword]  = useState(false);
  const [formShake,     setFormShake]     = useState(false);
  const [loggingIn,     setLoggingIn]     = useState(false);

  /* ── confetti on step 5 ── */
  useEffect(() => {
    if (currentStep !== 5) return;
    const burst = (x, y) =>
      confetti({ particleCount: 70, spread: 100, origin: { x, y },
        colors: ['#1c2b1e', '#2d9e5f', '#a8e6c1', '#fafaf8', '#f5e6d3'] });
    burst(0.5, 0.4);
    const t1 = setTimeout(() => burst(0.2, 0.5), 300);
    const t2 = setTimeout(() => burst(0.8, 0.5), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [currentStep]);

  /* ── helpers ── */
  const handleRoleClick = (r) => {
    setRole(r);
    setTimeout(nextStep, 500);
  };

  const handleGeo = () => {
    if (!navigator.geolocation) {
      toast.showToast('Geolocation not supported.', 'warning'); return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateFormData({ location: `${pos.coords.latitude.toFixed(4)}° N, ${pos.coords.longitude.toFixed(4)}° E (Detected)` });
        setGeoLoading(false);
        toast.showToast('Location detected!', 'success');
      },
      () => {
        setTimeout(() => {
          updateFormData({ location: '3.1390° N, 101.6869° E (Kuala Lumpur, MY)' });
          setGeoLoading(false);
          toast.showToast('Simulated location loaded!', 'success');
        }, 800);
      }
    );
  };

  const handleEmailBlur = () => {
    setEmailValid(formData.email ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) : null);
  };

  const getStrength = (p) => {
    if (!p) return { score: 0, label: '', color: 'bg-gray-200', text: 'text-gray-400' };
    let s = 0;
    if (p.length >= 8)        s++;
    if (/[0-9]/.test(p))      s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    if (/[A-Z]/.test(p))      s++;
    if (s <= 1) return { score: 1, label: 'Weak',   color: 'bg-red-500',   text: 'text-red-500' };
    if (s === 2) return { score: 2, label: 'Fair',   color: 'bg-amber-500', text: 'text-amber-500' };
    if (s === 3) return { score: 3, label: 'Good',   color: 'bg-blue-500',  text: 'text-blue-500' };
    return           { score: 4, label: 'Strong',  color: 'bg-green-500', text: 'text-green-500' };
  };
  const strength = getStrength(formData.password);

  const criteria = [
    { label: 'At least 8 characters',  met: formData.password.length >= 8 },
    { label: 'One number',             met: /[0-9]/.test(formData.password) },
    { label: 'One special character',  met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => updateFormData({ avatarFile: file, avatarPreviewUrl: reader.result });
    reader.readAsDataURL(file);
  };

  const shake = (msg) => {
    setFormShake(true);
    setTimeout(() => setFormShake(false), 500);
    toast.showToast(msg, 'warning');
  };

  const submitStep3 = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) return shake('Please fill all fields.');
    if (emailValid === false) return shake('Invalid email address.');
    if (strength.score < 3)  return shake('Password is too weak.');
    if (formData.password !== formData.confirmPassword) return shake("Passwords don't match.");
    nextStep();
  };

  const submitStep4 = () => {
    if (!formData.location) return toast.showToast('Please set your location.', 'warning');
    if (role === 'donor' && formData.foodCategories.length === 0)
      return toast.showToast('Select at least one food category.', 'warning');
    completeOnboarding(appData, auth, navigate);
    nextStep();
  };

  const submitStep5 = () => {
    if (!formData.agreedToGuidelines) return toast.showToast('You must agree to the guidelines.', 'warning');
    completeOnboarding(appData, auth);
    nextStep();
  };

  const goToDashboard = async (withTour = false) => {
    setLoggingIn(true);
    const initials = formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'FB';
    const userObj = {
      name: formData.name, initials, email: formData.email,
      role, trustScore: 100, language: formData.language, location: formData.location,
      radiusKm: formData.radiusKm, allergyProfile: role === 'receiver' ? formData.allergyTags : [],
    };
    if (withTour) localStorage.setItem('foodbridge_tour_active', 'true');
    const res = await auth.login(userObj);
    if (res.success) {
      setTimeout(() => navigate(`/${role}`), 50);
    } else {
      setLoggingIn(false);
      toast.showToast('Error entering dashboard.', 'error');
    }
  };

  const toggleCat = (c) => {
    const prev = formData.foodCategories;
    updateFormData({ foodCategories: prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c] });
  };

  const toggleAllergen = (a) => {
    const none = ['None', 'No restrictions'];
    let prev = formData.allergyTags;
    if (none.includes(a)) { updateFormData({ allergyTags: [a] }); return; }
    prev = prev.filter(x => !none.includes(x));
    updateFormData({ allergyTags: prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a] });
  };

  /* ── slide variants ── */
  const variants = {
    enter:  (d) => ({ x: d === 'forward' ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { x: { type: 'spring', stiffness: 260, damping: 26 }, opacity: { duration: 0.2 } } },
    exit:   (d) => ({ x: d === 'forward' ? -80 : 80, opacity: 0, transition: { duration: 0.18 } }),
  };

  const firstName = formData.name?.trim().split(' ')[0] || 'there';
  const previewInitials = formData.name ? formData.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'FB';

  /* ── language options ── */
  const languages = [
    { label: 'English', flag: '🇬🇧' },
    { label: 'Bahasa Malaysia', flag: '🇲🇾' },
    { label: '中文', flag: '🇨🇳' },
  ];

  /* ── orbit emojis ── */
  const orbits = [
    { e: '🥗', r: 72, sp: 7 }, { e: '🍱', r: 90, sp: 11 },
    { e: '🥕', r: 108, sp: 9 }, { e: '🍞', r: 126, sp: 14 },
    { e: '🍛', r: 144, sp: 12 }, { e: '🥭', r: 162, sp: 16 },
  ];

  /* ─────────────────── RENDER ─────────────────── */
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-screen min-h-screen bg-parchment flex flex-col font-body text-forest overflow-x-hidden relative"
    >

      {/* Background orbs */}
      <motion.div animate={{ scale: [1,1.1,1], x:[0,-20,0], y:[0,30,0] }} transition={{ duration: 12, repeat: Infinity, ease:'easeInOut' }}
        className="fixed bottom-[-150px] right-[-150px] w-[500px] h-[500px] rounded-full bg-lime blur-[160px] opacity-[0.18] pointer-events-none z-0"/>
      <motion.div animate={{ scale: [1,1.12,1], x:[0,40,0], y:[0,-30,0] }} transition={{ duration: 14, repeat: Infinity, ease:'easeInOut' }}
        className="fixed top-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-forest/20 blur-[120px] opacity-[0.15] pointer-events-none z-0"/>

      {/* Grain */}
      <svg className="fixed inset-0 w-full h-full opacity-[0.028] pointer-events-none z-50 select-none">
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/></filter>
        <rect width="100%" height="100%" filter="url(#gr)"/>
      </svg>

      {/* Progress line */}
      <div className="fixed top-0 left-0 w-full h-[3px] bg-gray-200/50 z-50">
        <motion.div animate={{ width: `${(currentStep / 5) * 100}%` }} transition={{ type:'spring', stiffness:60, damping:20 }}
          className="h-full bg-forest"/>
      </div>

      {/* Top bar */}
      <div className="fixed top-0 left-0 w-full px-6 py-4 flex justify-between items-center z-40 bg-gradient-to-b from-parchment/80 to-transparent backdrop-blur-[2px]">
        {/* Logo */}
        <Link to="/" className="rounded-full bg-white/60 backdrop-blur border border-white/20 px-3.5 py-1.5 flex items-center gap-2 shadow-sm hover:bg-white/80 transition-colors">
          <div className="w-6 h-6 bg-forest rounded-lg flex items-center justify-center font-bold text-parchment text-xs italic">F</div>
          <span className="font-heading font-black text-sm tracking-tight">FoodBridge</span>
        </Link>

        {/* Step dots */}
        <div className="flex gap-2 items-center">
          {[1,2,3,4,5].map(s => {
            const done   = s < currentStep;
            const active = s === currentStep;
            return (
              <button key={s} onClick={() => done && jumpToStep(s)}
                className={`relative w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all ${done ? 'bg-forest cursor-pointer' : active ? 'bg-forest scale-125' : 'bg-gray-200'}`}>
                {active && <motion.div layoutId="activeDot" className="absolute -inset-1 border border-forest rounded-full" transition={{ type:'spring', stiffness:300, damping:20 }}/>}
                {done   && <Check className="w-1.5 h-1.5 text-parchment" strokeWidth={4}/>}
              </button>
            );
          })}
        </div>

        {/* Sign-in link */}
        <div className="w-28 text-right">
          <Link to="/login" className="text-xs font-semibold text-forest hover:underline">
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Back button */}
      {currentStep > 1 && currentStep < 5 && (
        <div className="fixed left-6 top-[72px] z-40">
          <motion.button whileHover={{ x: -3 }} onClick={prevStep}
            className="flex items-center gap-1.5 text-xs text-forest/60 hover:text-forest font-semibold px-3 py-1.5 rounded-lg hover:bg-white/60 border border-transparent hover:border-gray-200 transition-all">
            <ChevronLeft className="w-4 h-4"/> Back
          </motion.button>
        </div>
      )}

      {/* Skip (step 4) */}
      {currentStep === 4 && (
        <div className="fixed right-6 top-[72px] z-40">
          <button onClick={nextStep} className="text-xs font-semibold text-forest/60 hover:text-forest px-3 py-1.5 rounded-lg hover:bg-white/60 border border-transparent hover:border-gray-200 transition-all">
            Skip for now →
          </button>
        </div>
      )}

      {/* ── Main content ── */}
      <div className="flex-1 flex items-center justify-center px-4 pt-24 pb-10 z-10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div key={currentStep} custom={direction} variants={variants}
            initial="enter" animate="center" exit="exit"
            className="w-full max-w-4xl flex flex-col items-center">

            {/* ═══════════════ STEP 1 — WELCOME ═══════════════ */}
            {currentStep === 1 && (
              <div className="flex flex-col items-center text-center max-w-lg w-full">
                {/* Orbital logo */}
                <div className="relative w-52 h-52 flex items-center justify-center mb-8">
                  <motion.div animate={{ scale:[1,2,1], opacity:[0.5,0,0.5] }} transition={{ duration:3, repeat:Infinity, ease:'easeOut' }}
                    className="absolute w-28 h-28 rounded-full border border-forest/20 bg-lime/10"/>
                  {orbits.map((o, i) => (
                    <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: o.sp, repeat: Infinity, ease:'linear' }}
                      className="absolute flex items-end justify-end"
                      style={{ width: o.r*2, height: o.r*2, borderRadius:'50%' }}>
                      <motion.div animate={{ y:[0,-6,0] }} transition={{ duration:2+i*0.3, repeat:Infinity, ease:'easeInOut' }}
                        className="text-lg select-none" style={{ transform:'translateX(50%)' }}>
                        {o.e}
                      </motion.div>
                    </motion.div>
                  ))}
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:260, damping:20 }}
                    className="relative w-28 h-28 rounded-full bg-forest flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <span className="font-heading font-black text-parchment text-6xl leading-none italic select-none">F</span>
                  </motion.div>
                </div>

                <div className="mb-4">
                  {["Every meal deserves", "a second chance."].map((line, i) => (
                    <motion.p key={i} initial={{ y:30, opacity:0 }} animate={{ y:0, opacity:1 }}
                      transition={{ delay: 0.1 + i*0.12, type:'spring', stiffness:100 }}
                      className="font-heading font-black italic text-4xl sm:text-5xl text-forest leading-tight">
                      {line}
                    </motion.p>
                  ))}
                </div>

                <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.45 }}
                  className="text-forest/60 text-sm max-w-sm mb-8 leading-relaxed">
                  FoodBridge connects surplus food from local donors to communities in need. Let's set up your account.
                </motion.p>

                {/* Language selector */}
                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.55 }} className="mb-8 w-full">
                  <label className="block text-[10px] font-bold text-forest/60 uppercase tracking-wider mb-3 text-center">Choose your language</label>
                  <div className="flex justify-center gap-2">
                    {languages.map(l => {
                      const sel = formData.language === l.label;
                      return (
                        <button key={l.label} onClick={() => updateFormData({ language: l.label })}
                          className={`px-4 py-2 rounded-full text-xs font-bold border flex items-center gap-1.5 transition-all hover:scale-[1.03] ${
                            sel ? 'bg-forest text-parchment border-forest shadow-glow' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>
                          {l.flag} {l.label}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}
                  className="flex flex-col gap-3 w-full max-w-xs">
                  <button onClick={nextStep}
                    className="w-full bg-forest hover:bg-[#111913] text-parchment font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Get Started →
                  </button>
                  <Link to="/login"
                    className="w-full text-center text-forest font-bold py-2.5 rounded-full text-xs hover:bg-gray-100 transition-all">
                    Sign in to existing account
                  </Link>
                </motion.div>
              </div>
            )}

            {/* ═══════════════ STEP 2 — ROLE ═══════════════ */}
            {currentStep === 2 && (
              <div className="flex flex-col items-center w-full max-w-2xl">
                <h2 className="font-heading font-black italic text-4xl text-forest text-center mb-2">How will you use FoodBridge?</h2>
                <p className="text-forest/60 text-sm text-center mb-10 max-w-md">This customises your dashboard, tools, and experience on the platform.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-2">
                  {/* Donor card */}
                  <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => handleRoleClick('donor')}
                    className={`rounded-2xl p-6 border-2 cursor-pointer bg-white relative flex flex-col transition-all ${
                      role === 'donor' ? 'border-forest bg-lime/10 shadow-lg' :
                      role ? 'opacity-55 border-gray-100 scale-95' : 'border-gray-200 hover:shadow-md'}`}>
                    {role === 'donor' && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-forest rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-parchment" strokeWidth={3}/>
                      </div>
                    )}

                    <div className="w-full h-28 flex items-center justify-center mb-6 relative overflow-hidden">
                      <div className="relative w-40 h-20 bg-forest/5 rounded-xl border border-forest/10">
                        {[
                          { e:'🥗', x:'8%',  y:'12%', delay:0   },
                          { e:'🍞', x:'55%', y:'22%', delay:0.3 },
                          { e:'🥭', x:'28%', y:'50%', delay:0.6 },
                        ].map((item, i) => (
                          <motion.div key={i} animate={{ y:[0,-8,0] }} transition={{ duration:2+i*0.3, repeat:Infinity, ease:'easeInOut', delay:item.delay }}
                            className="absolute text-xl" style={{ left:item.x, top:item.y }}>
                            {item.e}
                          </motion.div>
                        ))}
                        <motion.div animate={{ x:[-3,3,-3] }} transition={{ duration:3, repeat:Infinity, ease:'easeInOut' }}
                          className="absolute -bottom-4 right-4 text-3xl">🤝</motion.div>
                      </div>
                    </div>

                    <h3 className="font-heading font-black text-2xl mb-1">Donate Food</h3>
                    <p className="text-forest/60 text-xs mb-4 leading-relaxed">Share surplus meals, ingredients, or bakery stock from your household or business.</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {['🏪 Restaurant','🏠 Household','🎓 Canteen'].map(t => (
                        <span key={t} className="text-[10px] font-semibold bg-lime/30 text-forest px-2.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <ul className="text-xs text-forest/60 space-y-2 border-t border-gray-100 pt-4 mt-auto">
                      {['List in 60 seconds','Earn vouchers & badges','Get tax-exemption certs'].map(b => (
                        <li key={b} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-forest shrink-0" strokeWidth={3}/>{b}</li>
                      ))}
                    </ul>
                  </motion.div>

                  {/* Receiver card */}
                  <motion.div whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={() => handleRoleClick('receiver')}
                    className={`rounded-2xl p-6 border-2 cursor-pointer bg-white relative flex flex-col transition-all ${
                      role === 'receiver' ? 'border-forest bg-lime/10 shadow-lg' :
                      role ? 'opacity-55 border-gray-100 scale-95' : 'border-gray-200 hover:shadow-md'}`}>
                    {role === 'receiver' && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-forest rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-parchment" strokeWidth={3}/>
                      </div>
                    )}

                    <div className="w-full h-28 flex flex-col items-center justify-center mb-6 overflow-hidden">
                      <motion.div animate={{ y:[0,-10,0], rotate:[-2,2,-2] }} transition={{ duration:2.5, repeat:Infinity, ease:'easeInOut' }}
                        className="w-14 h-14 bg-amber-100 border border-amber-300 rounded-xl flex items-center justify-center text-2xl shadow-sm relative">
                        📦
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-forest rounded-full animate-ping"/>
                      </motion.div>
                      <motion.div animate={{ rotate:[-8,8,-8] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                        className="text-3xl mt-2 opacity-60">🤲</motion.div>
                    </div>

                    <h3 className="font-heading font-black text-2xl mb-1">Find Food</h3>
                    <p className="text-forest/60 text-xs mb-4 leading-relaxed">Discover food options nearby and book pick-up slots that work for you.</p>
                    <div className="flex flex-wrap gap-1.5 mb-5">
                      {['👤 Individual','🤝 NGO','🏘️ Community'].map(t => (
                        <span key={t} className="text-[10px] font-semibold bg-lime/30 text-forest px-2.5 py-0.5 rounded-full">{t}</span>
                      ))}
                    </div>
                    <ul className="text-xs text-forest/60 space-y-2 border-t border-gray-100 pt-4 mt-auto">
                      {['Browse map & listings','Book pickups by slot','Allergy-safe filter'].map(b => (
                        <li key={b} className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-forest shrink-0" strokeWidth={3}/>{b}</li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              </div>
            )}

            {/* ═══════════════ STEP 3 — ACCOUNT ═══════════════ */}
            {currentStep === 3 && (
              <div className="w-full flex flex-col md:flex-row gap-8 px-2">
                {/* Live preview card */}
                <div className="hidden md:flex md:w-[36%] flex-col justify-center items-center">
                  <motion.div animate={{ y:[0,-8,0] }} transition={{ duration:4, repeat:Infinity, ease:'easeInOut' }}
                    className="w-full max-w-[240px] bg-white rounded-2xl border border-gray-200/80 shadow-xl p-5 flex flex-col items-center text-center">
                    <div className="relative w-20 h-20 rounded-full border-2 border-forest/20 bg-gray-50 flex items-center justify-center overflow-hidden mb-4 group shadow-inner">
                      {formData.avatarPreviewUrl
                        ? <img src={formData.avatarPreviewUrl} alt="" className="w-full h-full object-cover"/>
                        : <div className="w-full h-full bg-gradient-to-br from-primary/10 to-primary/30 flex items-center justify-center font-bold text-forest text-xl">{previewInitials}</div>
                      }
                      <label className="absolute inset-0 bg-black/40 text-parchment text-[10px] font-bold flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-4 h-4 mb-0.5"/>Change
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                      </label>
                    </div>
                    <h4 className="font-heading font-black text-base text-forest mb-1 truncate max-w-full">{formData.name || 'Your Name'}</h4>
                    <span className="text-[10px] font-bold bg-lime/40 text-forest px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-4">
                      {role === 'donor' ? 'Donor' : 'Receiver'}
                    </span>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2 w-full border border-gray-100">
                      <div className="relative w-8 h-8 shrink-0">
                        <svg className="w-8 h-8 -rotate-90"><circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-gray-100"/>
                          <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={13*2*Math.PI} strokeDashoffset={0} className="text-forest"/></svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-[9px]">100</div>
                      </div>
                      <div className="text-left">
                        <div className="text-[10px] text-forest/60 font-semibold">Trust Score</div>
                        <div className="text-[10px] font-bold text-forest">100/100</div>
                      </div>
                    </div>
                    <div className="text-[9px] text-forest/60 mt-4 italic">This is how others see you</div>
                  </motion.div>
                </div>

                {/* Form */}
                <motion.div animate={formShake ? { x:[-10,10,-7,7,0] } : {}} transition={{ duration:0.4 }}
                  className="flex-1 bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8">
                  <h3 className="font-heading font-black italic text-2xl text-forest mb-6">Create your profile</h3>

                  {/* Photo upload */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {formData.avatarPreviewUrl
                        ? <img src={formData.avatarPreviewUrl} alt="" className="w-full h-full object-cover"/>
                        : <UploadCloud className="w-5 h-5 text-gray-400"/>}
                    </div>
                    <div>
                      <div className="flex gap-2">
                        <label className="bg-forest hover:bg-[#111913] text-parchment font-semibold px-3 py-1.5 rounded-lg text-xs cursor-pointer shadow-sm transition-colors">
                          Add Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload}/>
                        </label>
                        {formData.avatarPreviewUrl && (
                          <button onClick={() => updateFormData({ avatarFile:null, avatarPreviewUrl:'' })}
                            className="border border-gray-200 text-red-500 font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-gray-50 transition-colors">Remove</button>
                        )}
                      </div>
                      <span className="text-[10px] text-forest/60 mt-1 block">Optional</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Full Name</label>
                      <input type="text" placeholder="Your full name" value={formData.name}
                        onChange={e => updateFormData({ name: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all text-sm bg-gray-50/50"/>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Email Address</label>
                        {emailValid !== null && (
                          <span className={`text-[10px] font-semibold flex items-center gap-1 ${emailValid ? 'text-green-600' : 'text-red-500'}`}>
                            {emailValid ? <><Check className="w-3.5 h-3.5"/>Valid</> : <>✗ Invalid</>}
                          </span>
                        )}
                      </div>
                      <input type="email" placeholder="you@email.com" value={formData.email}
                        onBlur={handleEmailBlur} onChange={e => { updateFormData({ email: e.target.value }); setEmailValid(null); }}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all text-sm bg-gray-50/50"/>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
                        <div className="relative">
                          <input type={showPassword ? 'text' : 'password'} placeholder="Min 8 chars" value={formData.password}
                            onChange={e => updateFormData({ password: e.target.value })}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all text-sm bg-gray-50/50 pr-9"/>
                          <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showPassword ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Confirm</label>
                        <input type="password" placeholder="Re-type" value={formData.confirmPassword}
                          onChange={e => updateFormData({ confirmPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all text-sm bg-gray-50/50"/>
                      </div>
                    </div>

                    {formData.password && (
                      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs">
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-forest/60">Strength:</span>
                          <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                        </div>
                        <div className="flex gap-1.5 my-2">
                          {[1,2,3,4].map(i => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= strength.score ? strength.color : 'bg-gray-200'}`}/>)}
                        </div>
                        <div className="space-y-1 text-[10px] mt-2">
                          {criteria.map((c,i) => (
                            <div key={i} className="flex items-center gap-1">
                              <span className={c.met ? 'text-green-600 font-bold' : 'text-gray-300'}>
                                {c.met ? '✓' : '○'}
                              </span>
                              <span className={c.met ? 'text-green-700' : 'text-forest/60'}>{c.label}</span>
                            </div>
                          ))}
                        </div>
                        {formData.confirmPassword && (
                          <div className="border-t border-gray-200/60 pt-2 mt-2 text-[10px] font-bold">
                            {formData.password === formData.confirmPassword
                              ? <span className="text-green-600 flex items-center gap-1"><Check className="w-3.5 h-3.5"/>Passwords match</span>
                              : <span className="text-red-500">✗ Passwords don't match</span>}
                          </div>
                        )}
                      </div>
                    )}


                  </div>

                  <button onClick={submitStep3}
                    className="w-full bg-forest hover:bg-[#111913] text-parchment font-bold py-3 rounded-xl shadow-glow transition-all text-sm hover:scale-[1.01] active:scale-[0.99]">
                    Continue →
                  </button>
                </motion.div>
              </div>
            )}

            {/* ═══════════════ STEP 4 — PREFERENCES ═══════════════ */}
            {currentStep === 4 && (
              <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 md:p-8">
                <h3 className="font-heading font-black italic text-2xl text-forest mb-1">
                  Personalise your experience, {firstName}.
                </h3>
                <p className="text-forest/60 text-xs mb-6">Help {role === 'donor' ? 'receivers know what to expect from you' : 'us find the best food options for you'}.</p>

                <div className="space-y-5 mb-8">
                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      {role === 'donor' ? 'Where do you donate from?' : 'Where are you located?'}
                    </label>
                    <div className="relative">
                      <input type="text" placeholder="e.g. Subang Jaya, Selangor" value={formData.location}
                        onChange={e => updateFormData({ location: e.target.value })}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/40 focus:border-forest transition-all text-sm bg-gray-50/50"/>
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"/>
                    </div>
                    <button onClick={handleGeo} disabled={geoLoading}
                      className="text-[10px] font-bold text-forest hover:text-forest mt-1.5 flex items-center gap-1 transition-colors">
                      {geoLoading ? <Loader2 className="w-3 h-3 animate-spin"/> : '📍'} Use my current location
                    </button>
                  </div>

                  {/* Radius slider */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
                      {role === 'donor' ? 'How far should receivers travel?' : 'How far are you willing to travel?'}
                    </label>
                    <div className="relative pt-8 pb-2">
                      <div className="absolute bg-forest text-parchment text-[10px] font-bold px-2 py-0.5 rounded shadow pointer-events-none"
                        style={{ left:`calc(${(formData.radiusKm-1)*100/19}% - 26px)`, top:0 }}>
                        {formData.radiusKm} km
                        <div className="absolute -bottom-1 left-[calc(50%-3px)] w-1.5 h-1.5 bg-forest rotate-45"/>
                      </div>
                      <input type="range" min="1" max="20" value={formData.radiusKm}
                        onChange={e => updateFormData({ radiusKm: Number(e.target.value) })}
                        className="w-full h-2 rounded-full appearance-none cursor-pointer accent-forest focus:outline-none"
                        style={{ background:`linear-gradient(to right, #1c2b1e 0%, #1c2b1e ${(formData.radiusKm-1)*100/19}%, #e5e7eb ${(formData.radiusKm-1)*100/19}%, #e5e7eb 100%)` }}/>
                    </div>
                  </div>

                  {/* Donor: food categories */}
                  {role === 'donor' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">What food do you typically donate?</label>
                      <div className="flex flex-wrap gap-2">
                        {['🍽️ Cooked Meals','🥬 Raw Produce','🍞 Bakery','☕ Beverages','🥫 Canned Goods','🍱 Packed Meals','🍰 Desserts'].map(c => {
                          const sel = formData.foodCategories.includes(c);
                          return (
                            <button type="button" key={c} onClick={() => toggleCat(c)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sel ? 'bg-forest text-parchment border-forest shadow-sm scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{c}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Allergens */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
                      {role === 'donor' ? 'Common allergens in your food:' : 'Do you have food allergies?'}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(role === 'donor'
                        ? ['🥜 Nuts','🥛 Dairy','🌾 Gluten','🦐 Shellfish','🥚 Eggs','🫘 Soy','✅ None']
                        : ['🥜 Nuts','🥛 Dairy','🌾 Gluten','🦐 Shellfish','🥚 Eggs','🫘 Soy','🌿 Vegan only','✅ No restrictions']
                      ).map(tag => {
                        const cleanTag = tag.slice(tag.indexOf(' ')+1);
                        const noneTag  = role === 'donor' ? 'None' : 'No restrictions';
                        const isNone   = cleanTag === 'None' || cleanTag === 'No restrictions';
                        const sel      = formData.allergyTags.includes(cleanTag) || (isNone && formData.allergyTags.includes(noneTag));
                        const warn     = sel && !isNone && role === 'receiver';
                        return (
                          <button type="button" key={tag}
                            onClick={() => toggleAllergen(isNone ? noneTag : cleanTag)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              warn ? 'bg-red-50 text-red-600 border-red-200 scale-105' :
                              sel  ? 'bg-forest text-parchment border-forest shadow-sm scale-105' :
                                     'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{tag}</button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Donor: frequency */}
                  {role === 'donor' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Donation frequency</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {['📅 Daily','🗓️ Weekly','🔄 Occasionally','💚 Whenever I can'].map(f => {
                          const sel = formData.donationFrequency === f;
                          return (
                            <button type="button" key={f} onClick={() => updateFormData({ donationFrequency: f })}
                              className={`p-2 rounded-xl text-[10px] font-bold border flex flex-col items-center gap-1 transition-all ${sel ? 'bg-lime/30 border-forest text-forest scale-105' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{f}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Receiver: situation */}
                  {role === 'receiver' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">What best describes you?</label>
                      <div className="grid grid-cols-2 gap-2">
                        {['👤 Personal Use','👨‍👩‍👧 Supporting Family','🤝 NGO / Charity','🏘️ Community Group'].map(s => {
                          const sel = formData.situation === s;
                          return (
                            <button type="button" key={s} onClick={() => updateFormData({ situation: s })}
                              className={`p-3 rounded-xl text-xs font-semibold border transition-all ${sel ? 'bg-lime/30 border-forest text-forest' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}>{s}</button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Receiver: referral */}
                  {role === 'receiver' && (
                    <div>
                      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">How did you hear about us?</label>
                      <select value={formData.heardFrom} onChange={e => updateFormData({ heardFrom: e.target.value })}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-forest/40 text-sm bg-white">
                        <option value="">Select…</option>
                        {['Social Media','Friend / Family','University','NGO Partner','Google Search','News Article','Other'].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                  )}
                </div>

                <button onClick={submitStep4}
                  className="w-full bg-forest hover:bg-[#111913] text-parchment font-bold py-3 rounded-xl shadow-glow transition-all text-sm hover:scale-[1.01] active:scale-[0.99]">
                  Continue →
                </button>
              </div>
            )}

            {/* ═══════════════ STEP 5 — CELEBRATION ═══════════════ */}
            {currentStep === 5 && (
              <div className="w-full max-w-xl flex flex-col items-center text-center">
                {/* Check animation */}
                <div className="relative w-44 h-44 flex items-center justify-center mb-6">
                  <motion.div initial={{ scale:0, opacity:1 }} animate={{ scale:2.4, opacity:0 }} transition={{ delay:0.2, duration:2.2, ease:'easeOut' }}
                    className="absolute w-20 h-20 rounded-full border-4 border-forest"/>
                  {[...Array(8)].map((_,i) => {
                    const angle = (i*45*Math.PI)/180;
                    return (
                      <motion.div key={i} initial={{ scale:0, opacity:0, x:0, y:0 }}
                        animate={{ scale:[0,1.2,0], opacity:[0,1,0], x: Math.cos(angle)*72, y: Math.sin(angle)*72 }}
                        transition={{ delay:0.4+i*0.05, duration:1.2, ease:'easeOut' }}
                        className="absolute text-yellow-500 text-xs font-bold">✦</motion.div>
                    );
                  })}
                  <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:220, damping:20 }}
                    className="w-28 h-28 rounded-full bg-forest flex items-center justify-center shadow-lg border-4 border-white z-10">
                    <svg className="w-16 h-16 text-parchment" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <motion.path initial={{ pathLength:0 }} animate={{ pathLength:1 }} transition={{ delay:0.3, duration:0.6, ease:'easeInOut' }}
                        strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </motion.div>
                </div>

                <h1 className="font-heading font-black italic text-4xl text-forest mb-2">You're all set, {firstName}! 🎉</h1>
                <p className="text-forest/60 text-sm mb-6 max-w-sm">
                  {role === 'donor'
                    ? 'Your donor profile is live. Start listing surplus food and earn your first badge today.'
                    : 'Your receiver profile is ready. Browse active listings near you and secure your first slot.'}
                </p>

                {/* Profile card */}
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
                  className="w-full bg-white rounded-2xl border border-gray-200 shadow-md p-5 flex items-center gap-4 text-left mb-6 overflow-hidden">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/10 to-primary/30 border border-forest/20 flex items-center justify-center font-bold text-forest text-lg overflow-hidden shrink-0">
                    {formData.avatarPreviewUrl
                      ? <img src={formData.avatarPreviewUrl} alt="" className="w-full h-full object-cover"/>
                      : previewInitials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-black text-base text-gray-900 truncate">{formData.name}</h4>
                    <div className="flex flex-wrap gap-1.5 items-center mt-1">
                      <span className="text-[9px] font-bold bg-lime/50 text-forest px-2 py-0.5 rounded uppercase tracking-wider">
                        {role === 'donor' ? 'Donor' : 'Receiver'}
                      </span>
                      <span className="text-[10px] text-forest/60">📍 {formData.location ? formData.location.split('(')[0].trim() : 'Location set'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[9px] text-forest/60 block font-semibold">Language</span>
                    <span className="text-[11px] font-bold text-gray-800">{formData.language}</span>
                  </div>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay:1 }}
                  className="grid grid-cols-3 gap-3 w-full mb-8">
                  {(role === 'donor'
                    ? [[PlusCircle,'text-forest','0 Listed','Donations'],[Shield,'text-green-600','Score 100','Reputation'],[Trophy,'text-yellow-500','Rank #—','Leaderboard']]
                    : [[Package,'text-forest','0 Completed','Pickups'],[Shield,'text-green-600','Score 100','Reputation'],[Heart,'text-red-500','Active','Allergy filter']]
                  ).map(([Icon, cls, val, sub], i) => (
                    <div key={i} className="bg-white rounded-xl p-3 border border-gray-150 flex flex-col items-center">
                      <Icon className={`w-4 h-4 ${cls} mb-1`}/>
                      <span className="text-[10px] font-bold text-gray-800">{val}</span>
                      <span className="text-[8px] text-forest/60 mt-0.5">{sub}</span>
                    </div>
                  ))}
                </motion.div>

                {/* What's next chips */}
                <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.2 }}
                  className="w-full text-left bg-gray-50 border border-gray-150 p-4 rounded-2xl mb-8">
                  <h4 className="text-[11px] font-bold text-forest/60 uppercase tracking-wider mb-2.5">Here's what to do next:</h4>
                  <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                    {(role === 'donor'
                      ? ['📋 List your first donation','🏆 Check the leaderboard','🎖️ Earn your first certificate']
                      : ['🗺️ Browse food near you','📅 Book your first pickup','⭐ Complete your allergy profile']
                    ).map(chip => (
                      <span key={chip} className="rounded-full border border-lime bg-white px-3.5 py-1.5 text-xs font-bold text-forest shrink-0 shadow-sm">{chip}</span>
                    ))}
                  </div>
                </motion.div>

                <motion.button onClick={() => goToDashboard(false)} disabled={loggingIn}
                  animate={{ scale:[1,1.03,1] }} transition={{ duration:2, repeat:Infinity, ease:'easeInOut' }}
                  className="w-full max-w-xs bg-forest hover:bg-[#111913] text-parchment font-bold py-3.5 rounded-full shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] mb-3 flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100">
                  {loggingIn ? <><Loader2 className="w-5 h-5 animate-spin" /> Entering...</> : 'Go to My Dashboard →'}
                </motion.button>
                <button onClick={() => goToDashboard(true)} disabled={loggingIn} className="text-xs font-bold text-forest hover:text-forest underline transition-all disabled:opacity-50">
                  Take a quick tour
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      

    </motion.div>
  );
}
