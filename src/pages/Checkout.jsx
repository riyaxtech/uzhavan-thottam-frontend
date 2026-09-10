import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { sendOrderEmail } from '../services/emailService';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, ShoppingBag, ArrowLeft, ArrowRight, Loader2, Plus, Minus, Trash2, User, Phone, Mail, MapPin, Lock, Check } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import confetti from 'canvas-confetti';

const INDIAN_STATES = [
  'Tamil Nadu',
  'Kerala',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Maharashtra',
  'Puducherry',
  'Goa',
  'Gujarat',
  'Delhi',
  'Rajasthan',
  'West Bengal',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Bihar',
  'Punjab',
  'Haryana',
  'Odisha',
  'Assam',
  'Other State / UT'
];

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cart,
    cartSubtotal,
    clearCart,
    buyNowItem,
    setBuyNowItem,
    customerDetails,
    setCustomerDetails,
    updateQuantity,
    removeFromCart,
  } = useCart();

  // Step state: 1 = Quantity Selection, 2 = Address Form, 3 = Review & Confirm, 4 = Success Screen
  const [step, setStep] = useState(1);

  // Preserve Buy Now selections locally in Checkout component
  const [localBuyNowItem, setLocalBuyNowItem] = useState(null);

  // Form Fields
  const [formData, setFormData] = useState({
    name: customerDetails.name || '',
    phone: customerDetails.phone || '',
    email: customerDetails.email || '',
    doorNo: customerDetails.doorNo || '',
    street: customerDetails.street || '',
    district: customerDetails.district || '',
    state: customerDetails.state || 'Tamil Nadu',
    pincode: customerDetails.pincode || '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [generatedOrderId, setGeneratedOrderId] = useState('');
  const [generatedOrderDate, setGeneratedOrderDate] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  // Synchronize localBuyNowItem when context changes
  useEffect(() => {
    if (buyNowItem) {
      setLocalBuyNowItem(buyNowItem);
    }
  }, [buyNowItem]);

  // Determine active list & total price
  const activeItems = buyNowItem ? (localBuyNowItem ? [localBuyNowItem] : []) : cart;
  const activeTotal = buyNowItem
    ? (localBuyNowItem ? localBuyNowItem.price * localBuyNowItem.quantity : 0)
    : cartSubtotal;

  // Protect route if no items are active (only if not on success screen)
  if (activeItems.length === 0 && step !== 4) {
    return (
      <div className="pt-28 pb-20 bg-[#F7F2EA] min-h-screen flex flex-col items-center justify-center text-center px-6">
        <AlertCircle size={48} className="text-brand-maroon mb-4 animate-bounce" />
        <h2 className="text-2xl font-playfair font-bold text-brand-dark mb-2">No items to checkout</h2>
        <p className="text-brand-dark/60 text-sm max-w-sm mb-6">
          Your shopping cart is empty and no product was selected for direct checkout.
        </p>
        <button
          onClick={() => navigate('/products')}
          className="px-8 py-3 bg-brand-dark hover:bg-brand-olive text-brand-cream text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  // Scroll to top of the content area on step transition
  const scrollToTop = () => {
    const element = document.getElementById('checkout-content');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Indian mobile and required address fields verification
  const validateAddressForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required';
    } else {
      const phoneCleaned = formData.phone.replace(/[\s\-()]/g, '');
      const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;
      if (!phoneRegex.test(phoneCleaned)) {
        newErrors.phone = 'Please enter a valid 10-digit Indian mobile number';
      }
    }

    if (!formData.email || !formData.email.trim()) {
      newErrors.email = 'Email Address is required to receive confirmation message';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    if (!formData.doorNo.trim()) {
      newErrors.doorNo = 'Door No. / Flat No. is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Area / Street Name is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District / City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else {
      const pincodeCleaned = formData.pincode.trim();
      if (!/^\d{6}$/.test(pincodeCleaned)) {
        newErrors.pincode = 'Please enter a valid 6-digit Pincode';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStep1Next = () => {
    setStep(2);
    setTimeout(scrollToTop, 50);
  };

  const handleStep2Next = (e) => {
    e.preventDefault();
    if (validateAddressForm()) {
      setCustomerDetails(formData);
      setStep(3);
      setTimeout(scrollToTop, 50);
    }
  };

  const handleConfirmOrder = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);

    const orderId = `UZH${Math.floor(10000 + Math.random() * 90000)}`;
    const orderDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    const orderPayload = {
      orderId,
      orderDate,
      items: activeItems.map(item => ({
        id: item.id,
        name: item.name,
        weight: item.weight || 'Standard',
        quantity: item.quantity,
        price: item.price,
        image: item.image || '',
      })),
      customerDetails: { ...formData },
      subtotal: activeTotal,
      deliveryCharge: 0,
      total: activeTotal,
      paymentMethod: 'Online Payment',
    };

    try {
      await sendOrderEmail(orderPayload);
      
      setGeneratedOrderId(orderId);
      setGeneratedOrderDate(orderDate);
      setPlacedOrder(orderPayload);
      
      // Clear purchased states
      if (buyNowItem) {
        setBuyNowItem(null);
      } else {
        clearCart();
      }
      
      setStep(4);
      setTimeout(scrollToTop, 50);
      
      // Celebration Confetti Blast
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      setSubmitError(err.message || 'Unable to submit your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Local state modifiers for Buy Now quantity selection
  const updateLocalBuyNowQty = (newQty) => {
    if (newQty < 1 || !localBuyNowItem) return;
    setLocalBuyNowItem(prev => ({
      ...prev,
      quantity: newQty
    }));
  };

  const updateLocalBuyNowWeight = (newWeight) => {
    if (!localBuyNowItem) return;
    // Look up weight price
    const mockWeightPrices = {
      5: { '500g': 72, '1kg': 128 }, // Naatu Sakkarai
      7: { '500g': 50, '1kg': 90 },  // Naatu Vellam
      8: { '500g': 180, '1kg': 320 }  // Honey
    };
    const productPrices = mockWeightPrices[localBuyNowItem.id] || { '500g': localBuyNowItem.price, '1kg': localBuyNowItem.price };
    const unitPrice = productPrices[newWeight] || localBuyNowItem.price;

    setLocalBuyNowItem(prev => ({
      ...prev,
      weight: newWeight,
      price: unitPrice
    }));
  };

  // Framer Motion presets
  const slideAnim = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    transition: { duration: 0.3 }
  };

  return (
    <div className="pt-24 bg-[#F7F2EA] min-h-screen pb-28 sm:pb-20" id="checkout-content">
      <Helmet>
        <title>Secure Checkout | Uzhavan Thottam</title>
      </Helmet>

      {/* ── Main Panel ── */}
      <div className="container-custom max-w-5xl px-4 sm:px-6 py-4 sm:py-6 md:py-10">
        <AnimatePresence mode="wait">
          {step < 4 ? (
            <motion.div
              key="checkout-wrapper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-white border border-gray-100/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-10 shadow-sm space-y-6 sm:space-y-8"
            >
              {/* Header: Title and Progress Timeline */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-2">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#123C24] text-white flex items-center justify-center font-bold text-base sm:text-lg md:text-xl flex-shrink-0 shadow-xs">
                    {step}
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-[22px] xl:text-[26px] font-playfair font-bold text-[#14251F] leading-tight">
                      {step === 1 && 'Step 1 — Verify Quantity & Pricing'}
                      {step === 2 && 'Step 2 — Shipping Address'}
                      {step === 3 && 'Step 3 — Order Summary & Review'}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 font-normal mt-0.5 truncate sm:overflow-visible">
                      {step === 1 && 'Select your preferred weight and quantity'}
                      {step === 2 && 'Enter your delivery information'}
                      {step === 3 && 'Double check your order details'}
                    </p>
                  </div>
                </div>

                {/* Timeline Progress */}
                <div className="w-full lg:w-auto overflow-x-auto no-scrollbar flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 xl:gap-2.5 flex-shrink-0 select-none py-1">
                  {/* Step 1 */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      step > 1 ? 'bg-[#123C24] text-white' : step === 1 ? 'bg-[#123C24] text-white' : 'border border-gray-200 text-gray-400 bg-white'
                    }`}>
                      {step > 1 ? <Check size={13} className="stroke-[3]" /> : '1'}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${step >= 1 ? 'text-[#123C24]' : 'text-gray-400'}`}>Quantity</span>
                  </div>

                  {/* Line 1 */}
                  <div className="w-5 sm:w-7 md:w-9 lg:w-8 xl:w-12 h-[2px] bg-gray-200 relative overflow-hidden flex-shrink-0">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-[#123C24]"
                      initial={{ width: "0%" }}
                      animate={{ width: step > 1 ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      step > 2 ? 'bg-[#123C24] text-white' : step === 2 ? 'bg-[#123C24] text-white' : 'border border-gray-200 text-gray-400 bg-white'
                    }`}>
                      {step > 2 ? <Check size={13} className="stroke-[3]" /> : '2'}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${step >= 2 ? 'text-[#123C24]' : 'text-gray-400'}`}>Delivery Info</span>
                  </div>

                  {/* Line 2 */}
                  <div className="w-5 sm:w-7 md:w-9 lg:w-8 xl:w-12 h-[2px] bg-gray-200 relative overflow-hidden flex-shrink-0">
                    <motion.div 
                      className="absolute top-0 left-0 h-full bg-[#123C24]"
                      initial={{ width: "0%" }}
                      animate={{ width: step > 2 ? "100%" : "0%" }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      step === 3 ? 'bg-[#123C24] text-white' : 'border border-gray-300 text-gray-400 bg-white'
                    }`}>
                      3
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold whitespace-nowrap transition-colors duration-300 ${step === 3 ? 'text-[#123C24]' : 'text-gray-400'}`}>Checkout</span>
                  </div>
                </div>
              </div>

              {/* Inner Step Content Switcher */}
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step-1" {...slideAnim} className="space-y-6">
                    {buyNowItem && localBuyNowItem ? (
                      /* Buy Now Single Item Selector */
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-6 p-6 bg-white border border-gray-100 rounded-2xl">
                          {/* Product Image */}
                          <div className="w-full md:w-48 h-48 bg-white flex items-center justify-center p-2 rounded-2xl border border-gray-100 flex-shrink-0">
                            <img src={localBuyNowItem.image} alt={localBuyNowItem.name} className="max-h-full object-contain rounded-xl" />
                          </div>

                          {/* Details & Controls */}
                          <div className="flex-grow flex flex-col justify-between">
                            <div>
                              <h3 className="font-playfair font-bold text-2xl text-brand-dark leading-tight mb-1">
                                {localBuyNowItem.name}
                              </h3>
                              <p className="text-xs text-gray-500 font-medium mb-5">
                                Pure &bull; Natural &bull; Chemical-Free
                              </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                              {/* Weight Selection Toggle */}
                              <div className="w-full sm:w-auto flex-grow max-w-xs">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                                  Select Weight
                                </span>
                                <div className="flex gap-3">
                                  {['500g', '1kg'].map((w) => {
                                    const isSelected = localBuyNowItem.weight === w;
                                    const mockWeightPrices = {
                                      5: { '500g': 72, '1kg': 128 }, // Naatu Sakkarai
                                      7: { '500g': 50, '1kg': 90 },  // Naatu Vellam
                                      8: { '500g': 180, '1kg': 320 }  // Honey
                                    };
                                    const productPrices = mockWeightPrices[localBuyNowItem.id] || { '500g': localBuyNowItem.price, '1kg': Math.round(localBuyNowItem.price * 1.8) };
                                    const priceForW = productPrices[w] || localBuyNowItem.price;

                                    return (
                                      <button
                                        key={w}
                                        onClick={() => updateLocalBuyNowWeight(w)}
                                        className={`flex-grow flex items-center justify-center gap-2 p-3 border rounded-xl transition-all cursor-pointer text-left ${
                                          isSelected
                                            ? 'bg-[#123C24] text-white border-[#123C24] shadow-sm'
                                            : 'bg-white text-gray-800 border-gray-200 hover:border-[#123C24]/40'
                                        }`}
                                      >
                                        {isSelected && (
                                          <div className="w-4 h-4 rounded-full bg-white text-[#123C24] flex items-center justify-center flex-shrink-0">
                                            <svg className="w-2.5 h-2.5 fill-none stroke-current stroke-[3]" viewBox="0 0 24 24">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                          </div>
                                        )}
                                        <div className="flex flex-col items-center justify-center w-full text-center">
                                          <span className="text-sm font-bold uppercase">{w}</span>
                                          <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>₹{priceForW}</span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Vertical Divider */}
                              <div className="hidden sm:block w-[1px] h-14 bg-gray-200 self-end mb-1"></div>

                              {/* Quantity controls */}
                              <div className="w-full sm:w-auto">
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 block mb-2">
                                  Select Quantity
                                </span>
                                <div className="flex items-center justify-between border border-gray-200 bg-white w-full sm:w-44 px-4 py-3.5 rounded-xl">
                                  <button
                                    onClick={() => updateLocalBuyNowQty(localBuyNowItem.quantity - 1)}
                                    className="text-gray-500 hover:text-[#123C24] transition-colors cursor-pointer"
                                  >
                                    <Minus size={18} />
                                  </button>
                                  <span className="text-lg font-bold text-gray-800">{localBuyNowItem.quantity}</span>
                                  <button
                                    onClick={() => updateLocalBuyNowQty(localBuyNowItem.quantity + 1)}
                                    className="text-gray-500 hover:text-[#123C24] transition-colors cursor-pointer"
                                  >
                                    <Plus size={18} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Pricing Summary Box */}
                        <div className="flex flex-col sm:flex-row items-center justify-between border border-gray-100 bg-[#FAFAFA] p-4 rounded-2xl gap-4">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="w-10 h-10 rounded-full bg-[#EAEFEA] flex items-center justify-center text-[#123C24] flex-shrink-0">
                              <ShoppingBag size={18} />
                            </div>
                            <div>
                              <span className="text-xs text-gray-500 font-medium block">Unit Price</span>
                              <span className="text-xl font-bold text-gray-800">₹{localBuyNowItem.price}</span>
                            </div>
                          </div>

                          {/* Dotted Divider */}
                          <div className="hidden sm:block flex-grow border-l border-dashed border-gray-200 h-10 mx-6"></div>

                          <div className="w-full sm:w-auto bg-[#F2F6F3] px-6 py-3 rounded-xl border border-[#DCE8DF] flex items-center justify-between sm:justify-start gap-8">
                            <span className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Item Total</span>
                            <span className="text-2xl font-black text-[#123C24]">₹{localBuyNowItem.price * localBuyNowItem.quantity}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Cart Multi-Item Selector */
                      <div className="space-y-4">
                        {cart.map((item) => (
                          <div key={`${item.id}-${item.weight}`} className="flex flex-col sm:flex-row gap-4 p-4 bg-white border border-gray-100 rounded-2xl relative shadow-xs">
                            <div className="w-20 h-20 bg-brand-dark/5 flex items-center justify-center p-1 flex-shrink-0 rounded-xl">
                              <img src={item.image} alt={item.name} className="max-h-full object-contain rounded-lg" />
                            </div>
                            <div className="flex-grow flex flex-col justify-between">
                              <div className="pr-8">
                                <h3 className="font-playfair font-bold text-sm text-brand-dark leading-tight">{item.name}</h3>
                                <span className="text-[10px] text-brand-saffron font-bold uppercase tracking-wider block mt-0.5">{item.weight}</span>
                              </div>

                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center border border-gray-200 bg-[#FDFBF7] w-fit rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => updateQuantity(item.id, item.weight, item.quantity - 1)}
                                    className="px-2 py-1.5 text-brand-dark/60 hover:text-brand-dark transition-colors cursor-pointer"
                                  >
                                    <Minus size={12} />
                                  </button>
                                  <span className="px-3 text-xs font-bold text-brand-dark">{item.quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(item.id, item.weight, item.quantity + 1)}
                                    className="px-2 py-1.5 text-brand-dark/60 hover:text-brand-dark transition-colors cursor-pointer"
                                  >
                                    <Plus size={12} />
                                  </button>
                                </div>

                                <div className="text-right text-xs font-bold">
                                  <span className="text-[10px] text-brand-dark/40 block">₹{item.price} each</span>
                                  <span className="text-brand-dark">₹{item.price * item.quantity}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id, item.weight)}
                              className="absolute top-4 right-4 text-brand-dark/30 hover:text-brand-maroon transition-colors cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}

                        <div className="flex justify-between items-center p-4 bg-[#FAFAFA] border border-gray-100 rounded-2xl">
                          <span className="text-xs md:text-sm font-extrabold uppercase tracking-widest text-brand-dark">Subtotal</span>
                          <span className="text-lg md:text-xl font-playfair font-black text-brand-dark">₹{cartSubtotal}</span>
                        </div>
                      </div>
                    )}

                    {/* Navigation Button */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3.5 pt-6 border-t border-gray-100">
                      <button
                        onClick={() => {
                          if (buyNowItem) setBuyNowItem(null);
                          navigate('/products');
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 border border-gray-200 bg-white rounded-xl text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                      >
                        <ArrowLeft size={16} />
                        <span>Return to shop</span>
                      </button>

                      <button
                        onClick={handleStep1Next}
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#123C24] hover:bg-brand-olive text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Next: Delivery Info</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step-2" {...slideAnim} className="space-y-6">
                    <form onSubmit={handleStep2Next} className="space-y-5 sm:space-y-6">
                      {/* Notice Banner */}
                      <div className="bg-[#FAF8F5] border border-[#ECE7DE] px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl text-xs sm:text-sm text-gray-600 flex items-center gap-3">
                        <MapPin size={18} className="text-[#123C24] flex-shrink-0" />
                        <span>Please provide accurate delivery information to ensure prompt dispatch.</span>
                      </div>

                      {/* Row 1: Name, Phone & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            FULL NAME <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="e.g. Rajesh Kumar"
                            className={`w-full bg-white border ${
                              errors.name ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.name && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            PHONE NUMBER <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="10-digit mobile number"
                            maxLength={13}
                            className={`w-full bg-white border ${
                              errors.phone ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.phone && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            EMAIL ADDRESS <span className="text-red-500">*</span> <span className="text-emerald-700 font-medium text-[10px]">(Confirmation message sent here)</span>
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g. customer@gmail.com"
                            className={`w-full bg-white border ${
                              errors.email ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.email && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Door No. & Area / Street (2 equal columns matching reference) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            DOOR NO. <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="doorNo"
                            value={formData.doorNo}
                            onChange={handleInputChange}
                            placeholder="e.g. 12/4B or Flat 201"
                            className={`w-full bg-white border ${
                              errors.doorNo ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.doorNo && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.doorNo}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            AREA / STREET NAME <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                            placeholder="e.g. Gandhi Nagar, 2nd Main Road"
                            className={`w-full bg-white border ${
                              errors.street ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.street && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.street}</p>
                          )}
                        </div>
                      </div>

                      {/* Row 3: District, State, Pincode (3 columns) */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            DISTRICT / CITY <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            placeholder="e.g. Madurai"
                            className={`w-full bg-white border ${
                              errors.district ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.district && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.district}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            STATE <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className={`w-full appearance-none bg-white border ${
                                errors.state ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                              } px-4 py-3 sm:py-3.5 pr-10 text-sm rounded-xl text-gray-800 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all cursor-pointer`}
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors.state && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.state}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-dark mb-1.5">
                            PINCODE <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            placeholder="6-digit PIN"
                            maxLength={6}
                            className={`w-full bg-white border ${
                              errors.pincode ? 'border-brand-maroon bg-brand-maroon/5' : 'border-gray-200'
                            } px-4 py-3 sm:py-3.5 text-sm rounded-xl text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#123C24] focus:ring-2 focus:ring-[#123C24]/10 transition-all`}
                          />
                          {errors.pincode && (
                            <p className="text-brand-maroon text-xs font-semibold mt-1">{errors.pincode}</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons: Responsive and Aligned */}
                      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3.5 pt-6 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            setStep(1);
                            setTimeout(scrollToTop, 50);
                          }}
                          className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#123C24] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        >
                          <ArrowLeft size={16} />
                          <span>BACK TO QUANTITY</span>
                        </button>

                        <button
                          type="submit"
                          className="w-full sm:w-auto px-8 py-3.5 bg-[#123C24] hover:bg-brand-olive text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span>NEXT: REVIEW ORDER</span>
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step-3" {...slideAnim} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Items Summaries */}
                      <div className="bg-white p-2 md:p-4 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F2F7F3] text-[#0F3D2E] flex items-center justify-center">
                            <ShoppingBag size={20} />
                          </div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]">Order Specifications</h3>
                        </div>
                        
                        <div className="divide-y divide-[#DDE5DF] border-t border-b border-[#DDE5DF]">
                          {activeItems.map((item) => (
                            <div key={`${item.id}-${item.weight}`} className="py-4 flex gap-4 items-center">
                              <div className="w-20 h-20 md:w-24 md:h-24 bg-white flex items-center justify-center p-1 border border-[#DDE5DF] rounded-xl flex-shrink-0">
                                <img src={item.image} alt={item.name} className="max-h-full object-cover rounded-lg" />
                              </div>
                              <div className="flex-grow flex justify-between items-center">
                                <div>
                                  <p className="font-playfair font-bold text-[#14251F] text-lg leading-snug">{item.name}</p>
                                  <span className="text-xs text-[#6B746F] font-semibold block mt-1">
                                    {item.weight} &times; {item.quantity}
                                  </span>
                                </div>
                                <div className="text-right text-xl font-bold text-[#14251F]">
                                  ₹{item.price * item.quantity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pricing Box */}
                        <div className="flex items-center justify-between border border-[#DDE5DF] bg-[#F2F7F3] p-5 rounded-2xl gap-4">
                          <span className="text-xs md:text-sm text-[#0F3D2E] font-black uppercase tracking-wider">Final Order Total</span>
                          
                          {/* Dotted Divider */}
                          <div className="hidden sm:block flex-grow border-l border-dashed border-[#6B746F]/30 h-8 mx-4"></div>

                          <div className="text-3xl font-black text-[#0F3D2E]">
                            ₹{activeTotal}
                          </div>
                        </div>

                        {/* Payment Mode Notice Box */}
                        <div className="bg-[#FAF7F0] border-2 border-brand-saffron/40 rounded-2xl p-4 sm:p-5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#123C24] flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                              Payment Method: Online Payment
                            </span>
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">UPI / GPay / PhonePe</span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed pt-1">
                            We accept <strong>Online Payments only</strong>. Our team will contact you shortly with payment instructions after placing the order.
                          </p>
                          <p className="text-xs text-[#123C24] font-semibold pt-1">
                            📞 If you have any doubts, please call or WhatsApp: <a href="tel:+916385172761" className="underline font-bold text-brand-saffron hover:text-[#123C24]">+91 63851 72761</a>
                          </p>
                        </div>
                      </div>

                      {/* Customer Details Box */}
                      <div className="bg-white p-2 md:p-4 space-y-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F2F7F3] text-[#0F3D2E] flex items-center justify-center">
                            <MapPin size={20} />
                          </div>
                          <h3 className="font-bold text-xs uppercase tracking-wider text-[#0F3D2E]">Shipment Details</h3>
                        </div>

                        <div className="bg-white border border-[#DDE5DF] rounded-2xl p-5 divide-y divide-[#DDE5DF] space-y-4">
                          {/* Name */}
                          <div className="flex items-start gap-4 pt-1">
                            <div className="w-10 h-10 rounded-full bg-[#F2F7F3] text-[#0F3D2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <User size={18} />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B746F] block">Customer Name</span>
                              <span className="text-base font-semibold text-[#14251F] block">{formData.name}</span>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-start gap-4 pt-4">
                            <div className="w-10 h-10 rounded-full bg-[#F2F7F3] text-[#0F3D2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Phone size={18} />
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B746F] block">Phone Number</span>
                              <span className="text-base font-semibold text-[#14251F] block">{formData.phone}</span>
                            </div>
                          </div>

                          {/* Email */}
                          {formData.email && (
                            <div className="flex items-start gap-4 pt-4">
                              <div className="w-10 h-10 rounded-full bg-[#F2F7F3] text-[#0F3D2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Mail size={18} />
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B746F] block">Email Address</span>
                                <span className="text-base font-semibold text-[#14251F] block">{formData.email}</span>
                              </div>
                            </div>
                          )}

                          {/* Structured Address */}
                          <div className="flex items-start gap-4 pt-4 pb-1">
                            <div className="w-10 h-10 rounded-full bg-[#F2F7F3] text-[#0F3D2E] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MapPin size={18} />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B746F] block">Delivery Address</span>
                              <div className="text-sm font-medium text-[#14251F] leading-relaxed">
                                <p><span className="text-gray-500 text-xs">Door No:</span> <span className="font-semibold">{formData.doorNo}</span></p>
                                <p><span className="text-gray-500 text-xs">Area / Street:</span> <span className="font-semibold">{formData.street}</span></p>
                                <p><span className="text-gray-500 text-xs">District:</span> <span className="font-semibold">{formData.district}</span></p>
                                <p><span className="text-gray-500 text-xs">State:</span> <span className="font-semibold">{formData.state}</span> &bull; <span className="text-gray-500 text-xs">PIN:</span> <span className="font-semibold">{formData.pincode}</span></p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <div className="mt-6 bg-brand-maroon/5 border border-brand-maroon/20 p-4 flex gap-3 text-brand-maroon items-center rounded-xl">
                        <AlertCircle size={18} className="flex-shrink-0" />
                        <p className="text-xs font-semibold">{submitError}</p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3.5 pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={() => {
                          setStep(2);
                          setTimeout(scrollToTop, 50);
                        }}
                        className="w-full sm:w-auto px-6 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 text-[#123C24] rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                        disabled={isSubmitting}
                      >
                        <ArrowLeft size={16} />
                        <span>BACK TO ADDRESS</span>
                      </button>

                      <button
                        onClick={handleConfirmOrder}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3.5 bg-[#123C24] hover:bg-brand-olive text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin text-white" />
                            <span>SENDING ORDER...</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            <span>CONFIRM ORDER</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Security Info */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-2">
                      <Lock size={14} className="text-gray-400" />
                      <span>Your information is secure and safe with us.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.96, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white border border-[#22c55e]/30 p-6 sm:p-8 md:p-10 shadow-lg max-w-xl mx-auto rounded-3xl text-left"
            >
              {/* Header Badge & Title */}
              <div className="text-center pb-6 border-b border-gray-100">
                <div className="w-16 h-16 bg-[#22c55e]/10 text-[#16a34a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xs">
                  <CheckCircle2 size={38} className="stroke-[2.5]" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-playfair font-black text-[#14251F] mb-1">
                  Order placed successfully 🎉
                </h2>
                <p className="text-sm sm:text-base font-semibold text-brand-dark/80 mt-1">
                  Thank you, <span className="text-[#123C24] font-bold">{formData.name || 'Valued Customer'}</span>!
                </p>
                <div className="inline-flex items-center gap-1.5 bg-[#FAF7F0] border border-brand-saffron/30 px-3.5 py-1.5 rounded-full mt-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#123C24]">
                    Order ID: #{generatedOrderId}
                  </span>
                </div>

                {/* Email Confirmation Dispatch Notice */}
                {formData.email && (
                  <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-start gap-2.5 text-left">
                    <Mail size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                    <p className="leading-snug">
                      A confirmation message has been sent to <strong>{formData.email}</strong>. (Please check your Inbox or Spam folder).
                    </p>
                  </div>
                )}
              </div>

              {/* Product Breakdown */}
              <div className="py-5 border-b border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Product</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Total</span>
                </div>

                <div className="space-y-3">
                  {(placedOrder?.items || []).map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm">
                      <div className="pr-4">
                        <p className="font-bold text-[#14251F] leading-tight">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {item.weight ? `${item.weight} · ` : ''}Quantity: <span className="font-semibold text-gray-700">{item.quantity}</span> &bull; ₹{item.price} each
                        </p>
                      </div>
                      <span className="font-bold text-[#14251F] text-sm whitespace-nowrap">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="py-5 border-b border-gray-100">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block mb-2">
                  Delivery Address
                </span>
                <div className="bg-[#FAF8F5] border border-gray-100 rounded-2xl p-4 text-xs sm:text-sm text-[#14251F] space-y-1">
                  <p><span className="text-gray-500">Door No:</span> <span className="font-semibold">{formData.doorNo}</span></p>
                  <p><span className="text-gray-500">Area / Street:</span> <span className="font-semibold">{formData.street}</span></p>
                  <p><span className="text-gray-500">District:</span> <span className="font-semibold">{formData.district}</span></p>
                  <p><span className="text-gray-500">State:</span> <span className="font-semibold">{formData.state}</span> &bull; <span className="text-gray-500">Pincode:</span> <span className="font-semibold">{formData.pincode}</span></p>
                  {formData.email && (
                    <p className="pt-1 text-gray-600"><span className="text-gray-500">Email:</span> <span className="font-semibold">{formData.email}</span></p>
                  )}
                  <p className="text-gray-600"><span className="text-gray-500">Phone:</span> <span className="font-semibold">{formData.phone}</span></p>
                </div>
              </div>

              {/* Total & Delivery */}
              <div className="py-5 space-y-2">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                  <span>Delivery Charge:</span>
                  <span className="font-bold text-[#16a34a]">Free</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-lg sm:text-xl font-bold border-t border-gray-100">
                  <span className="font-playfair text-[#14251F]">Total:</span>
                  <span className="font-playfair text-[#123C24] font-black">
                    ₹{placedOrder?.total || activeTotal}
                  </span>
                </div>
              </div>

              {/* Online Payment Notice & Contact Banner */}
              <div className="my-4 bg-[#FAF7F0] border-2 border-brand-saffron/40 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">💳</span>
                  <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#123C24]">
                    Online Payment & Confirmation
                  </h4>
                </div>
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  We accept <strong>Online Payments only</strong>. We will contact you shortly with the payment instructions and delivery schedule.
                </p>
                <div className="pt-2.5 border-t border-brand-saffron/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-xs text-gray-600 font-semibold">If any doubt, please call or message:</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="tel:+916385172761"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#123C24] hover:bg-brand-olive text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <Phone size={13} />
                      <span>+91 63851 72761</span>
                    </a>
                    <a
                      href="https://wa.me/916385172761"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* CTA Continue Shopping */}
              <div className="pt-3">
                <button
                  onClick={() => {
                    setFormData({ name: '', phone: '', email: '', doorNo: '', street: '', district: '', state: 'Tamil Nadu', pincode: '' });
                    setLocalBuyNowItem(null);
                    setPlacedOrder(null);
                    navigate('/products');
                  }}
                  className="w-full py-4 bg-[#123C24] hover:bg-brand-olive text-[#F5E8CF] hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group"
                >
                  <ShoppingBag size={16} className="group-hover:scale-110 transition-transform" />
                  <span>Continue Shopping</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Checkout;
