import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import whatsappIcon from '../assets/whatsapp.webp';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <>
      {/* WhatsApp Button (Always Visible) */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[40]">
        <div className="relative">
          {/* Pulsing ring for premium design */}
          <div className="absolute inset-0 rounded-full bg-[#25D366] animate-pulse-ring pointer-events-none" />
          <a
            href="https://wa.me/916385172761"
            target="_blank"
            rel="noopener noreferrer"
            className="relative w-10 h-10 md:w-12 md:h-12 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
            aria-label="Contact us on WhatsApp"
          >
            <img
              src={whatsappIcon}
              alt="WhatsApp"
              className="w-full h-full object-contain relative z-10"
            />
          </a>
        </div>
      </div>

      {/* Back to Top Button (Visible on Scroll) */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed bottom-[80px] md:bottom-[104px] right-6 md:right-10 z-[40]"
          >
            <div>
              <button
                onClick={scrollToTop}
                className="w-10 h-10 md:w-12 md:h-12 bg-brand-saffron text-brand-dark rounded-full flex items-center justify-center shadow-2xl hover:bg-brand-brown hover:text-brand-cream hover:scale-110 active:scale-95 transition-all duration-300 cursor-pointer"
                aria-label="Scroll to top"
              >
                <ArrowUp className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ScrollToTop;
