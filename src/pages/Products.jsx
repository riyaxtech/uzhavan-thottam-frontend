import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ShoppingBag } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import ProductCard from '../components/ProductCard';
import { products } from '../data/mockData';

import { Helmet } from 'react-helmet-async';

const Products = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Separate active products from remaining (launching soon) products
  const { activeProducts, remainingProducts } = useMemo(() => {
    const active = [];
    const remaining = [];
    filteredProducts.forEach((product) => {
      if (product.available) {
        active.push(product);
      } else {
        remaining.push(product);
      }
    });
    return { activeProducts: active, remainingProducts: remaining };
  }, [filteredProducts]);

  return (
    <div className="pt-14 bg-[#F7F2EA] ">
      <Helmet>
        <title>Our Organic Products Collection | Uzhavan Thottam</title>
        <meta name="description" content="Explore our collection of 100% organic, traditionally processed products. Shop cold-pressed oils, natural sweeteners, honey, dry fruits, and spices direct from farm to your kitchen." />
        <meta name="keywords" content="organic sweeteners, wood pressed oil, traditional spices, natural food powders, purchase organic online, Uzhavan Thottam catalog" />
      </Helmet>
      {/* Header */}
      <section className="py-20 bg-brand-dark text-brand-cream relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #C8A96B 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}
        />
        <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-brand-saffron via-brand-saffron to-brand-maroon" />
        <div className="container-custom relative z-10 px-6 text-center">
          <AnimatedSection>
            <span className="text-brand-saffron font-bold tracking-[0.28em] uppercase text-xs mb-4 block">Our Collection</span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-playfair font-bold text-brand-cream mb-5">All Products</h1>
            <p className="text-brand-cream/50 max-w-xl mx-auto text-base md:text-lg">
              Traditionally processed, 100% organic products sourced directly from nature's lap.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Filter & Search Bar */}
      <section className="sticky top-[64px] sm:top-[72px] z-30 bg-[#F7F2EA] border-b border-brand-dark/8 py-3 sm:py-4">
        <div className="container-custom px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-3.5 sm:gap-5">
          {/* Categories */}
          <div className="w-full md:w-auto flex items-center overflow-x-auto no-scrollbar gap-2 pb-1 md:pb-0 md:flex-wrap md:justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 sm:px-5 py-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest whitespace-nowrap flex-shrink-0 transition-all duration-250 border cursor-pointer ${activeCategory === category
                  ? 'bg-brand-dark text-brand-saffron border-brand-dark shadow-xs'
                  : 'bg-white text-brand-dark/65 border-brand-dark/10 hover:border-brand-saffron/50 hover:text-brand-dark'
                  }`}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-72 flex-shrink-0">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-brand-dark/10 px-5 py-2.5 pl-11 text-xs sm:text-sm focus:outline-none focus:border-brand-saffron transition-colors rounded-xs"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-dark/35" size={16} />
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="section-padding bg-[#F7F2EA]">
        <div className="container-custom">
          {filteredProducts.length > 0 ? (
            <div className="space-y-10 sm:space-y-16">
              {/* ── Active Products (Displayed Starting) ── */}
              {activeProducts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-5 sm:mb-6 pb-2.5 sm:pb-3 border-b border-brand-dark/10">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-600 animate-pulse" />
                      <h2 className="font-playfair font-bold text-lg sm:text-2xl text-brand-dark">
                        Available Products
                      </h2>
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                      Ready to Order ({activeProducts.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {activeProducts.map((product, idx) => (
                      <div key={product.id} className="h-full">
                        <ProductCard product={product} index={idx} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Separator Line ── */}
              {activeProducts.length > 0 && remainingProducts.length > 0 && (
                <div className="relative py-2 sm:py-4">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t-2 border-dashed border-brand-dark/15" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#F7F2EA] px-4 sm:px-5 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-brand-maroon flex items-center gap-1.5 sm:gap-2 border border-brand-maroon/20 rounded-full shadow-2xs">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-maroon" />
                      Launching Soon Products
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-maroon" />
                    </span>
                  </div>
                </div>
              )}

              {/* ── Remaining Products (Displayed After Line) ── */}
              {remainingProducts.length > 0 && (
                <div>
                  {activeProducts.length === 0 && (
                    <div className="flex items-center justify-between mb-5 sm:mb-6 pb-2.5 sm:pb-3 border-b border-brand-dark/10">
                      <h2 className="font-playfair font-bold text-lg sm:text-2xl text-brand-dark">
                        Launching Soon Products
                      </h2>
                      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
                        Coming Soon ({remainingProducts.length})
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                    {remainingProducts.map((product, idx) => (
                      <div key={product.id} className="h-full">
                        <ProductCard product={product} index={idx + activeProducts.length} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-brand-dark/40 text-xl font-playfair">No products found matching your criteria.</p>
            </div>
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-brand-dark/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-brand-cream w-full max-w-5xl rounded-sm overflow-hidden shadow-2xl flex flex-col md:flex-row"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 text-brand-dark/40 hover:text-brand-dark transition-colors"
                type="button"
              >
                <X size={32} />
              </button>

              <div className="md:w-1/2 bg-white">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover aspect-square md:aspect-auto" />
              </div>

              <div className="md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
                <span className="text-brand-saffron font-bold tracking-[0.2em] uppercase text-xs mb-4 block">{selectedProduct.category}</span>
                <h2 className="text-4xl font-playfair font-bold text-brand-dark mb-6">{selectedProduct.name}</h2>
                <div className="h-px w-full bg-brand-dark/10 mb-8" />
                <p className="text-brand-dark/70 text-lg leading-relaxed mb-6">
                  {selectedProduct.description}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
