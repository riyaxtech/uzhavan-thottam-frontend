import React, { useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  Package,
  Hash,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FullOrderDetailsModal = ({
  isOpen,
  onClose,
  order,
  onUpdatePayment,
  onUpdateDispatch,
  onUpdateDelivery,
  isUpdating = false,
}) => {
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

  const customer = order.customerDetails || {};
  const items = order.items || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full z-10 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[#0D2A1A] text-[#F5E8CF] px-6 py-4 flex items-center justify-between shrink-0 border-b border-[#1A4A2E]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4891A]/20 border border-[#D4891A]/30 flex items-center justify-center shrink-0">
                <Hash className="w-5 h-5 text-[#D4891A]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-playfair text-lg font-bold text-white tracking-wide">
                    Order Details
                  </h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#D4891A] text-white">
                    #{order.orderId}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#F5E8CF]/70 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-[#D4891A]" />
                    {order.orderDate}
                  </span>
                  <span>•</span>
                  <span>Placed via Storefront</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
            {/* 1. Status Bar Quick Toggles */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Order Status Controls
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Payment Status */}
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-medium mb-1">Payment Status</span>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.paymentStatus === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.paymentStatus === 'Paid' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {order.paymentStatus || 'Pending'}
                    </span>
                    {onUpdatePayment && (
                      <select
                        value={order.paymentStatus || 'Pending'}
                        onChange={(e) => onUpdatePayment(order.orderId, e.target.value)}
                        disabled={isUpdating}
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer disabled:opacity-50"
                      >
                        <option value="Pending">Set Pending</option>
                        <option value="Paid">Set Paid</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Dispatch Status */}
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-medium mb-1">Dispatch Status</span>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.dispatchStatus === 'Dispatched'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      {order.dispatchStatus || 'Pending'}
                    </span>
                    {onUpdateDispatch && (
                      <select
                        value={order.dispatchStatus || 'Pending'}
                        onChange={(e) => onUpdateDispatch(order.orderId, e.target.value)}
                        disabled={isUpdating}
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer disabled:opacity-50"
                      >
                        <option value="Pending">Set Pending</option>
                        <option value="Dispatched">Set Dispatched</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Delivery Status */}
                <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex flex-col justify-between">
                  <span className="text-xs text-slate-500 font-medium mb-1">Delivery Status</span>
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.deliveryStatus === 'Delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {order.deliveryStatus || 'Pending'}
                    </span>
                    {onUpdateDelivery && (
                      <select
                        value={order.deliveryStatus || 'Pending'}
                        onChange={(e) => onUpdateDelivery(order.orderId, e.target.value)}
                        disabled={isUpdating}
                        className="text-xs border border-slate-300 rounded px-2 py-1 bg-white text-slate-700 hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer disabled:opacity-50"
                      >
                        <option value="Pending">Set Pending</option>
                        <option value="Delivered">Set Delivered</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Customer & Delivery Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Customer Information Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <User className="w-4 h-4 text-brand-dark" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Customer Information
                  </h4>
                </div>
                <div className="space-y-2.5 text-xs text-slate-600">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Customer Name</span>
                    <strong className="text-slate-900 text-sm">{customer.name || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Phone Number</span>
                    {customer.phone ? (
                      <a
                        href={`tel:${customer.phone}`}
                        className="text-brand-dark hover:text-brand-saffron font-medium flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        {customer.phone}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Email Address</span>
                    {customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-brand-dark hover:text-brand-saffron font-medium flex items-center gap-1"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        {customer.email}
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Information Card */}
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <MapPin className="w-4 h-4 text-brand-dark" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Delivery Address
                  </h4>
                </div>
                <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                  {customer.doorNo && (
                    <div>
                      <span className="text-slate-400 block text-[11px]">Door / Flat No</span>
                      <span className="text-slate-900 font-medium">{customer.doorNo}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-400 block text-[11px]">Street / Area</span>
                    <span className="text-slate-900 font-medium">{customer.street || 'N/A'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[11px]">District</span>
                      <span className="text-slate-900 font-medium">{customer.district || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">State</span>
                      <span className="text-slate-900 font-medium">{customer.state || 'Tamil Nadu'}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Postal PIN Code</span>
                    <span className="inline-block bg-slate-100 text-slate-800 font-mono font-bold px-2 py-0.5 rounded">
                      {customer.pincode || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Products Breakdown */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <Package className="w-4 h-4 text-brand-dark" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Ordered Products ({items.length})
                </h4>
              </div>

              <div className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <div key={item.id || idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{item.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {item.weight && <span className="mr-2">Weight: {item.weight}</span>}
                          <span>Qty: <strong>{item.quantity}</strong></span>
                          <span className="mx-1">•</span>
                          <span>₹{item.price} each</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right font-bold text-slate-800">
                      ₹{(Number(item.price) || 0) * (Number(item.quantity) || 1)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Cost Breakdown */}
              <div className="mt-4 pt-3 border-t border-slate-200 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>₹{order.subtotal || order.total}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Charges</span>
                  <span>
                    {order.deliveryCharge && Number(order.deliveryCharge) > 0
                      ? `₹${order.deliveryCharge}`
                      : 'Free Delivery'}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Order Amount</span>
                  <span className="text-brand-dark text-base">₹{order.total}</span>
                </div>
              </div>
            </div>

            {/* 4. Payment Information Card */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-brand-dark" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Payment Information
                </h4>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Method</span>
                  <strong className="text-slate-800">{order.paymentMethod || 'Online Payment'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Status</span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                      order.paymentStatus === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.paymentStatus || 'Pending'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Amount Paid</span>
                  <strong className="text-slate-900">
                    ₹{order.amountPaid !== undefined ? order.amountPaid : (order.paymentStatus === 'Paid' ? order.total : 0)}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Payment Date</span>
                  <span className="text-slate-700">
                    {order.paymentDate || (order.paymentStatus === 'Paid' ? order.orderDate : 'Pending')}
                  </span>
                </div>
              </div>

              {order.transactionId && (
                <div className="mt-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <span className="text-slate-400 block text-[11px]">Transaction ID</span>
                  <code className="bg-slate-100 px-2 py-1 rounded text-slate-800 font-mono text-[11px]">
                    {order.transactionId}
                  </code>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-xs text-slate-500">
              Order record stored securely in database
            </div>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-brand-dark hover:bg-brand-olive text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Done / Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default FullOrderDetailsModal;
