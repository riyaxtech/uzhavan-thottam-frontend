import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo-img.jpeg';

const Preloader = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-dark"
        >
          <div className="relative flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mb-8 flex flex-col items-center"
            >
              <img src={logo} alt="Uzhavan Thottam Logo" className="w-32 h-32 md:w-48 md:h-48 object-contain mb-4 rounded-full border-2 border-brand-saffron p-2" />
              <h1 className="text-4xl md:text-6xl font-playfair text-brand-saffron tracking-widest uppercase">
                Uzhavan Thottam
              </h1>
              <div className="h-px w-full bg-brand-saffron mt-2 origin-left scale-x-0 animate-[grow_1.5s_ease-in-out_forwards]" />
            </motion.div>

            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "200px" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-0.5 bg-brand-saffron/30 relative overflow-hidden"
            >
              <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-brand-saffron"
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
