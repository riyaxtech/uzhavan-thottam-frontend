import React, { useMemo } from 'react';
import { ArrowRight, Leaf, ShieldCheck, Heart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/AnimatedSection';
import ProductCard from '../components/ProductCard';
import { products, testimonials } from '../data/mockData';
import heroImg from '../assets/products-group-img.jpeg';
import natureImg from '../assets/about/nature-pic.webp';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

import { Helmet } from 'react-helmet-async';

const Home = () => {
  const featuredProducts = useMemo(() => {
    const active = products.filter((p) => p.available);
    const inactive = products.filter((p) => !p.available);
    return [...active, ...inactive].slice(0, 8);
  }, []);

  return (
    <div className="overflow-hidden">
      <Helmet>
        <title>Uzhavan Thottam | Traditional Organic Foods</title>
        <meta
          name="description"
          content="Uzhavan Thottam offers traditional organic foods, wood pressed oils, natural products and authentic Tamil flavors."
        />
        <meta name="keywords" content="organic food, farm fresh, chemical-free products, wood pressed oil, natural sweeteners, traditional farming, Uzhavan Thottam" />
      </Helmet>

      {/* ══════════════════════════════════════
          HERO — dark green, no blur overlay
      ══════════════════════════════════════ */}
      <section className="relative min-h-[auto] lg:min-h-screen flex flex-col lg:flex-row lg:items-center bg-brand-dark overflow-hidden">
        {/* Brand product image */}
        <div className="relative lg:absolute lg:inset-y-0 lg:right-0 w-full lg:w-[55%] h-[350px] sm:h-[450px] lg:h-full z-10 lg:z-0">
          <img
            src={heroImg}
            alt="Uzhavan Thottam Premium Traditional and Organic Foods Collection"
            className="w-full h-full object-cover object-center"
          />
          {/* Left-to-right fade so text stays readable on desktop, bottom-to-top/dark overlay on mobile */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent lg:bg-gradient-to-r lg:from-brand-dark lg:via-brand-dark/70 lg:to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-20 w-full max-w-7xl mx-auto px-5 md:px-10 pt-8 pb-16 lg:pt-28 lg:pb-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-xl"
          >
            {/* Tag */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <span className="h-px w-8 bg-brand-saffron" />
              <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase">
                Natural · Pure · Trusted
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="font-playfair font-bold text-brand-cream leading-[1.08] mb-6
                         text-4xl sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Taste the<br />
              <span className="text-brand-saffron">Purity</span> of
              Nature.
            </motion.h1>

            {/* Body */}
            <motion.p variants={fadeUp} className="text-brand-cream/55 text-base md:text-lg leading-relaxed mb-10 max-w-md">
              Farm-fresh. Chemical-free. Traditionally crafted organic
              products delivered straight to your door.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-brand-saffron text-brand-dark px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-brand-saffron transition-colors duration-300 group"
              >
                Shop Collection
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 border border-brand-cream/25 text-brand-cream/80 px-7 py-3 text-xs font-bold tracking-widest uppercase hover:border-brand-saffron hover:text-brand-saffron transition-colors duration-300"
              >
                Our Story
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="mt-12 pt-8 border-t border-brand-cream/10 flex gap-10"
            >
              {[
                { val: '100%', label: 'Natural' },
                { val: '0', label: 'Preservatives' },
                { val: '34+', label: 'Products' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <p className="text-brand-saffron font-playfair font-bold text-2xl md:text-3xl">{val}</p>
                  <p className="text-brand-cream/35 text-[10px] uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — WHY UZHAVAN THOTTAM
      ══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-[#F7F2EA] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #1A4A2E 1.5px, transparent 1.5px)', backgroundSize: '36px 36px' }}
        />

        <div className="max-w-7xl mx-auto px-5 md:px-10 relative z-10">
          {/* Heading */}
          <AnimatedSection direction="up" className="text-center mb-16">
            <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-4 block">Our Commitment</span>
            <h2 className="font-playfair font-bold text-brand-dark text-3xl sm:text-4xl md:text-5xl">
              Why{' '}
              <span className="text-brand-maroon">Uzhavan Thottam</span>?
            </h2>
            <div className="h-px w-16 bg-brand-saffron mx-auto mt-5" />
          </AnimatedSection>

          {/* Feature cards — colorful, 3D hover */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Leaf,
                title: '100% Organic',
                desc: 'No chemicals, no pesticides. Every product is purely natural from the soil.',
                accent: '#D4891A', // saffron
                bg: 'from-brand-saffron/10 to-transparent',
                border: 'border-brand-saffron/20 hover:border-brand-saffron/60',
              },
              {
                icon: ShieldCheck,
                title: 'Traditional Process',
                desc: 'Wood pressed and sun-dried — preserving age-old methods that retain nutrients.',
                accent: '#C8A96B', // gold
                bg: 'from-brand-saffron/10 to-transparent',
                border: 'border-brand-saffron/20 hover:border-brand-saffron/60',
              },
              {
                icon: Users,
                title: 'Farmer Direct',
                desc: 'Supporting and empowering local farming communities across Tamil Nadu.',
                accent: '#4CAF50', // green
                bg: 'from-green-500/10 to-transparent',
                border: 'border-green-500/20 hover:border-green-500/60',
              },
              {
                icon: Heart,
                title: 'Pure Quality',
                desc: 'Every batch tested for purity, nutrient retention, and authentic taste.',
                accent: '#E57373', // red-pink
                bg: 'from-red-400/10 to-transparent',
                border: 'border-red-400/20 hover:border-red-400/60',
              },
            ].map((f, idx) => (
              <AnimatedSection
                key={idx}
                direction={idx % 2 === 0 ? 'left' : 'right'}
                delay={idx * 0.1}
              >
                <motion.div
                  whileHover={{ rotateY: 6, rotateX: -6, scale: 1.04 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  style={{ transformStyle: 'preserve-3d', perspective: 800 }}
                  className={`group relative p-7 border border-brand-dark/5 bg-brand-dark transition-all duration-400 cursor-default h-full`}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-sm flex items-center justify-center mb-5 transition-transform duration-400 group-hover:scale-110"
                    style={{ backgroundColor: `${f.accent}20`, border: `1px solid ${f.accent}40` }}
                  >
                    <f.icon size={22} style={{ color: f.accent }} />
                  </div>
                  <h3 className="font-playfair font-bold text-brand-cream text-lg mb-3">{f.title}</h3>
                  <p className="text-brand-cream/60 text-sm leading-relaxed">{f.desc}</p>

                  {/* Bottom accent line */}
                  <div
                    className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                    style={{ backgroundColor: f.accent }}
                  />
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — FEATURED PRODUCTS
      ══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-14 gap-6">
            <AnimatedSection direction="left">
              <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-3 block">
                Handpicked For You
              </span>
              <h2 className="font-playfair font-bold text-brand-cream text-3xl sm:text-4xl md:text-5xl">
                Our <span className="text-brand-saffron">Collections</span>
              </h2>
              <div className="h-px w-12 bg-brand-saffron mt-4" />
            </AnimatedSection>
            <AnimatedSection direction="right" delay={0.15}>
              <Link
                to="/products"
                className="group inline-flex items-center gap-2 text-brand-saffron text-xs font-bold tracking-widest uppercase hover:text-brand-cream transition-colors"
              >
                View All Products
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedSection>
          </div>

          {/* Grid — 2 cols on mobile, 3 on md, 4 on xl */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5 md:gap-6">
            {featuredProducts.map((product, idx) => (
              <ProductCard key={product.id} product={product} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          ABOUT PREVIEW
      ══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            <AnimatedSection direction="left" className="relative">
              <div className="overflow-hidden aspect-[4/5]">
                <img
                  src={natureImg}
                  alt="Uzhavan Thottam Organic Farming Methods and Fields"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              {/* Corner decorations */}
              <div className="absolute -bottom-4 -right-4 w-36 h-36 border border-brand-saffron/25 pointer-events-none" />
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-saffron/8 pointer-events-none" />
              {/* Year badge */}
              <div className="absolute bottom-6 -right-3 md:-right-6 bg-brand-dark text-brand-cream px-5 py-4 border-l-4 border-brand-saffron">
                <p className="text-brand-saffron text-xl font-playfair font-bold">2024</p>
                <p className="text-brand-cream/50 text-[10px] uppercase tracking-widest">Est. Year</p>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-4 block">Since 2024</span>
              <h2 className="font-playfair font-bold text-brand-dark text-3xl sm:text-4xl md:text-5xl leading-tight mb-6">
                Reviving the Wisdom<br />
                <span className="text-brand-maroon">of Our Ancestors</span>
              </h2>
              <div className="h-px w-10 bg-brand-saffron mb-7" />
              <p className="text-brand-dark/65 text-base md:text-lg leading-relaxed mb-8">
                Uzhavan Thottam was born from a desire to reconnect with our roots.
                True health comes from the soil — nurtured naturally and processed
                with traditional wisdom.
              </p>
              <ul className="space-y-3 mb-10">
                {[
                  'Ancient wood-pressing techniques',
                  'Sun-drying for natural preservation',
                  'Chemical-free, additive-free processing',
                  'Authentic traditional Tamil flavors',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-brand-dark/70 text-sm">
                    <span className="w-5 h-px bg-brand-saffron flex-shrink-0" />
                    <span className="w-1.5 h-1.5 bg-brand-maroon rounded-full flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-brand-dark text-brand-cream px-7 py-3 text-xs font-bold tracking-widest uppercase hover:bg-brand-olive transition-colors duration-300 group"
              >
                Read Our Full Story
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-brand-dark">
        <div className="max-w-7xl mx-auto px-5 md:px-10">
          <AnimatedSection direction="up" className="text-center mb-14">
            <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-3 block">Happy Customers</span>
            <h2 className="font-playfair font-bold text-brand-cream text-3xl sm:text-4xl md:text-5xl">
              What Our <span className="text-brand-saffron">Community</span> Says
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <AnimatedSection
                key={t.id}
                direction={i === 0 ? 'left' : i === 2 ? 'right' : 'zoom'}
                delay={i * 0.12}
              >
                <div className="bg-brand-olive/30 border border-brand-cream/10 p-7 border-b-4 border-brand-saffron hover:-translate-y-1 transition-transform duration-300 h-full">
                  <div className="text-brand-saffron/15 text-6xl font-playfair leading-none mb-4 select-none">"</div>
                  <p className="text-brand-cream/65 text-sm leading-relaxed mb-6">"{t.content}"</p>
                  <div className="flex items-center gap-4">
                    <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-saffron/60" />
                    <div>
                      <p className="font-bold text-brand-saffron text-sm">{t.name}</p>
                      <p className="text-brand-cream/35 text-[10px] uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-brand-dark relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #D4891A 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="max-w-4xl mx-auto px-5 md:px-10 text-center relative z-10">
          <AnimatedSection direction="zoom">
            <span className="text-brand-saffron text-xs font-bold tracking-[0.28em] uppercase mb-5 block">Ready to Start?</span>
            <h2 className="font-playfair font-bold text-brand-cream text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-10">
              Experience Pure<br />
              <span className="text-brand-saffron">Organic Goodness</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-5">
              <Link
                to="/products"
                className="px-10 py-3 bg-brand-saffron text-brand-dark text-xs font-bold tracking-widest uppercase hover:bg-brand-saffron transition-colors duration-300"
              >
                Shop Now
              </Link>
              <Link
                to="/contact"
                className="px-10 py-3 border border-brand-cream/25 text-brand-cream text-xs font-bold tracking-widest uppercase hover:border-brand-saffron hover:text-brand-saffron transition-colors duration-300"
              >
                Contact Us
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

    </div>
  );
};

export default Home;
