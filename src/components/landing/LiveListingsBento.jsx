import { motion } from 'framer-motion';
import { ArrowUpRight, Smile } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function LiveListingsBento() {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const handleBentoNavigation = (targetTab, defaultPath = '/register') => {
    if (user) {
      if (role === 'donor') navigate('/donor');
      else if (role === 'receiver') navigate(`/receiver?tab=${targetTab}`);
      else navigate('/admin');
    } else {
      navigate(defaultPath);
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <section className="py-8 px-6 md:px-12 overflow-hidden -mt-32 lg:-mt-56 relative z-30">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
      >
        
        {/* Column 1 */}
        <div className="flex flex-col gap-4 pt-0">
          <motion.div 
            variants={itemVariants} 
            onClick={() => handleBentoNavigation('Browse Food', '/login')}
            className="bg-forest text-parchment rounded-[2.5rem] p-8 h-80 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          >
            <div>
              <h3 className="font-display text-5xl mb-4">65%</h3>
              <p className="font-sans text-sm opacity-80 leading-relaxed text-balance">
                12 Thousand kg of surplus food rescued, preventing greenhouse gas emissions. FoodBridge thrives.
              </p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span className="font-sans text-sm font-semibold">Claim now</span>
              <div className="w-10 h-10 rounded-full bg-lime text-forest flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-[#111913] text-parchment rounded-[2.5rem] p-8 h-40 flex items-center justify-between hover:scale-[1.02] transition-transform duration-300">
            <Smile className="w-12 h-12 opacity-80" strokeWidth={1.5} />
            <h3 className="font-display text-2xl text-right leading-tight max-w-[120px]">
              Let them be heard
            </h3>
          </motion.div>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-4 lg:pt-32">
          <motion.div variants={itemVariants} className="relative rounded-[2.5rem] overflow-hidden h-[22rem] hover:scale-[1.02] transition-transform duration-300 group">
            <img 
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80" 
              alt="Community health" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <span className="absolute top-6 left-6 font-syne text-xs uppercase tracking-wider text-parchment/80">Local</span>
            <h3 className="absolute bottom-8 left-6 right-6 font-display text-2xl text-parchment leading-tight">
              Fresh Produce for 200 families in Petaling Jaya
            </h3>
          </motion.div>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-4 lg:pt-56">
          <motion.div 
            variants={itemVariants} 
            onClick={() => {
              if (user) {
                if (role === 'donor') navigate('/donor?tab=Donate');
                else if (role === 'receiver') navigate('/receiver');
                else navigate('/admin');
              } else {
                navigate('/register');
              }
            }}
            className="bg-[#E5E8E0] text-forest rounded-[2.5rem] p-8 h-64 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          >
            <h3 className="font-display text-4xl leading-tight text-balance">
              Join 5000+ People Donate
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-sans text-sm font-medium">Join community</span>
              <div className="w-10 h-10 rounded-full bg-forest text-parchment flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Column 4 */}
        <div className="flex flex-col gap-4 lg:pt-24">
          <motion.div variants={itemVariants} className="relative rounded-[2.5rem] overflow-hidden h-[26rem] hover:scale-[1.02] transition-transform duration-300 group">
            <img 
              src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80" 
              alt="Children smiling" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter grayscale mix-blend-multiply bg-forest/20"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/20 to-transparent" />
            <span className="absolute top-6 left-6 font-syne text-xs uppercase tracking-wider text-parchment/80">Community</span>
            <h3 className="absolute bottom-8 left-6 right-6 font-display text-2xl text-parchment leading-tight">
              Sponsor meals for local shelters
            </h3>
          </motion.div>
        </div>

        {/* Column 5 */}
        <div className="flex flex-col gap-4 pt-0">
          <motion.div 
            variants={itemVariants} 
            onClick={() => handleBentoNavigation('Browse Food', '/login')}
            className="bg-lime text-forest rounded-[2.5rem] p-8 h-64 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
          >
            <div className="relative z-10 flex flex-col h-full justify-between w-full">
              <div />
              <div className="flex items-center justify-between mt-auto w-full">
                <span className="font-sans text-sm font-bold">Explore more</span>
                <div className="w-10 h-10 rounded-full bg-forest text-parchment flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-forest text-parchment rounded-[2.5rem] p-8 h-48 flex flex-col justify-end hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden">
            <div className="absolute top-6 left-6 w-8 h-8 rounded-full border-2 border-lime flex items-center justify-center">
               <div className="w-4 h-4 bg-lime rounded-full" />
            </div>
            <h3 className="font-display text-3xl leading-tight">
              Your home for surplus
            </h3>
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
}
