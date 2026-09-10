import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  Check,
  Truck,
  Eye,
  X,
  ChevronRight,
  Share2,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { products } from '../data/mockData';
import { useCart } from '../context/CartContext';

// Category color accent definitions matching brand identity
const catColors = {
  Oils: { dot: '#D4891A', label: 'bg-amber-50 text-amber-800 border-amber-200' },
  Sweeteners: { dot: '#5C1A1A', label: 'bg-red-50 text-red-800 border-red-200' },
  Beverages: { dot: '#1A4A2E', label: 'bg-green-50 text-green-800 border-green-200' },
  Spices: { dot: '#B45309', label: 'bg-orange-50 text-orange-800 border-orange-200' },
  'Dry Fruits': { dot: '#78350F', label: 'bg-yellow-50 text-yellow-800 border-yellow-200' },
  Dairy: { dot: '#4B5563', label: 'bg-gray-50 text-gray-800 border-gray-200' },
  Pickles: { dot: '#991B1B', label: 'bg-rose-50 text-rose-800 border-rose-200' },
  Fresh: { dot: '#15803D', label: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setBuyNowItem, setIsCartOpen } = useCart();

  const product = products.find((p) => p.id === parseInt(id, 10));

  // Weight options
  const weightOptions = product?.prices ? Object.keys(product.prices) : ['Standard'];
  const [selectedWeight, setSelectedWeight] = useState(weightOptions[0] || '500g');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync state when route ID changes; bounce out if product is launching soon / inactive
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (product && !product.available) {
      navigate('/products', { replace: true });
      return;
    }
    if (product?.prices) {
      const keys = Object.keys(product.prices);
      setSelectedWeight(keys[0] || '500g');
    }
    setQuantity(1);
    setActiveImageIndex(0);
  }, [id, product, navigate]);

  if (!product || !product.available) {
    const isLaunchingSoon = product && !product.available;
    return (
      <div className="pt-32 pb-24 bg-[#F7F2EA] min-h-[75vh] flex flex-col items-center justify-center text-center px-6">
        <Helmet>
          <title>{isLaunchingSoon ? 'Launching Soon | Uzhavan Thottam' : 'Product Not Found | Uzhavan Thottam'}</title>
        </Helmet>
        <div className="w-16 h-16 rounded-full bg-brand-maroon/10 text-brand-maroon flex items-center justify-center mb-4">
          {isLaunchingSoon ? <Clock size={32} /> : <AlertCircle size={32} />}
        </div>
        <h2 className="text-3xl font-playfair font-bold text-brand-dark mb-2">
          {isLaunchingSoon ? 'Product Launching Soon' : 'Product Not Found'}
        </h2>
        <p className="text-brand-dark/60 text-sm max-w-md mb-6 leading-relaxed">
          {isLaunchingSoon
            ? `"${product.name}" is launching soon and is not currently available for individual ordering. Only active products can be opened.`
            : 'The product you are searching for does not exist or has been relocated.'}
        </p>
        <Link
          to="/products"
          className="px-8 py-3 bg-brand-dark hover:bg-brand-olive text-brand-cream text-xs font-bold uppercase tracking-widest transition-colors inline-flex items-center gap-2 rounded-xl"
        >
          <ArrowLeft size={16} />
          <span>Browse Active Products</span>
        </Link>
      </div>
    );
  }

  // Active unit price based on selected weight
  const currentUnitPrice =
    product.prices?.[selectedWeight] ||
    (typeof product.price === 'string'
      ? parseInt(product.price.replace(/[^0-9]/g, ''), 10)
      : product.price) ||
    0;

  // Images gallery list
  const galleryImages =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const activeImage = galleryImages[activeImageIndex] || product.image;

  // Related products in the same category (only active available products)
  const categoryRelated = products.filter(
    (p) => p.available && p.category === product.category && p.id !== product.id
  );
  // If fewer than 4, supplement with other available products
  const remainingCount = 4 - categoryRelated.length;
  const otherProducts =
    remainingCount > 0
      ? products.filter(
          (p) => p.available && p.category !== product.category && p.id !== product.id
        ).slice(0, remainingCount)
      : [];
  const relatedProducts = [...categoryRelated, ...otherProducts].slice(0, 4);

  const cat = catColors[product.category] || catColors.Oils;

  const handleAddToCart = () => {
    addToCart(product, selectedWeight, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1800);
    setIsCartOpen(true);
  };

  const handleBuyNow = () => {
    setBuyNowItem({
      id: product.id,
      name: product.name,
      image: activeImage,
      category: product.category,
      weight: selectedWeight,
      quantity,
      price: currentUnitPrice,
    });
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="pt-20 md:pt-24 pb-20 bg-[#F7F2EA] min-h-screen">
      <Helmet>
        <title>{product.name} — Buy Pure & Organic | Uzhavan Thottam</title>
        <meta
          name="description"
          content={`${product.name} by Uzhavan Thottam. ${product.description} 100% natural, chemical-free and traditionally prepared.`}
        />
      </Helmet>

      {/* ── Breadcrumb & Navigation Bar ── */}
      <div className="max-w-7xl mx-auto px-5 md:px-10 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-dark/10 pb-4">
          <nav className="flex items-center gap-2 text-xs text-brand-dark/60">
            <Link to="/" className="hover:text-brand-saffron transition-colors">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link to="/products" className="hover:text-brand-saffron transition-colors">
              Products
            </Link>
            <ChevronRight size={12} />
            <span className="font-semibold text-brand-dark truncate max-w-[200px] sm:max-w-none">
              {product.name}
            </span>
          </nav>

          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-dark/70 hover:text-brand-saffron transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      {/* ── Main Product Section (2 Columns) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 mt-4 sm:mt-6">
        <div className="bg-white border border-brand-dark/10 rounded-2xl sm:rounded-3xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 p-4 sm:p-6 md:p-10">
          
          {/* ════════════════════════════════════════════════
              LEFT SIDE: Product Image & Gallery
          ════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            <div>
              {/* Primary Image Container */}
              <div className="relative aspect-[4/4.5] sm:aspect-square w-full max-w-md md:max-w-lg lg:max-w-none mx-auto bg-[#FAF7F0] rounded-xl overflow-hidden border border-brand-dark/8 flex items-center justify-center group shadow-inner">
                {/* Lightbox / Zoom Button */}
                <button
                  onClick={() => setIsLightboxOpen(true)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 hover:bg-white text-brand-dark rounded-full shadow-md flex items-center justify-center opacity-80 hover:opacity-100 transition-all hover:scale-105 cursor-pointer"
                  title="Zoom Image"
                >
                  <Eye size={16} />
                </button>

                {/* Main Image */}
                <motion.img
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  src={activeImage}
                  alt={product.name}
                  className="w-full h-full object-cover cursor-zoom-in transition-transform duration-500 group-hover:scale-105"
                  onClick={() => setIsLightboxOpen(true)}
                />
              </div>

              {/* Product Image Gallery (Thumbnails) */}
              {galleryImages.length > 1 && (
                <div className="mt-4 max-w-md md:max-w-lg lg:max-w-none mx-auto">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-dark/50 block mb-2">
                    Product Image Gallery ({galleryImages.length} photos)
                  </span>
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    {galleryImages.map((img, idx) => {
                      const isActive = activeImageIndex === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveImageIndex(idx)}
                          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all cursor-pointer bg-[#FAF7F0] ${
                            isActive
                              ? 'border-brand-saffron ring-2 ring-brand-saffron/40 scale-105 shadow-sm'
                              : 'border-brand-dark/15 opacity-70 hover:opacity-100 hover:border-brand-saffron/50'
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} - view ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {isActive && (
                            <div className="absolute inset-0 bg-brand-saffron/10 pointer-events-none" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ════════════════════════════════════════════════
              RIGHT SIDE: Details, Price, Weights, Add & Buy
          ════════════════════════════════════════════════ */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Product Name & Share */}
              <div className="flex items-start justify-between gap-4">
                <h1 className="font-playfair font-bold text-3xl sm:text-4xl lg:text-5xl text-brand-dark leading-tight">
                  {product.name}
                </h1>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="text-xs text-brand-dark/60 hover:text-brand-saffron transition-colors inline-flex items-center gap-1 cursor-pointer bg-brand-dark/5 px-2.5 py-1.5 rounded-md flex-shrink-0 mt-1"
                >
                  <Share2 size={13} />
                  <span>{copiedLink ? 'Copied Link!' : 'Share'}</span>
                </button>
              </div>

              {/* Price Banner */}
              <div className="bg-[#FAF7F0] border border-brand-dark/10 p-4 rounded-xl flex items-baseline justify-between">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black text-brand-maroon">
                      ₹{currentUnitPrice}
                    </span>
                    <span className="text-xs font-semibold text-brand-dark/60 uppercase tracking-wider">
                      / {selectedWeight}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-dark/60 font-medium mt-0.5">
                    Inclusive of all taxes &bull; Fresh batch packed
                  </p>
                </div>

                {quantity > 1 && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-brand-dark/50 block">
                      Subtotal
                    </span>
                    <span className="text-xl font-bold text-[#123C24]">
                      ₹{currentUnitPrice * quantity}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-dark">
                  Product Description
                </h3>
                <p className="text-sm md:text-base text-brand-dark/75 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Weight / Available Weight Options */}
              {product.prices && (
                <div className="space-y-2.5 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-dark block">
                    Available Weight / Pack Options
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {Object.entries(product.prices).map(([w, pr]) => {
                      const isSelected = selectedWeight === w;
                      return (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setSelectedWeight(w)}
                          className={`p-3.5 border rounded-xl transition-all cursor-pointer text-left flex items-center justify-between ${
                            isSelected
                              ? 'bg-brand-dark text-[#F5E8CF] border-brand-dark shadow-md ring-2 ring-brand-saffron/80'
                              : 'bg-white text-brand-dark border-brand-dark/15 hover:border-brand-saffron/60 hover:bg-brand-dark/2'
                          }`}
                        >
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider block">
                              {w}
                            </span>
                            <span
                              className={`text-sm font-extrabold block mt-0.5 ${
                                isSelected ? 'text-brand-saffron' : 'text-brand-maroon'
                              }`}
                            >
                              ₹{pr}
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

              {/* Quantity Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-dark block">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-brand-dark/20 bg-white rounded-xl overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                      className="px-4 py-3 text-brand-dark hover:bg-brand-dark/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-5 text-base font-bold text-brand-dark min-w-[3rem] text-center">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => q + 1)}
                      className="px-4 py-3 text-brand-dark hover:bg-brand-dark/10 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="text-xs text-brand-dark/60">
                    Total: <strong className="text-brand-dark text-sm">₹{currentUnitPrice * quantity}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons: Add to Cart & Buy Now */}
            <div className="space-y-3 pt-6 border-t border-brand-dark/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="w-full py-4 px-6 border-2 border-brand-dark bg-transparent hover:bg-brand-dark text-brand-dark hover:text-[#F5E8CF] text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                >
                  <ShoppingBag size={17} />
                  <span>{addedAnimation ? 'Added to Cart ✓' : 'Add to Cart'}</span>
                </button>

                {/* Buy Now */}
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="w-full py-4 px-6 bg-brand-saffron hover:bg-brand-maroon text-brand-dark hover:text-white text-xs font-bold uppercase tracking-widest transition-all duration-300 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98]"
                >
                  <span>Buy Now Directly</span>
                </button>
              </div>

              {/* Delivery Guarantee note */}
              <div className="flex items-center justify-center gap-2 text-xs text-brand-dark/60 pt-2">
                <Truck size={14} className="text-[#123C24]" />
                <span>Pan-India Delivery &bull; Dispatched within 24-48 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RELATED PRODUCTS SECTION (Active Products Only)
      ════════════════════════════════════════════════ */}
      {relatedProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16 md:mt-24">
          <div className="border-t border-brand-dark/10 pt-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-3">
              <div>
                <span className="text-brand-saffron font-bold tracking-[0.25em] uppercase text-xs block mb-1">
                  You May Also Like
                </span>
                <h2 className="font-playfair font-bold text-2xl sm:text-3xl md:text-4xl text-brand-dark">
                  Related Products
                </h2>
              </div>
              <Link
                to="/products"
                className="text-xs font-bold uppercase tracking-wider text-brand-saffron hover:text-brand-maroon transition-colors flex items-center gap-1"
              >
                <span>View full catalog</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            {/* Related Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {relatedProducts.map((rel) => {
                const relWeight = rel.prices ? Object.keys(rel.prices)[0] : '500g';
                const relPrice =
                  rel.prices?.[relWeight] ||
                  (typeof rel.price === 'string'
                    ? parseInt(rel.price.replace(/[^0-9]/g, ''), 10)
                    : rel.price) ||
                  0;

                return (
                  <div
                    key={rel.id}
                    onClick={() => {
                      if (rel.available) {
                        navigate(`/product/${rel.id}`);
                      }
                    }}
                    className="group bg-white border border-brand-dark/10 hover:border-brand-saffron/40 transition-all duration-300 rounded-xl overflow-hidden flex flex-col justify-between cursor-pointer shadow-xs hover:shadow-md h-full"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-[4/4.5] w-full bg-[#FAF7F0] overflow-hidden flex items-center justify-center">
                      <img
                        src={rel.image}
                        alt={rel.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-2 left-2">
                        <span className="text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 bg-white/90 text-brand-dark border border-brand-dark/10 rounded-xs">
                          {rel.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Info */}
                    <div className="p-3.5 flex flex-col flex-grow justify-between">
                      <div>
                        <h4 className="font-playfair font-bold text-sm text-brand-dark line-clamp-1 group-hover:text-brand-saffron transition-colors">
                          {rel.name}
                        </h4>
                        <div className="flex items-baseline justify-between mt-1 mb-3">
                          <span className="text-sm font-bold text-brand-maroon">
                            ₹{relPrice}
                          </span>
                          <span className="text-[10px] text-brand-dark/50 font-semibold uppercase">
                            {relWeight}
                          </span>
                        </div>
                      </div>

                      {/* Add to Cart Option */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(rel, relWeight, 1);
                          setIsCartOpen(true);
                        }}
                        className="w-full py-2 px-2 bg-brand-dark hover:bg-brand-saffron text-[#F5E8CF] hover:text-brand-dark text-[10px] font-bold uppercase tracking-wider text-center transition-all duration-200 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag size={12} />
                        <span>Add to Cart</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── Lightbox Preview Modal ── */}
      <AnimatePresence>
        {isLightboxOpen && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 sm:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLightboxOpen(false)}
              className="absolute inset-0 bg-[#0D2A1A]/90 backdrop-blur-md"
            />
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-6 right-6 z-[1110] text-brand-cream/70 hover:text-brand-saffron p-2 bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X size={28} />
            </button>
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="relative z-[1105] max-w-4xl max-h-[85vh] flex flex-col items-center"
            >
              <img
                src={activeImage}
                alt={product.name}
                className="max-h-[75vh] w-auto object-contain rounded-lg shadow-2xl border border-white/10"
              />
              <div className="mt-4 text-center text-white">
                <p className="font-playfair font-bold text-xl">{product.name}</p>
                <p className="text-xs text-brand-saffron uppercase tracking-widest mt-1">
                  {product.category} &bull; Image {activeImageIndex + 1} of {galleryImages.length}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
