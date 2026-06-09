import { useToast } from '../../contexts/ToastContext';

export default function Footer() {
  const { showToast } = useToast();

  return (
    <footer className="bg-forest text-parchment py-12 px-6 md:px-24">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        
        <div>
          <h2 className="font-display text-4xl">FoodBridge</h2>
          <p className="font-syne text-xs uppercase tracking-[0.2em] mt-2 opacity-70">
            Zero waste. Zero hunger.
          </p>
        </div>

        <div className="flex gap-8 font-sans text-sm opacity-80">
          <button 
            onClick={() => showToast('Thank you for your interest! The About section is coming soon.', 'info')} 
            className="hover:text-lime transition-colors focus:outline-none"
          >
            About
          </button>
          <button 
            onClick={() => showToast('Thank you for your interest! The Manifesto will be shared soon.', 'info')} 
            className="hover:text-lime transition-colors focus:outline-none"
          >
            Manifesto
          </button>
          <button 
            onClick={() => showToast('Thank you for your interest! Press inquiries can be sent to contact.', 'info')} 
            className="hover:text-lime transition-colors focus:outline-none"
          >
            Press
          </button>
          <button 
            onClick={() => showToast('Feel free to reach out via support@foodbridge.org!', 'success', 'Contact Us')} 
            className="hover:text-lime transition-colors focus:outline-none"
          >
            Contact
          </button>
        </div>

        <div className="font-sans text-xs opacity-50">
          &copy; {new Date().getFullYear()} FoodBridge. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
