import React, { useEffect } from 'react';
import { X, Package, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProductDetailsModal = ({ isOpen, onClose, order }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const items = order.items || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full z-10 overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#0D2A1A] text-[#F5E8CF] px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#D4891A]/20 border border-[#D4891A]/30 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-[#D4891A]" />
              </div>
              <div>
                <h3 className="font-playfair text-lg font-bold text-white">
                  Ordered Products
                </h3>
                <p className="text-xs text-[#F5E8CF]/70">
                  Order ID: <span className="font-mono text-[#D4891A] font-medium">{order.orderId}</span> • {order.customerDetails?.name || 'Customer'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto divide-y divide-slate-100 flex-1">
            <div className="mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Item List ({items.length} {items.length === 1 ? 'item' : 'items'})
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {items.map((item, idx) => {
                const itemTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                return (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between gap-4 p-3.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors border border-slate-100"
                  >
                    {/* Item Image & Details */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-400"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></div>';
                            }}
                          />
                        ) : (
                          <Package className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-medium text-slate-900 text-sm truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                          {item.weight && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium text-[11px]">
                              {item.weight}
                            </span>
                          )}
                          <span>Qty: <strong className="text-slate-800">{item.quantity}</strong></span>
                          <span>•</span>
                          <span>₹{item.price} each</span>
                        </div>
                      </div>
                    </div>

                    {/* Item Total */}
                    <div className="text-right shrink-0">
                      <div className="font-semibold text-slate-900 text-base">
                        ₹{itemTotal}
                      </div>
                      <span className="text-[11px] text-slate-400">Total</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price Summary */}
            <div className="mt-6 pt-4 space-y-2 border-t border-slate-200">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal</span>
                <span>₹{order.subtotal || order.total}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>Delivery Charge</span>
                <span>
                  {order.deliveryCharge && Number(order.deliveryCharge) > 0
                    ? `₹${order.deliveryCharge}`
                    : 'Free Delivery'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-brand-dark text-base">₹{order.total}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductDetailsModal;
