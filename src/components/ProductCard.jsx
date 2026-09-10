import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Eye, X, Minus, Plus, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

// Category accent colors
const catColors = {
  Oils: { dot: '#D4891A', label: 'bg-amber-50  text-amber-700  border-amber-200' },
  Sweeteners: { dot: '#5C1A1A', label: 'bg-red-50    text-red-800    border-red-200' },
  Beverages: { dot: '#1A4A2E', label: 'bg-green-50  text-green-800  border-green-200' },
  Spices: { dot: '#B45309', label: 'bg-orange-50 text-orange-700 border-orange-200' },
  'Dry Fruits': { dot: '#78350F', label: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  Dairy: { dot: '#4B5563', label: 'bg-gray-50   text-gray-700   border-gray-200' },
  Pickles: { dot: '#991B1B', label: 'bg-rose-50   text-rose-800   border-rose-200' },
  Fresh: { dot: '#15803D', label: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

const ProductCard = ({ product, index = 0 }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);

  // Available weight keys if product has multiple prices
  const weightOptions = product.prices ? Object.keys(product.prices) : ['Standard'];
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0] || '500g');
  const [selectedQty, setSelectedQty] = useState(1);

  const { addToCart, setBuyNowItem, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const currentUnitPrice = product.prices?.[selectedWeight]
    || (typeof product.price === 'string' ? parseInt(product.price.replace(/[^0-9]/g, '')) : product.price)
    || 0;

  const cardRef = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 220, damping: 22 };
  const rotX = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), spring);
  const rotY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), spring);

  const onMove = (e) => {
    if (!product.available || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  const cat = catColors[product.category] || catColors.Oils;
  const slideX = index % 2 === 0 ? 36 : -36;

  const handleConfirmAddToCart = () => {
    addToCart(product, selectedWeight, selectedQty);
    setShowOptionModal(false);
    setIsCartOpen(true);
  };

  const handleConfirmBuyNow = () => {
    setShowOptionModal(false);
    setBuyNowItem({
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      weight: selectedWeight,
      quantity: selectedQty,
      price: currentUnitPrice,
    });
    navigate('/checkout');
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, x: slideX, y: 14 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.52, delay: (index % 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      /* 3D tilt only on desktop (mouse device) for active products */
      style={product.available ? { rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d', perspective: 900 } : {}}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={() => {
        if (product.available) {
          navigate(`/product/${product.id}`);
        }
      }}
      className={`group relative bg-white border border-gray-100 transition-colors duration-300 flex flex-col h-full min-h-[400px] sm:min-h-[450px] md:min-h-[480px] ${
        product.available
          ? 'hover:border-brand-saffron/25 cursor-pointer'
          : 'cursor-default'
      }`}
    >
      {/* Category color strip */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ backgroundColor: cat.dot }} />

      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[4/5] w-full bg-white flex items-center justify-center flex-shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            product.available ? 'group-hover:scale-105' : 'opacity-90'
          }`}
          loading="lazy"
        />

        {/*
          Desktop: overlay appears on hover for active products
          Mobile:  overlay is hidden (no hover on touch) — we show action strip below instead
        */}
        {product.available && (
          <div className="absolute inset-0 bg-brand-dark/55 flex items-center justify-center gap-3
                          opacity-0 group-hover:opacity-100
                          transition-opacity duration-300
                          hidden sm:flex">
            <button
              onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
              className="w-10 h-10 bg-brand-saffron text-brand-dark rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
              title="View images"
            >
              <Eye size={18} />
            </button>
          </div>
        )}

        {/* Tag badge (only shown for available products to avoid ribbon overlap) */}
        {product.tag && product.available && (
          <div className="absolute top-2 left-2">
            <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 border ${cat.label}`}>
              {product.tag}
            </span>
          </div>
        )}

        {/* Diagonal 3D Red Ribbon for Launching Soon */}
        {!product.available && (
          <div className="absolute -top-[6px] -left-[6px] w-[96px] h-[96px] pointer-events-none z-20 select-none">
            {/* Top fold shadow */}
            <div className="absolute top-0 left-[50px] w-[10px] h-[6px] bg-red-950 rounded-t-xs" />
            {/* Left fold shadow */}
            <div className="absolute top-[50px] left-0 w-[6px] h-[10px] bg-red-950 rounded-l-xs" />
            {/* Ribbon body */}
            <div className="absolute top-[20px] left-[-28px] w-[120px] -rotate-45 bg-gradient-to-r from-red-700 via-red-500 to-red-700 text-white text-[6.5px] font-black uppercase tracking-widest py-1.5 text-center shadow-[0_3px_8px_rgba(0,0,0,0.45)] border-y border-white/10 z-10">
              Launching Soon
            </div>
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div className="p-2.5 sm:p-3.5 md:p-4 relative flex flex-col flex-grow justify-between bg-white">
        <div>
          {/* Category label */}
          <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ color: cat.dot }}>
            {product.category}
          </p>

          {/* Name */}
          <h3 className={`font-playfair font-bold text-brand-dark transition-colors text-xs sm:text-sm leading-snug mb-1 line-clamp-2 min-h-[2.2rem] sm:min-h-[2.5rem] flex items-center ${
            product.available ? 'group-hover:text-brand-saffron' : ''
          }`}>
            {product.name}
          </h3>

          {/* Dynamic Price & Weight Selector Display (Hidden for Launching Soon products) */}
          {product.available ? (
            <div className="mb-2 sm:mb-3">
              {product.prices ? (
                <div className="space-y-1.5">
                  {/* Weight selector pills */}
                  <div className="flex flex-wrap items-center gap-1 sm:gap-1.5">
                    {Object.entries(product.prices).map(([w, pr]) => {
                      const isSelected = selectedWeight === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWeight(w);
                          }}
                          className={`px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-dark text-brand-saffron border-brand-dark shadow-xs'
                              : 'bg-white text-brand-dark/70 border-brand-dark/20 hover:border-brand-saffron/60 hover:text-brand-dark'
                          }`}
                        >
                          {w}
                        </button>
                      );
                    })}
                  </div>
                  {/* Active price indicator */}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xs sm:text-sm font-bold text-brand-maroon">
                      ₹{currentUnitPrice}
                    </span>
                    <span className="text-[9px] text-brand-dark/50 font-medium">
                      ({selectedWeight})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-brand-maroon">{product.price}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-2 sm:mb-3 min-h-[1.8rem] sm:min-h-[2rem] flex items-center">
              <span className="text-[9px] sm:text-[11px] font-semibold text-brand-dark/40 italic">
                Price will be announced on launch
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-1.5 sm:gap-2 mt-1 sm:mt-2">
          {product.available ? (
            <>
              {/* Add to Cart & Buy Now */}
              <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 w-full">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowOptionModal(true);
                  }}
                  className="flex-1 py-1.5 sm:py-2 bg-transparent border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-brand-cream text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-1 active:scale-[0.98]"
                >
                  <ShoppingBag size={11} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">Add to Cart</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setBuyNowItem({
                      id: product.id,
                      name: product.name,
                      image: product.image,
                      category: product.category,
                      weight: selectedWeight,
                      quantity: selectedQty,
                      price: currentUnitPrice,
                    });
                    navigate('/checkout');
                  }}
                  className="flex-1 py-1.5 sm:py-2 bg-brand-saffron hover:bg-brand-maroon text-brand-dark hover:text-[#F5E8CF] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  Buy Now
                </button>
              </div>
              
              {/* View Image Icon Link */}
              <button
                onClick={(e) => { e.stopPropagation(); setShowPreview(true); }}
                className="text-brand-dark/45 hover:text-brand-saffron transition-colors flex items-center justify-center gap-1.5 py-1 text-[8px] font-bold uppercase tracking-widest cursor-pointer"
              >
                <Eye size={12} />
                <span>View Image</span>
              </button>
            </>
          ) : (
            <div className="text-center py-2 bg-brand-dark/5 border border-brand-dark/8">
              <span className="text-brand-maroon/60 text-[10px] font-bold uppercase tracking-widest font-semibold">
                Launching Soon
              </span>
            </div>
          )}
        </div>

        {/* Sweep underline — desktop only for active products */}
        {product.available && (
          <div
            className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500 hidden sm:block"
            style={{ backgroundColor: cat.dot }}
          />
        )}
      </div>

      {/* ── Select Quantity Option Modal — rendered via Portal ── */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showOptionModal && (
            <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 sm:p-6">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowOptionModal(false)}
                className="absolute inset-0 bg-[#0D2A1A]/80 backdrop-blur-xs"
              />

              {/* Modal Box */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 16 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                onClick={(e) => e.stopPropagation()}
                className="relative z-10 bg-[#F7F2EA] w-full max-w-md border border-brand-dark/15 shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-5 bg-brand-dark text-[#F5E8CF] border-b border-brand-dark/10">
                  <div className="flex items-center gap-2.5">
                    <ShoppingBag size={18} className="text-brand-saffron" />
                    <h3 className="font-playfair font-bold text-base sm:text-lg tracking-wide">
                      Select Quantity Option
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowOptionModal(false)}
                    className="text-brand-cream/70 hover:text-brand-saffron transition-colors p-1 cursor-pointer"
                    aria-label="Close option modal"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                  {/* Product Snippet */}
                  <div className="flex items-center gap-4 p-3 bg-white border border-brand-dark/10 shadow-xs">
                    <div className="w-16 h-16 bg-white overflow-hidden flex items-center justify-center flex-shrink-0 border border-brand-dark/5">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-widest block text-brand-saffron">
                        {product.category}
                      </span>
                      <h4 className="font-playfair font-bold text-brand-dark text-base leading-tight truncate">
                        {product.name}
                      </h4>
                      <p className="text-xs text-brand-dark/60 font-medium mt-0.5">
                        Pure &bull; Natural &bull; Farm Fresh
                      </p>
                    </div>
                  </div>

                  {/* Weight Selection (if applicable) */}
                  {product.prices && (
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark/80 block mb-2">
                        Select Weight / Pack Size
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(product.prices).map(([weight, price]) => {
                          const isSelected = selectedWeight === weight;
                          return (
                            <button
                              key={weight}
                              type="button"
                              onClick={() => setSelectedWeight(weight)}
                              className={`p-3 border rounded-xs transition-all cursor-pointer text-left flex items-center justify-between ${
                                isSelected
                                  ? 'bg-brand-dark text-[#F5E8CF] border-brand-dark shadow-sm ring-1 ring-brand-saffron'
                                  : 'bg-white text-brand-dark border-brand-dark/15 hover:border-brand-saffron/60'
                              }`}
                            >
                              <div>
                                <span className="text-xs font-bold uppercase tracking-wider block">
                                  {weight}
                                </span>
                                <span className={`text-sm font-bold block mt-0.5 ${isSelected ? 'text-brand-saffron' : 'text-brand-maroon'}`}>
                                  ₹{price}
                                </span>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 rounded-full bg-brand-saffron text-brand-dark flex items-center justify-center flex-shrink-0">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quantity Counter */}
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-brand-dark/80 block mb-2">
                      Select Quantity
                    </label>
                    <div className="flex items-center justify-between p-3 bg-white border border-brand-dark/15">
                      <span className="text-xs font-medium text-brand-dark/70">Quantity (Units)</span>
                      <div className="flex items-center border border-brand-dark/20 bg-[#F7F2EA]">
                        <button
                          type="button"
                          onClick={() => setSelectedQty((q) => Math.max(1, q - 1))}
                          disabled={selectedQty <= 1}
                          className="px-3 py-1.5 text-brand-dark hover:bg-brand-dark/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-4 text-sm font-bold text-brand-dark min-w-[2.5rem] text-center">
                          {selectedQty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedQty((q) => q + 1)}
                          className="px-3 py-1.5 text-brand-dark hover:bg-brand-dark/10 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="p-3.5 bg-brand-dark/5 border border-brand-dark/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-brand-dark/60 block">
                        Unit Price: ₹{currentUnitPrice} &times; {selectedQty}
                      </span>
                      <span className="text-xs font-semibold text-brand-dark">
                        Total Amount
                      </span>
                    </div>
                    <span className="text-xl font-playfair font-bold text-brand-dark">
                      ₹{currentUnitPrice * selectedQty}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-1">
                    <button
                      type="button"
                      onClick={handleConfirmAddToCart}
                      className="w-full py-3.5 bg-brand-saffron hover:bg-brand-maroon text-brand-dark hover:text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag size={15} />
                      <span>Add to Cart &bull; ₹{currentUnitPrice * selectedQty}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmBuyNow}
                      className="w-full py-2.5 bg-transparent border border-brand-dark text-brand-dark hover:bg-brand-dark hover:text-brand-cream text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-200 cursor-pointer"
                    >
                      Buy Now Directly
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Lightbox Preview - rendered via Portal to escape 3D transforms */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {showPreview && (
            <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 md:p-10">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowPreview(false)}
                className="absolute inset-0 bg-brand-dark/95 backdrop-blur-md"
              />

              {/* Close button - Top Right */}
              <button
                onClick={() => setShowPreview(false)}
                className="absolute top-6 right-6 z-[1010] text-brand-cream/60 hover:text-brand-saffron transition-colors p-2 bg-white/5 rounded-full"
                title="Close"
              >
                <X size={32} />
              </button>

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-[1000] max-w-5xl w-full flex flex-col items-center"
              >
                <div className="relative group/modal overflow-hidden rounded-sm shadow-2xl border border-brand-cream/10">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 opacity-50" />
                </div>
                <div className="mt-8 text-center">
                  <h3 className="text-brand-cream font-playfair font-bold text-3xl md:text-4xl mb-3">{product.name}</h3>
                  <div className="flex items-center justify-center gap-3">
                    <span className="h-px w-8 bg-brand-saffron/40" />
                    <p className="text-brand-saffron text-xs font-bold uppercase tracking-[0.3em]">{product.category}</p>
                    <span className="h-px w-8 bg-brand-saffron/40" />
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </motion.div>
  );
};

export default ProductCard;
