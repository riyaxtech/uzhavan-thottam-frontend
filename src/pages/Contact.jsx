import { Mail, Phone, MapPin, Send } from 'lucide-react';
import React, { useState } from 'react';

// Social icons (not available in installed lucide-react version)
const FacebookIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const TwitterIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
import { Helmet } from 'react-helmet-async';
import AnimatedSection from '../components/AnimatedSection';

const Contact = () => {

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'Product Inquiry',
    message: '',
  });

  const [status, setStatus] = useState({
    submitted: false,
    submitting: false,
    info: { error: false, msg: null },
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({
      submitted: false,
      submitting: true,
      info: { error: false, msg: null },
    });

    try {
      const res = await fetch("https://formsubmit.co/ajax/094885df4f1acc7b7087c7553b8166dd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          _captcha: "false"
        }),
      });

      const data = await res.json();
      if (res.ok && data.success === "true") {
        setStatus({
          submitted: true,
          submitting: false,
          info: {
            error: false,
            msg: "Your message has been sent successfully!",
          },
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: 'Product Inquiry',
          message: '',
        });
      } else {
        setStatus({
          submitted: false,
          submitting: false,
          info: { error: true, msg: data.message || "Failed to send message. Please try again." },
        });
      }
    } catch (err) {
      setStatus({
        submitted: false,
        submitting: false,
        info: { error: true, msg: "An error occurred while sending the message. Please try again later." },
      });
    }
  };

  return (
    <div className="pt-14 bg-brand-cream min-h-screen">
      <Helmet>
        <title>Contact Us &amp; Inquiry Form | Uzhavan Thottam</title>
        <meta name="description" content="Get in touch with Uzhavan Thottam. Reach out for bulk orders, product questions, farm visits, or feedback. We are located in Karur, Tamil Nadu." />
        <meta name="keywords" content="contact Uzhavan Thottam, phone number, email support, farm location, bulk inquiries, Karur agriculture" />
      </Helmet>
      {/* Header */}
      <section className="py-20 bg-brand-dark text-brand-cream overflow-hidden relative">
        <div className="absolute left-0 top-0 w-1.5 h-full bg-gradient-to-b from-brand-saffron via-brand-saffron to-brand-maroon" />
        <div className="container-custom relative z-10 px-6 text-center">
          <AnimatedSection>
            <span className="text-brand-saffron font-bold tracking-[0.3em] uppercase text-xs mb-4 block">Connect With Us</span>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-playfair font-bold text-brand-cream mb-6">Get In Touch</h1>
            <p className="text-brand-cream/60 max-w-2xl mx-auto text-base sm:text-lg">
              Have questions about our products or farming practices? We'd love to hear from you.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-12">
              <AnimatedSection>
                <h2 className="text-3xl font-playfair font-bold text-brand-dark mb-10">Contact Details</h2>

                <div className="space-y-10">
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Kangayampalayam,+Kuppam,+Karur,+Tamil+Nadu+639111"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-start gap-6 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-brand-saffron/10 flex items-center justify-center text-brand-saffron rounded-full group-hover:bg-brand-saffron group-hover:text-brand-dark transition-all duration-300">
                      <MapPin size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark mb-1 tracking-wider uppercase text-sm group-hover:text-brand-saffron transition-colors">Location</h3>
                      <p className="text-brand-dark/60 leading-relaxed hover:text-brand-saffron/80 transition-colors">4/47 Kangayampalayam, Kuppam (po), <br />Karur (dt), Pin code : 639111</p>
                    </div>
                  </a>

                  <a 
                    href="tel:+916385172761"
                    className="flex items-start gap-6 group cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-brand-saffron/10 flex items-center justify-center text-brand-saffron rounded-full group-hover:bg-brand-saffron group-hover:text-brand-dark transition-all duration-300">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark mb-1 tracking-wider uppercase text-sm group-hover:text-brand-saffron transition-colors">Call Us</h3>
                      <p className="text-brand-dark/60 leading-relaxed hover:text-brand-saffron/80 transition-colors">+91 63851 72761</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 bg-brand-saffron/10 flex items-center justify-center text-brand-saffron rounded-full group-hover:bg-brand-saffron group-hover:text-brand-dark transition-all duration-300">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-brand-dark mb-1 tracking-wider uppercase text-sm">Email Us</h3>
                      <a href="mailto:uzhavanthottam26@gmail.com" className="text-brand-dark/60 leading-relaxed hover:text-brand-saffron/80 transition-colors block">uzhavanthottam26@gmail.com</a>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl font-playfair font-bold text-brand-dark mb-8">Follow Us</h2>
                <div className="flex gap-6">
                  {[
                    { Icon: FacebookIcon, href: 'https://www.facebook.com/share/1JDS1XyDC3/' },
                    { Icon: InstagramIcon, href: 'https://www.instagram.com/Uzhavan_2026' },
                    { Icon: TwitterIcon, href: '#' }
                  ].map(({ Icon, href }, i) => (
                    <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-12 h-12 border border-brand-saffron/30 flex items-center justify-center text-brand-saffron rounded-full hover:bg-brand-saffron hover:text-brand-dark transition-all duration-300">
                      <Icon size={20} />
                    </a>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <AnimatedSection className="bg-white p-5 sm:p-8 md:p-14 shadow-2xl rounded-sm border-t-8 border-brand-saffron">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-playfair font-bold text-brand-dark mb-6 sm:mb-10">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                  {status.info.msg && (
                    <div className={`p-4 rounded-sm text-sm font-semibold transition-all duration-300 ${
                      status.info.error 
                        ? 'bg-red-500/10 border border-red-500/20 text-red-500' 
                        : 'bg-green-700/10 border border-green-500/20 text-green-700'
                    }`}>
                      {status.info.msg}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Your Name"
                        className="w-full bg-brand-cream/30 border-b-2 border-brand-dark/10 px-4 py-4 focus:outline-none focus:border-brand-saffron transition-colors text-brand-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="example@mail.com"
                        className="w-full bg-brand-cream/30 border-b-2 border-brand-dark/10 px-4 py-4 focus:outline-none focus:border-brand-saffron transition-colors text-brand-dark"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+91 00000 00000"
                        className="w-full bg-brand-cream/30 border-b-2 border-brand-dark/10 px-4 py-4 focus:outline-none focus:border-brand-saffron transition-colors text-brand-dark"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Subject</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full bg-brand-cream/30 border-b-2 border-brand-dark/10 px-4 py-4 focus:outline-none focus:border-brand-saffron transition-colors text-brand-dark"
                      >
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Order Status">Order Status</option>
                        <option value="Farming Collaboration">Farming Collaboration</option>
                        <option value="Bulk Orders">Bulk Orders</option>
                        <option value="Others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-brand-dark/40 ml-1">Your Message</label>
                    <textarea
                      rows="6"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder="Tell us how we can help you..."
                      className="w-full bg-brand-cream/30 border-b-2 border-brand-dark/10 px-4 py-4 focus:outline-none focus:border-brand-saffron transition-colors text-brand-dark resize-none"
                    ></textarea>
                  </div>

                  <button
                    className="btn-primary w-full sm:w-auto px-12 py-5 flex items-center justify-center group disabled:opacity-50"
                    type="submit"
                    disabled={status.submitting}
                  >
                    {status.submitting ? 'Sending...' : 'Send Message'}
                    {!status.submitting && <Send className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" size={18} />}
                  </button>
                </form>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Map Placeholder */}
      <a 
        href="https://www.google.com/maps/search/?api=1&query=Kangayampalayam,+Kuppam,+Karur,+Tamil+Nadu+639111"
        target="_blank" 
        rel="noopener noreferrer"
        className="block h-[320px] sm:h-[420px] md:h-[500px] bg-brand-olive overflow-hidden relative grayscale hover:grayscale-0 transition-all duration-1000 group"
      >
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center text-brand-saffron">
            <MapPin size={48} className="mx-auto mb-4 animate-bounce" />
            <h3 className="text-2xl font-playfair group-hover:scale-105 transition-transform duration-300">Visit Our Farm</h3>
            <p className="text-brand-cream/60 text-xs tracking-widest uppercase mt-2">Click to open in Google Maps</p>
          </div>
        </div>
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000"
          className="w-full h-full object-cover opacity-20 transition-transform duration-700 group-hover:scale-105"
          alt="Uzhavan Thottam Organic Farm field location map placeholder"
          loading="lazy"
        />
      </a>
    </div>
  );
};

export default Contact;
