import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import AnimatedSection from '../components/AnimatedSection';
import { galleryImages } from '../data/mockData';

const categories = ['All', 'Harvest', 'Process', 'Products'];

// Vibrant category accent colors
const catAccent = {
  Farm: { bg: '#1A4A2E', light: '#e8f5e9', text: '#1A4A2E' },
  Harvest: { bg: '#D4891A', light: '#fff8e1', text: '#7B4A00' },
  Process: { bg: '#5C1A1A', light: '#fce4ec', text: '#5C1A1A' },
  Products: { bg: '#C8A96B', light: '#fdf6e3', text: '#7A5C2E' },
};

import { Helmet } from 'react-helmet-async';

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const filtered = activeCategory === 'All'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#F7F2EA]">
      <Helmet>
        <title>Our Farm &amp; Craft Gallery | Uzhavan Thottam</title>
        <meta name="description" content="Take a visual journey into our fields. See our golden harvests, traditional wood-pressing processing, and organic farming methods at Uzhavan Thottam." />
        <meta name="keywords" content="farming gallery, organic harvest photos, wood pressing pictures, agriculture gallery, Uzhavan Thottam photos" />
      </Helmet>

      {/* ── Header ──────────────────────────── */}
      <section className="py-20 bg-brand-dark relative overflow-hidden">
        {/* Colorful left accent */}
        <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-brand-saffron via-brand-saffron to-brand-maroon" />
        {/* Dot texture */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #C8A96B 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }}
        />

        <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-10 text-center">
          <AnimatedSection direction="up">
            <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-4 block">
              Visual Journey
            </span>
            <h1 className="font-playfair font-bold text-brand-cream text-3xl sm:text-5xl md:text-7xl mb-5">
              Our Farm &amp; Craft
            </h1>
            <p className="text-brand-cream/50 max-w-xl mx-auto text-base md:text-lg leading-relaxed">
              From lush fields to your table — a glimpse into our traditional methods,
              golden harvests, and the authentic journey of every product.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* ── Category Filter ─────────────────── */}
      <section className="sticky top-[64px] sm:top-[72px] z-30 bg-[#F7F2EA] border-b border-brand-dark/8 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex flex-wrap justify-center gap-3">
          {categories.map((cat) => {
            const isActive = activeCategory === cat;
            const accent = cat !== 'All' ? catAccent[cat] : null;
            return (
              <motion.button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2 text-xs font-bold tracking-widest uppercase border transition-all duration-250 ${isActive
                  ? 'bg-brand-dark text-brand-saffron border-brand-dark'
                  : 'bg-white text-brand-dark/55 border-brand-dark/10 hover:border-brand-saffron/50 hover:text-brand-dark'
                  }`}
                style={isActive && accent ? { backgroundColor: accent.bg, borderColor: accent.bg, color: '#F5E8CF' } : {}}
              >
                {cat}
              </motion.button>
            );
          })}
          <span className="text-brand-dark/30 text-xs self-center ml-2">
            {filtered.length} photos
          </span>
        </div>
      </section>

      {/* ── Gallery Grid ────────────────────── */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-5 space-y-5"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((img, idx) => {
                const accent = catAccent[img.category] || catAccent.Farm;
                return (
                  <motion.div
                    key={`${img.src}-${img.category}-${idx}`}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.35, delay: idx * 0.03 }}
                    className="relative group cursor-pointer break-inside-avoid mb-5 overflow-hidden"
                    onClick={() => setSelectedImage(img)}
                  >
                    <img
                      src={img.src}
                      alt={img.label}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Colorful overlay on hover — NOT greyscale */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col items-center justify-center gap-3"
                      style={{ backgroundColor: `${accent.bg}CC` }}
                    >
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        whileHover={{ scale: 1 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="w-11 h-11 bg-white/20 border border-white/40 flex items-center justify-center rounded-full"
                      >
                        <ZoomIn size={20} className="text-white" />
                      </motion.div>
                      <p className="text-white font-bold text-sm tracking-wide">{img.label}</p>
                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-3 py-0.5"
                        style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
                      >
                        {img.category}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-24 text-brand-dark/30 font-playfair text-xl">
              No images in this category.
            </div>
          )}
        </div>
      </section>

      {/* ── Lightbox ────────────────────────── */}
      <AnimatePresence>
        {selectedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="absolute inset-0 bg-brand-dark/92"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="relative z-10 max-w-4xl w-full flex flex-col items-center"
            >
              {/* Close */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-2 right-2 md:-top-12 md:right-0 bg-brand-dark/80 md:bg-transparent p-1.5 md:p-0 rounded-full md:rounded-none text-brand-cream/80 hover:text-brand-saffron transition-colors cursor-pointer z-20"
                aria-label="Close image modal"
              >
                <X size={28} className="md:w-9 md:h-9" />
              </button>

              {/* Image */}
              <img
                src={selectedImage.src}
                alt={selectedImage.label}
                className="max-w-full max-h-[78vh] object-contain"
              />

              {/* Label bar */}
              <div
                className="mt-4 px-6 py-3 flex items-center gap-4"
                style={{ backgroundColor: catAccent[selectedImage.category]?.bg || '#1A4A2E' }}
              >
                <p className="text-white font-bold tracking-wide">{selectedImage.label}</p>
                <span className="text-white/60 text-xs uppercase tracking-widest">{selectedImage.category}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Instagram CTA ───────────────────── */}
      <section className="py-20 bg-brand-dark relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(45deg, #C8A96B 25%, transparent 25%, transparent 75%, #C8A96B 75%), linear-gradient(45deg, #C8A96B 25%, transparent 25%, transparent 75%, #C8A96B 75%)', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}
        />
        <div className="max-w-3xl mx-auto px-5 md:px-10 text-center relative z-10">
          <AnimatedSection direction="zoom">
            <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-5 block">
              Follow Our Story
            </span>
            <h2 className="font-playfair font-bold text-brand-cream text-3xl sm:text-4xl md:text-5xl mb-4">
              @Uzhavan_2026
            </h2>
            <p className="text-brand-cream/40 text-sm mb-10">
              Daily stories from our farm, recipes, and behind-the-scenes of traditional production.
            </p>
            <a
              href="https://www.instagram.com/Uzhavan_2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 border border-brand-saffron/40 text-brand-saffron px-10 py-3 text-xs font-bold tracking-widest uppercase hover:bg-brand-saffron hover:text-brand-dark transition-all duration-300"
            >
              Visit Instagram Profile
            </a>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
