import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

// Social icons (not available in installed lucide-react version)
const FacebookIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const WhatsappIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.223-.57-.372z" />
    <path d="M12 2a10 10 0 0 0-9 15.5L2 22l4.5-1c1.6.8 3.5 1 5.5 1a10 10 0 0 0 10-10A10 10 0 0 0 12 2z" />
  </svg>
);

// Navigation link that scrolls to top when clicked
const FooterLink = ({ to, children }) => {
  const navigate = useNavigate();
  const handleClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Small delay so smooth scroll doesn't fight route change
    setTimeout(() => navigate(to), 80);
  };
  return (
    <a
      href={to}
      onClick={handleClick}
      className="group relative text-brand-cream/90 hover:text-brand-saffron transition-colors duration-300 inline-flex items-center gap-2 text-sm"
    >
      <span className="w-0 group-hover:w-3 h-px bg-brand-saffron transition-all duration-300 inline-block" />
      {children}
    </a>
  );
};

const Footer = () => {
  return (
    <footer className="bg-brand-dark text-brand-cream relative overflow-hidden">
      {/* Top maroon/saffron accent strip */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-maroon via-brand-saffron to-brand-saffron" />

      {/* Subtle dot pattern bg */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #C8A96B 1px, transparent 1px)', backgroundSize: '36px 36px' }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

          {/* Brand Section */}
          <div className="space-y-6 lg:col-span-1">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="inline-block">
              <h2 className="text-2xl font-playfair font-bold tracking-tight">
                <span className="text-brand-saffron">UZHAVAN</span>{' '}
                <span className="text-brand-cream">THOTTAM</span>
              </h2>
              <p className="text-brand-saffron/60 text-[10px] tracking-[0.3em] uppercase mt-1">Natural · Pure · Trusted</p>
            </Link>
            <p className="text-brand-cream/90 leading-relaxed text-sm max-w-xs">
              Bringing the pure essence of nature from the farm to your table.
              Sustainable, organic, and authentically crafted.
            </p>

            {/* Social icons */}
            <div className="flex space-x-3 pt-2">
              {[
                { Icon: FacebookIcon, href: 'https://www.facebook.com/share/1JDS1XyDC3/' },
                { Icon: InstagramIcon, href: 'https://www.instagram.com/Uzhavan_2026' },
                { Icon: WhatsappIcon, href: 'https://wa.me/916385172761' },
                { Icon: TwitterIcon, href: '#' }
              ].map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-sm border border-brand-cream/10 flex items-center justify-center text-brand-cream/90 hover:border-brand-saffron hover:text-brand-saffron hover:bg-brand-saffron/10 transition-all duration-300"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-saffron mb-8">
              Quick Links
            </h3>
            <ul className="space-y-5">
              {[
                { label: 'Home', to: '/' },
                { label: 'About', to: '/about' },
                { label: 'Products', to: '/products' },
                { label: 'Gallery', to: '/gallery' },
                { label: 'Contact', to: '/contact' },
              ].map(({ label, to }) => (
                <li key={label}>
                  <FooterLink to={to}>{label}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-saffron mb-8">
              Our Products
            </h3>
            <ul className="space-y-5">
              {[
                'Cold Pressed Oils',
                'Natural Powders',
                'Organic Sweeteners',
                'Dry Fruits',
                'Spices & Coffee',
              ].map((cat) => (
                <li key={cat}>
                  <FooterLink to="/products">{cat}</FooterLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-brand-saffron mb-8">
              Get in Touch
            </h3>
            <div className="space-y-5">
              <a 
                href="https://www.google.com/maps/search/?api=1&query=Kangayampalayam,+Kuppam,+Karur,+Tamil+Nadu+639111"
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-start gap-4 group cursor-pointer"
              >
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-brand-saffron/20 group-hover:border-brand-saffron group-hover:bg-brand-saffron/10 transition-all duration-300">
                  <MapPin className="text-brand-saffron" size={16} />
                </div>
                <p className="text-brand-cream/90 text-sm leading-relaxed hover:text-brand-saffron transition-colors">
                  4/47 Kangayampalayam, Kuppam (po),<br />Karur (dt), Pin code : 639111
                </p>
              </a>
              <a 
                href="tel:+916385172761"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-brand-saffron/20 group-hover:border-brand-saffron group-hover:bg-brand-saffron/10 transition-all duration-300">
                  <Phone className="text-brand-saffron" size={16} />
                </div>
                <p className="text-brand-cream/90 text-sm hover:text-brand-saffron transition-colors">+91 63851 72761</p>
              </a>
              <a 
                href="mailto:uzhavanthottam26@gmail.com"
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border border-brand-saffron/20 group-hover:border-brand-saffron group-hover:bg-brand-saffron/10 transition-all duration-300">
                  <Mail className="text-brand-saffron" size={16} />
                </div>
                <p className="text-brand-cream/90 text-sm hover:text-brand-saffron transition-colors">uzhavanthottam26@gmail.com</p>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-brand-cream/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-brand-cream/90 text-xs tracking-widest uppercase">
            © {new Date().getFullYear()} Uzhavan Thottam. All Rights Reserved.
          </p>
          <p className="text-brand-cream/90 text-xs">
            Natural · Pure · Trusted
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
