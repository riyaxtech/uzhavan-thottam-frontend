import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingBag, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartDrawer = () => {
  const {
    cart,
    cartSubtotal,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    setBuyNowItem,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    // Clear buy now state to ensure checkout uses the cart items
    setBuyNowItem(null);
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-[#0D2A1A]/80 backdrop-blur-xs z-[100]"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="fixed inset-y-0 right-0 w-full max-w-md bg-[#F7F2EA] shadow-2xl z-[110] flex flex-col border-l border-brand-dark/10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-brand-dark/10 bg-brand-dark text-[#F5E8CF]">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-brand-saffron" />
                <span className="font-playfair font-bold text-lg tracking-wider">Your Shopping Cart</span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-brand-cream/80 hover:text-brand-saffron transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X size={24} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-grow overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-16 h-16 bg-brand-dark/5 rounded-full flex items-center justify-center text-brand-dark/30">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="font-playfair text-xl font-bold text-brand-dark">Your cart is empty</h3>
                  <p className="text-sm text-brand-dark/60 max-w-xs">
                    Browse our organic collection and add pure, farm-fresh items to your cart!
                  </p>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/products');
                    }}
                    className="px-6 py-2.5 bg-brand-dark hover:bg-brand-olive text-brand-cream text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={`${item.id}-${item.weight}`}
                    className="flex gap-4 bg-white p-4 border border-brand-dark/8 shadow-xs relative group"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-brand-dark/5 overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Item Info */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-playfair font-bold text-brand-dark text-sm leading-tight pr-6">
                          {item.name}
                        </h4>
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-brand-saffron mt-0.5">
                          {item.weight}
                        </span>
                      </div>

                      {/* Controls and Price */}
                      <div className="flex justify-between items-center mt-2">
                        {/* Quantity Counter */}
                        <div className="flex items-center border border-brand-dark/15 bg-[#F7F2EA]">
                          <button
                            onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                            className="px-2 py-1 text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors cursor-pointer"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-3 text-xs font-bold text-brand-dark">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                            className="px-2 py-1 text-brand-dark/60 hover:text-brand-dark hover:bg-brand-dark/5 transition-colors cursor-pointer"
                            aria-label="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        {/* Price Calculations */}
                        <div className="text-right">
                          <span className="text-[10px] text-brand-dark/40 block">₹{item.price} each</span>
                          <span className="text-sm font-bold text-brand-dark">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id, item.weight)}
                      className="absolute top-3 right-3 text-brand-dark/30 hover:text-brand-maroon transition-colors cursor-pointer p-1"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-6 bg-white border-t border-brand-dark/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold uppercase tracking-wider text-brand-dark/60">Subtotal</span>
                  <span className="text-xl font-playfair font-bold text-brand-dark">₹{cartSubtotal}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-brand-saffron hover:bg-brand-maroon text-[#F5E8CF] hover:text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 shadow-sm cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
