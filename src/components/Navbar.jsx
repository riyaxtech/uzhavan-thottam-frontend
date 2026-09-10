import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag } from 'lucide-react';
import logo from '../assets/logo-img.jpeg';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount, setIsCartOpen } = useCart();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setIsMobileMenuOpen(false), [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Products', path: '/products' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Contact', path: '/contact' },
  ];

  const handleNav = (path) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => navigate(path), 60);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-400 ${isScrolled
        ? 'bg-brand-dark py-3 border-b border-brand-saffron/10'
        : 'bg-brand-dark py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-10 flex justify-between items-center">

        {/* Logo */}
        <button onClick={() => handleNav('/')} className="flex items-center gap-2.5 sm:gap-3 focus:outline-none cursor-pointer">
          <img src={logo} alt="Uzhavan Thottam Logo" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-brand-saffron/60 object-cover flex-shrink-0" />
          <span className="font-playfair font-bold tracking-wider text-base sm:text-lg md:text-xl leading-none">
            <span className="text-brand-saffron">UZHAVAN</span>
            <span className="text-brand-cream ml-1 sm:ml-1.5">THOTTAM</span>
          </span>
        </button>

        {/* Desktop & Tablet Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.name}
                onClick={() => handleNav(link.path)}
                className={`relative text-[11px] lg:text-xs font-semibold tracking-[0.14em] lg:tracking-[0.18em] uppercase transition-colors duration-300 focus:outline-none pb-1 cursor-pointer ${isActive ? 'text-brand-saffron' : 'text-brand-cream/90 hover:text-brand-saffron'
                  }`}
              >
                {link.name}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className="absolute bottom-0 left-0 w-full h-px bg-brand-saffron"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
              </button>
            );
          })}
          <button
            onClick={() => handleNav('/contact')}
            className="ml-1 lg:ml-2 px-3.5 lg:px-5 py-2 bg-brand-saffron/10 border border-brand-saffron/30 text-brand-saffron text-[11px] lg:text-xs font-bold tracking-wider lg:tracking-widest uppercase hover:bg-brand-saffron hover:text-brand-dark transition-all duration-300 cursor-pointer"
          >
            Order Now
          </button>
          
          {/* Desktop Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-brand-cream hover:text-brand-saffron transition-colors cursor-pointer ml-1 lg:ml-2"
            aria-label="Open cart"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-maroon text-brand-cream text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-brand-dark">
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Actions (Cart + Toggle) */}
        <div className="flex items-center gap-2.5 sm:gap-4 md:hidden">
          {/* Mobile Cart Icon */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-[#C8A96B] hover:text-brand-cream transition-colors cursor-pointer"
            aria-label="Open cart"
          >
            <ShoppingBag size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-maroon text-brand-cream text-[9px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-brand-dark">
                {cartCount}
              </span>
            )}
          </button>

          {/* Mobile Toggle */}
          <button
            className="text-brand-saffron p-1 cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[55] md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed inset-y-0 right-0 w-72 max-w-[85vw] bg-brand-dark z-[60] md:hidden flex flex-col shadow-2xl overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-brand-saffron/10">
                <span className="font-playfair text-brand-saffron font-bold">Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-brand-cream/90 hover:text-brand-saffron">
                  <X size={24} />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-col px-8 py-8 gap-2 flex-grow">
                {navLinks.map((link, i) => {
                  const isActive = location.pathname === link.path;
                  return (
                    <motion.button
                      key={link.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => handleNav(link.path)}
                      className={`text-left py-4 border-b border-brand-cream/5 font-playfair text-xl tracking-wide transition-colors ${isActive ? 'text-brand-saffron' : 'text-brand-cream/90 hover:text-brand-saffron'
                        }`}
                    >
                      {link.name}
                    </motion.button>
                  );
                })}
              </div>

              <div className="px-8 py-8 border-t border-brand-saffron/10">
                <button
                  onClick={() => handleNav('/contact')}
                  className="w-full py-3 bg-brand-saffron text-brand-dark font-bold text-xs tracking-widest uppercase"
                >
                  Order Now
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <CartDrawer />
    </nav>
  );
};

export default Navbar;
