import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  User,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import logoImg from '../assets/logo-img.jpeg';

const AdminLayout = ({ children, activeTab = 'orders', setActiveTab, onRefresh, isRefreshing = false }) => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics',
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: ShoppingBag,
      description: 'Order management & status',
    },
    {
      id: 'payments',
      label: 'Payment Details',
      icon: CreditCard,
      description: 'Transaction reconciliation',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-900 antialiased font-inter">
      {/* ── Desktop & Tablet Sidebar ────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-[#0D2A1A] text-white border-r border-[#1A4A2E] shrink-0 sticky top-0 h-screen z-30 shadow-xl">
        {/* Brand Header */}
        <div className="p-6 border-b border-white/10 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-[#D4891A]/40 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-inner">
            <img src={logoImg} alt="Uzhavan Thottam" className="w-full h-full object-contain rounded" />
          </div>
          <div className="min-w-0">
            <h2 className="font-playfair text-base font-bold text-white tracking-wide truncate">
              Uzhavan Thottam
            </h2>
            <div className="flex items-center gap-1 text-[11px] text-[#D4891A] font-semibold uppercase tracking-wider">
              <Shield className="w-3 h-3" />
              <span>Admin Panel</span>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#F5E8CF]/40">
            Menu Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab && setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-semibold tracking-wide transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#1A4A2E] text-[#F5E8CF] shadow-md border-l-4 border-[#D4891A]'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-[#D4891A]' : 'text-white/50 group-hover:text-white/90'
                  }`}
                />
                <div className="flex-1 truncate">
                  <div>{item.label}</div>
                  <div className="text-[10px] font-normal text-white/40 truncate">
                    {item.description}
                  </div>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#D4891A] shrink-0" />}
              </button>
            );
          })}

          <div className="pt-6 px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-[#F5E8CF]/40">
            External Links
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left text-xs text-white/70 hover:bg-white/5 hover:text-white transition-colors group cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-white/50 group-hover:text-white/90 shrink-0" />
            <span className="flex-1 truncate">View Live Website</span>
          </a>
        </nav>

        {/* Admin User Footer & Logout */}
        <div className="p-4 border-t border-white/10 bg-black/20 shrink-0">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#D4891A]/20 border border-[#D4891A]/40 flex items-center justify-center text-[#D4891A] shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {adminUser?.username || 'Administrator'}
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Session
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-rose-950/40 text-white/80 hover:text-rose-200 border border-white/10 hover:border-rose-500/30 text-xs font-medium transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Drawer & Backdrop ────────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sliding Drawer */}
          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#0D2A1A] text-white flex flex-col shadow-2xl z-10 border-r border-[#1A4A2E]">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/10 border border-[#D4891A]/40 p-1 flex items-center justify-center">
                  <img src={logoImg} alt="Uzhavan Thottam" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h3 className="font-playfair text-sm font-bold text-white">Uzhavan Thottam</h3>
                  <p className="text-[10px] text-[#D4891A] font-semibold uppercase">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (setActiveTab) setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs font-semibold tracking-wide transition-colors ${
                      isActive
                        ? 'bg-[#1A4A2E] text-[#F5E8CF] border-l-4 border-[#D4891A]'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left text-xs text-white/70 hover:bg-white/5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Live Store</span>
              </a>
            </nav>

            <div className="p-4 border-t border-white/10 bg-black/20">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-rose-900/30 text-rose-200 border border-rose-500/30 text-xs font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout Column ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          {/* Left: Mobile Menu Trigger & Section Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Open mobile navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 capitalize flex items-center gap-2">
                {activeTab === 'dashboard' && 'Dashboard Overview'}
                {activeTab === 'orders' && 'Order Management'}
                {activeTab === 'payments' && 'Payment Details'}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Uzhavan Thottam Administrative Portal
              </p>
            </div>
          </div>

          {/* Right: Quick actions & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                title="Refresh data"
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-dark' : ''}`} />
              </button>
            )}

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{adminUser?.username || 'admin'}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              title="Logout from admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
