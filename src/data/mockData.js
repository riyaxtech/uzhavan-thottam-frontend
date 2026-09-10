import butter from '../assets/product-images/images/Butter.webp';
import coconut from '../assets/product-images/images/Cocounut.webp';
import ghee from '../assets/product-images/images/Ghee.webp';
import kaththirikkaPodi from '../assets/product-images/images/Kaththirikka-podi.webp';
import paruppuPodi from '../assets/product-images/images/Paruppu-podi.webp';
import pepperPowder from '../assets/product-images/images/Pepper-Powder.webp';
import tenderCoconut from '../assets/product-images/images/Tender-Coconut.webp';
import badam from '../assets/product-images/images/badam.webp';
import blackDryGrapes from '../assets/product-images/images/black-dry-grapes.webp';
import cardamom from '../assets/product-images/images/cardamom.webp';
import cashew from '../assets/product-images/images/cashew.webp';
import castorOil from '../assets/product-images/images/castor-oil.webp';
import coconutOil from '../assets/product-images/images/coconut-oil.webp';
import coffeePower from '../assets/product-images/images/coffee-power.webp';
import countrySugar from '../assets/product-images/images/country-sugar.webp';
import dryFruits from '../assets/product-images/images/dry-fruits.webp';
import dryGrapes from '../assets/product-images/images/dry-grapes.webp';
import elluPodi from '../assets/product-images/images/ellu-podi.webp';
import groundnutOil from '../assets/product-images/images/groundnut-oil.webp';
import honey from '../assets/product-images/images/honey.webp';
import jaggery from '../assets/product-images/images/jaggery.webp';
import karupatti from '../assets/product-images/images/karupatti.webp';
import karuveppilaiPodi from '../assets/product-images/images/karuveppilai-podi.webp';
import lemonoPickle from '../assets/product-images/images/lemono-pickle.webp';
import mangaPickle from '../assets/product-images/images/manga-pickle.webp';
import mooligaiNaatuSakkarai from '../assets/product-images/images/mooligai-naatu-sakkarai.webp';
import murungaKeeraiPodi from '../assets/product-images/images/murunga-keerai-podi.webp';
import pepper from '../assets/product-images/images/pepper.webp';
import pista from '../assets/product-images/images/pista.webp';
import poonduPickle from '../assets/product-images/images/poondu-pickle.webp';
import poonduPodi from '../assets/product-images/images/poondu-podi.webp';
import sesameOil from '../assets/product-images/images/sesame-oil.webp';
import teaPowder from '../assets/product-images/images/tea-powder.webp';
import turmericPowder from '../assets/product-images/images/turmeric-powder.webp';
import profile1 from '../assets/testimonial/profile-1.webp';
import profile4 from '../assets/testimonial/profile-4.webp';
import profile5 from '../assets/testimonial/profile-5.webp';
import coffeeBeans from '../assets/about/Coffee-beans.webp';
import sugarCaneHarvest from '../assets/about/sugar-cane-img.webp';
import nutsHarvest from '../assets/about/nuts-image.webp';
import natureFarm from '../assets/about/nature-pic.webp';
import farmHarvest1 from '../assets/about/img-1.webp';
import farmHarvest3 from '../assets/about/img-3.webp';

const rawProducts = [
  {
    id: 1,
    name: 'Coconut Oil',
    price: '₹450',
    category: 'Oils',
    tag: 'Best Seller',
    image: coconutOil,
    description: 'Cold-pressed using traditional wooden ghani. Pure, unrefined coconut oil rich in natural nutrients.',
  },
  {
    id: 2,
    name: 'Groundnut Oil',
    price: '₹380',
    category: 'Oils',
    tag: 'Wood Pressed',
    image: groundnutOil,
    description: 'Traditional wood-pressed groundnut oil retaining natural aroma and full health benefits.',
  },
  {
    id: 3,
    name: 'Sesame Oil',
    price: '₹420',
    category: 'Oils',
    tag: 'Cold Pressed',
    image: sesameOil,
    description: 'Gingelly oil cold-pressed from pure black sesame seeds. Ideal for cooking and health.',
  },
  {
    id: 4,
    name: 'Castor Oil',
    price: '₹220',
    category: 'Oils',
    tag: 'Natural',
    image: castorOil,
    description: 'Pure, high-quality castor oil traditionally extracted for various health and wellness benefits.',
  },
  {
    id: 5,
    name: 'Naatu Sakkarai',
    price: '₹72',
    category: 'Sweeteners',
    tag: 'Unrefined',
    image: countrySugar,
    description: 'Unrefined, chemical-free nattu sakkarai — natural mineral-rich sweetness from sugarcane.',
    prices: {
      '500g': 72,
      '1kg': 128
    }
  },
  {
    id: 6,
    name: 'Karupatti',
    price: '₹250',
    category: 'Sweeteners',
    tag: 'Traditional',
    image: karupatti,
    description: 'Authentic palm jaggery — a rich, mineral-dense natural sweetener from palm trees.',
  },
  {
    id: 7,
    name: 'Naatu Vellam',
    price: '₹50',
    category: 'Sweeteners',
    tag: 'Pure',
    image: jaggery,
    description: 'Traditional vellam — no chemicals, no bleaching. Pure jaggery sweetness.',
    prices: {
      '500g': 50,
      '1kg': 90
    }
  },
  {
    id: 8,
    name: 'Honey',
    price: '₹180',
    category: 'Sweeteners',
    tag: 'Forest Harvest',
    image: honey,
    description: 'Raw forest honey harvested naturally — unfiltered, unheated and naturally rich.',
    prices: {
      '500g': 180,
      '1kg': 320
    }
  },
  {
    id: 9,
    name: 'Mooligai Naatu Sakkarai',
    price: '₹330',
    category: 'Sweeteners',
    tag: 'Herbal',
    image: mooligaiNaatuSakkarai,
    description: 'Herbal country sugar infused with traditional medicinal herbs for added health benefits.',
  },
  {
    id: 10,
    name: 'Filter Coffee Powder',
    price: '₹180',
    category: 'Beverages',
    tag: '100% Arabica',
    image: coffeePower,
    description: 'Rich aromatic blend of 100% Arabica beans. Strong, fresh and traditionally roasted.',
  },
  {
    id: 11,
    name: 'Tea Powder',
    price: '₹140',
    category: 'Beverages',
    tag: 'Aromatic',
    image: teaPowder,
    description: 'Strong, fresh and aromatic tea sourced directly from lush hill gardens.',
  },
  {
    id: 12,
    name: 'Turmeric Powder',
    price: '₹95',
    category: 'Spices',
    tag: 'High Curcumin',
    image: turmericPowder,
    description: 'High curcumin turmeric, sun-dried and stone-ground the traditional Tamil way.',
  },
  {
    id: 13,
    name: 'Pepper Powder',
    price: '₹175',
    category: 'Spices',
    tag: 'Fresh Ground',
    image: pepperPowder,
    description: 'Bold, pungent black pepper powder — organically grown and traditionally ground.',
  },
  {
    id: 14,
    name: 'Black Pepper',
    price: '₹175',
    category: 'Spices',
    tag: 'Whole',
    image: pepper,
    description: 'Bold, pungent Malabar black pepper — organically grown and sun-dried whole.',
  },
  {
    id: 15,
    name: 'Cardamom',
    price: '₹450',
    category: 'Spices',
    tag: 'Premium',
    image: cardamom,
    description: 'Fresh, aromatic green cardamom pods sourced from the finest plantations.',
  },
  {
    id: 16,
    name: 'Paruppu Podi',
    price: '₹110',
    category: 'Spices',
    tag: 'Homemade Taste',
    image: paruppuPodi,
    description: 'Traditional dhal powder blended from fresh dal — homemade taste in every bite.',
  },
  {
    id: 17,
    name: 'Kaththirikka Podi',
    price: '₹120',
    category: 'Spices',
    tag: 'Traditional',
    image: kaththirikkaPodi,
    description: 'Authentic eggplant/brinjal spice mix prepared with traditional South Indian recipes.',
  },
  {
    id: 18,
    name: 'Ellu Podi',
    price: '₹115',
    category: 'Spices',
    tag: 'Sesame Rich',
    image: elluPodi,
    description: 'Nutritious sesame seed powder, perfectly roasted and ground for an authentic flavor.',
  },
  {
    id: 19,
    name: 'Karuveppilai Podi',
    price: '₹125',
    category: 'Spices',
    tag: 'Healthy',
    image: karuveppilaiPodi,
    description: 'Fresh curry leaf powder, rich in iron and minerals. Great for hair and skin health.',
  },
  {
    id: 20,
    name: 'Murunga Keerai Podi',
    price: '₹135',
    category: 'Spices',
    tag: 'Superfood',
    image: murungaKeeraiPodi,
    description: 'Nutrient-dense moringa leaf powder — a protein-rich superfood for your daily diet.',
  },
  {
    id: 21,
    name: 'Poondu Podi',
    price: '₹145',
    category: 'Spices',
    tag: 'Garlic Rich',
    image: poonduPodi,
    description: 'Flavorful garlic spice mix, perfect for mixing with rice or as a side for idli/dosa.',
  },
  {
    id: 22,
    name: 'Badam',
    price: '₹350',
    category: 'Dry Fruits',
    tag: 'Premium',
    image: badam,
    description: 'Premium quality almonds, naturally sourced and packed with nutrition.',
  },
  {
    id: 23,
    name: 'Cashew',
    price: '₹420',
    category: 'Dry Fruits',
    tag: 'Premium',
    image: cashew,
    description: 'Large, crunchy premium cashews — naturally processed and full of flavor.',
  },
  {
    id: 24,
    name: 'Pista',
    price: '₹480',
    category: 'Dry Fruits',
    tag: 'Salted',
    image: pista,
    description: 'Finest quality pistachios, carefully selected and roasted for the perfect crunch.',
  },
  {
    id: 25,
    name: 'Dry Fruits Mix',
    price: '₹520',
    category: 'Dry Fruits',
    tag: 'Premium Mix',
    image: dryFruits,
    description: 'A rich mix of premium cashews, almonds, pistachios and raisins.',
  },
  {
    id: 26,
    name: 'Dry Grapes',
    price: '₹180',
    category: 'Dry Fruits',
    tag: 'Sweet',
    image: dryGrapes,
    description: 'Naturally sun-dried sweet raisins, perfect for snacking or adding to desserts.',
  },
  {
    id: 27,
    name: 'Black Dry Grapes',
    price: '₹220',
    category: 'Dry Fruits',
    tag: 'Premium',
    image: blackDryGrapes,
    description: 'Antioxidant-rich black raisins, naturally dried and full of sweet goodness.',
  },
  {
    id: 28,
    name: 'Butter',
    price: '₹280',
    category: 'Dairy',
    tag: 'Farm Fresh',
    image: butter,
    description: 'Freshly churned farm butter, pure and free from any added colors or preservatives.',
  },
  {
    id: 29,
    name: 'Ghee',
    price: '₹580',
    category: 'Dairy',
    tag: 'Pure Cow Ghee',
    image: ghee,
    description: 'Traditional aroma-rich cow ghee, made from fresh butter using traditional methods.',
  },
  {
    id: 30,
    name: 'Lemon Pickle',
    price: '₹150',
    category: 'Pickles',
    tag: 'Homemade',
    image: lemonoPickle,
    description: 'Zesty lemon pickle made with traditional spices and aged to perfection.',
  },
  {
    id: 31,
    name: 'Mango Pickle',
    price: '₹160',
    category: 'Pickles',
    tag: 'Traditional',
    image: mangaPickle,
    description: 'Classic tangy mango pickle, prepared with sun-dried mangoes and pure oils.',
  },
  {
    id: 32,
    name: 'Garlic Pickle',
    price: '₹180',
    category: 'Pickles',
    tag: 'Spicy',
    image: poonduPickle,
    description: 'Flavorful garlic pickle (Poondu Oorkai), rich in spices and traditional taste.',
  },
  {
    id: 33,
    name: 'Fresh Coconut',
    price: '₹40',
    category: 'Fresh',
    tag: 'Farm Direct',
    image: coconut,
    description: 'Freshly harvested coconuts from our farm, rich in sweet water and tender meat.',
  },
  {
    id: 34,
    name: 'Tender Coconut',
    price: '₹50',
    category: 'Fresh',
    tag: 'Refreshing',
    image: tenderCoconut,
    description: 'Refreshing tender coconut, perfect for a natural hydration boost.',
  },
];

export const products = rawProducts.map((p) => {
  // Derive category-appropriate gallery images if multiple not specified
  let gallery = p.images || [];
  if (gallery.length === 0) {
    if (p.category === 'Sweeteners') {
      gallery = [p.image, sugarCaneHarvest, natureFarm];
    } else if (p.category === 'Oils') {
      gallery = [p.image, farmHarvest1, natureFarm];
    } else if (p.category === 'Beverages') {
      gallery = [p.image, coffeeBeans, farmHarvest3];
    } else if (p.category === 'Dry Fruits') {
      gallery = [p.image, nutsHarvest, farmHarvest1];
    } else if (p.category === 'Spices') {
      gallery = [p.image, farmHarvest3, natureFarm];
    } else if (p.category === 'Dairy') {
      gallery = [p.image, farmHarvest1, natureFarm];
    } else {
      gallery = [p.image, farmHarvest1, natureFarm];
    }
  }

  // Ensure default weight/pack options
  const basePriceNum = typeof p.price === 'string'
    ? parseInt(p.price.replace(/[^0-9]/g, '')) || 100
    : p.price || 100;

  let prices = p.prices;
  if (!prices) {
    if (p.category === 'Oils') {
      prices = {
        '500ml': Math.round(basePriceNum * 0.55),
        '1 Litre': basePriceNum,
      };
    } else if (p.category === 'Fresh') {
      prices = {
        '1 Piece': basePriceNum,
        'Pack of 2': Math.round(basePriceNum * 1.9),
      };
    } else {
      prices = {
        '500g': basePriceNum,
        '1kg': Math.round(basePriceNum * 1.85),
      };
    }
  }

  return {
    ...p,
    images: gallery,
    prices,
    available: [5, 7].includes(p.id),
  };
});

export const galleryImages = [
  // Dynamically map all products to show in 'Products' and 'All'
  ...products.map(p => ({ src: p.image, label: p.name, category: 'Products' })),

  // Handpicked Process & Harvest behind-the-scenes images
  { src: groundnutOil, label: 'Traditional Processing', category: 'Process' },
  { src: honey, label: 'Forest Harvested Honey', category: 'Harvest' },
  { src: turmericPowder, label: 'Organic Turmeric', category: 'Harvest' },
  { src: tenderCoconut, label: 'Farm Fresh Harvest', category: 'Harvest' },
  { src: butter, label: 'Traditional Churning', category: 'Process' },
  { src: coffeePower, label: 'Fresh Coffee Roasting', category: 'Process' },
  { src: teaPowder, label: 'Hill Garden Tea', category: 'Harvest' },
  { src: pepper, label: 'Sun-dried Spices', category: 'Process' },
  { src: karupatti, label: 'Palm Jaggery Making', category: 'Process' },
];

export const testimonials = [
  {
    id: 1,
    name: 'Shailesh',
    role: '',
    content: 'The wood pressed coconut oil from Uzhavan Thottam is exceptional. You can literally smell the purity!',
    image: profile1,
  },
  {
    id: 2,
    name: 'Naveen',
    role: '',
    content: 'The spices are so vibrant and full of flavor. It has completely transformed my daily cooking.',
    image: profile4,
  },
  {
    id: 3,
    name: 'Yuva',
    role: '',
    content: 'Authentic karupatti is hard to find these days. So glad I discovered Uzhavan Thottam!',
    image: profile5,
  },
];
