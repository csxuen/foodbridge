import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function HowItWorks() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const steps = [
    {
      num: "1",
      title: "List Excess Food",
      desc: "Restaurants and donors easily snap a photo, add details like expiry and allergies, and list surplus food in seconds.",
      Mockup: () => (
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-sm mx-auto border border-forest/5 transform transition-transform hover:-translate-y-2">
          <div className="bg-forest/5 rounded-2xl aspect-video flex items-center justify-center mb-6">
            <span className="font-sans text-sm font-medium text-forest/40">Photo Preview</span>
          </div>
          <div className="h-4 w-1/3 bg-forest/10 rounded-full mb-6"></div>
          <button 
            onClick={() => {
              if (user) {
                if (role === 'donor') navigate('/donor?tab=Donate');
                else navigate('/receiver');
              } else {
                navigate('/register');
              }
            }}
            className="bg-forest text-parchment font-sans text-sm font-bold w-full py-3 rounded-xl hover:bg-[#111913] transition-colors"
          >
            List Item
          </button>
        </div>
      )
    },
    {
      num: "2",
      title: "Browse & Book",
      desc: "Receivers browse available food nearby on our live map, filter by dietary needs, and book a secure pickup time slot.",
      Mockup: () => (
        <div className="bg-white rounded-[2rem] shadow-2xl p-6 w-full max-w-sm mx-auto border border-forest/5 transform transition-transform hover:-translate-y-2">
          <div className="flex gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-forest/5 flex-shrink-0"></div>
            <div className="flex-1 space-y-3 py-1">
              <div className="h-4 w-1/2 bg-lime rounded-full"></div>
              <div className="h-3 w-3/4 bg-forest/10 rounded-full"></div>
              <div className="h-3 w-5/6 bg-forest/10 rounded-full"></div>
            </div>
          </div>
          <button 
            onClick={() => {
              if (user) {
                if (role === 'receiver') navigate('/receiver?tab=Browse Food');
                else navigate('/donor');
              } else {
                navigate('/login');
              }
            }}
            className="bg-forest text-parchment font-sans text-sm font-bold w-full py-3 rounded-xl hover:bg-[#111913] transition-colors"
          >
            Book Pickup
          </button>
        </div>
      )
    },
    {
      num: "3",
      title: "Pickup via QR",
      desc: "Arrive at the location, scan the secure QR code to verify the pickup, and collect your rescued meal safely.",
      Mockup: () => (
        <div className="bg-white rounded-[2rem] shadow-2xl p-8 w-full max-w-sm mx-auto border border-forest/5 flex flex-col items-center justify-center transform transition-transform hover:-translate-y-2">
          <div className="w-40 h-40 bg-parchment rounded-xl p-4 flex flex-wrap gap-2 mb-6">
            {/* Fake QR pattern */}
            {[...Array(16)].map((_, i) => (
              <div 
                key={i} 
                className={`w-[calc(25%-6px)] h-[calc(25%-6px)] rounded-sm ${
                  Math.random() > 0.4 ? 'bg-forest' : 'bg-forest/10'
                }`}
              ></div>
            ))}
          </div>
          <div className="h-3 w-1/2 bg-forest/10 rounded-full"></div>
        </div>
      )
    }
  ];

  return (
    <section id="how-it-works" className="bg-parchment text-forest py-32 px-6 md:px-24 overflow-hidden">
      
      <div className="text-center mb-24">
        <h2 className="font-display text-5xl md:text-7xl mb-4">HOW IT WORKS</h2>
        <p className="font-sans text-forest/70 max-w-xl mx-auto">
          A seamless flow from surplus to someone in need, ensuring zero waste.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-24 md:space-y-32">
        {steps.map((step, i) => {
          const isEven = i % 2 !== 0;
          
          return (
            <div 
              key={i} 
              className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${
                isEven ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Text Block */}
              <motion.div 
                initial={{ opacity: 0, x: isEven ? 50 : -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="flex-1 space-y-6 text-center md:text-left"
              >
                <div className="w-12 h-12 rounded-full bg-forest text-parchment flex items-center justify-center font-display text-2xl mx-auto md:mx-0">
                  {step.num}
                </div>
                <h3 className="font-display text-3xl md:text-4xl">{step.title}</h3>
                <p className="font-sans text-forest/70 leading-relaxed max-w-md mx-auto md:mx-0">
                  {step.desc}
                </p>
              </motion.div>

              {/* Mockup Block */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 w-full"
              >
                <step.Mockup />
              </motion.div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
