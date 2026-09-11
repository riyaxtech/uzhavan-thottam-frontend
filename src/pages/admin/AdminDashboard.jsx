import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAdminAuth } from '../../context/AdminAuthContext';
import AdminLayout from '../../layouts/AdminLayout';
import ProductDetailsModal from '../../components/admin/ProductDetailsModal';
import FullOrderDetailsModal from '../../components/admin/FullOrderDetailsModal';
import AdminToast from '../../components/admin/AdminToast';
import {
  fetchAdminOrders,
  fetchAdminStats,
  updatePaymentStatus,
  updateDispatchStatus,
  updateDeliveryStatus,
  fetchPaymentRecords,
} from '../../services/adminService';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  CreditCard,
  ShoppingBag,
  Eye,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  ArrowUpDown,
  X,
  Send,
  CheckCheck,
  IndianRupee,
  Layers,
} from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAdminAuth();

  // Active view tab: 'orders' | 'dashboard' | 'payments'
  const [activeTab, setActiveTab] = useState('orders');

  // Stats Data
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingPayments: 0,
    paidOrders: 0,
    pendingDispatch: 0,
    dispatchedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    limit: 10,
    startItem: 0,
    endItem: 0,
  });
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);

  // Filters & Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const [dispatchFilter, setDispatchFilter] = useState('All');
  const [deliveryFilter, setDeliveryFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Payments Tab State
  const [payments, setPayments] = useState([]);
  const [paymentPagination, setPaymentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 10,
  });
  const [paymentTabFilter, setPaymentTabFilter] = useState('All');
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentSummary, setPaymentSummary] = useState({
    totalCollected: 0,
    totalPending: 0,
    totalTransactions: 0,
  });
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  // Modals & Selected Order
  const [selectedProductOrder, setSelectedProductOrder] = useState(null);
  const [selectedFullOrder, setSelectedFullOrder] = useState(null);

  // Dropdown update spinners
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', title = '') => {
    setToast({ id: Date.now(), message, type, title });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPagination((prev) => ({ ...prev, currentPage: 1 }));
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Load Overview Stats
  const loadStats = useCallback(async () => {
    try {
      const res = await fetchAdminStats(token);
      if (res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    }
  }, [token]);

  // Load Orders
  const loadOrders = useCallback(async () => {
    try {
      setIsLoadingOrders(true);
      setOrdersError(null);

      const params = {
        page: pagination.currentPage,
        limit: 10,
        search: debouncedSearch,
        paymentStatus: paymentFilter,
        dispatchStatus: dispatchFilter,
        deliveryStatus: deliveryFilter,
        startDate: appliedStartDate,
        endDate: appliedEndDate,
        sortBy,
        sortOrder,
      };

      const res = await fetchAdminOrders(params, token);
      if (res.success) {
        setOrders(res.orders || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        if (res.stats) {
          setStats((prev) => ({ ...prev, ...res.stats }));
        }
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
      setOrdersError(err.message || 'Unable to load orders. Please try again.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [
    token,
    pagination.currentPage,
    debouncedSearch,
    paymentFilter,
    dispatchFilter,
    deliveryFilter,
    appliedStartDate,
    appliedEndDate,
    sortBy,
    sortOrder,
  ]);

  // Load Payments (For Payments Tab)
  const loadPayments = useCallback(async () => {
    try {
      setIsLoadingPayments(true);
      const res = await fetchPaymentRecords(
        {
          page: paymentPagination.currentPage,
          limit: 10,
          paymentStatus: paymentTabFilter,
          search: paymentSearch,
        },
        token
      );
      if (res.success) {
        setPayments(res.payments || []);
        if (res.pagination) setPaymentPagination(res.pagination);
        if (res.summary) setPaymentSummary(res.summary);
      }
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setIsLoadingPayments(false);
    }
  }, [token, paymentPagination.currentPage, paymentTabFilter, paymentSearch]);

  // Initial & Dependency Triggers
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      loadOrders();
    }
  }, [loadOrders, activeTab]);

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
    }
  }, [loadPayments, activeTab]);

  // Status Update Handlers
  const handlePaymentChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await updatePaymentStatus(orderId, newStatus, token);
      if (res.success) {
        // Update local order lists
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...res.order } : o))
        );
        if (selectedFullOrder && selectedFullOrder.orderId === orderId) {
          setSelectedFullOrder((prev) => ({ ...prev, ...res.order }));
        }
        showToast(`Payment status updated to ${newStatus}.`, 'success', 'Payment Updated');
        loadStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update payment status.', 'error', 'Update Failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDispatchChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await updateDispatchStatus(orderId, newStatus, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...res.order } : o))
        );
        if (selectedFullOrder && selectedFullOrder.orderId === orderId) {
          setSelectedFullOrder((prev) => ({ ...prev, ...res.order }));
        }
        showToast(
          newStatus === 'Dispatched' ? 'Order dispatched successfully.' : 'Order marked as Pending Dispatch.',
          'success',
          'Dispatch Status'
        );
        loadStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update dispatch status.', 'error', 'Update Failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleDeliveryChange = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      const res = await updateDeliveryStatus(orderId, newStatus, token);
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, ...res.order } : o))
        );
        if (selectedFullOrder && selectedFullOrder.orderId === orderId) {
          setSelectedFullOrder((prev) => ({ ...prev, ...res.order }));
        }
        showToast(
          newStatus === 'Delivered' ? 'Order marked as delivered successfully.' : 'Order marked as Pending Delivery.',
          'success',
          'Delivery Status'
        );
        loadStats();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update delivery status.', 'error', 'Update Failed');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Date Filter Apply & Clear
  const handleApplyDateFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Reset page helper
  const handleFilterChange = (setter, value) => {
    setter(value);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Global Refresh Handler
  const handleRefreshAll = () => {
    loadStats();
    if (activeTab === 'orders' || activeTab === 'dashboard') {
      loadOrders();
    }
    if (activeTab === 'payments') {
      loadPayments();
    }
    showToast('Data refreshed successfully.', 'info');
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onRefresh={handleRefreshAll}
      isRefreshing={isLoadingOrders || isLoadingPayments}
    >
      <Helmet>
        <title>Admin Dashboard | Uzhavan Thottam</title>
      </Helmet>

      {/* ── 1. Summary Cards (Always Visible at Top of Dashboard / Orders) ── */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Total Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.totalOrders}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">All placed orders</div>
          </div>

          {/* Pending Payments */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Pending Pay
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-900 tracking-tight">
              {stats.pendingPayments}
            </div>
            <div className="text-[11px] text-amber-600/80 mt-0.5">Awaiting payment</div>
          </div>

          {/* Paid Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Paid Orders
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900 tracking-tight">
              {stats.paidOrders}
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">Payment confirmed</div>
          </div>

          {/* Pending Dispatch */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">
                Pending Dispatch
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-amber-900 tracking-tight">
              {stats.pendingDispatch}
            </div>
            <div className="text-[11px] text-amber-600/80 mt-0.5">To be shipped</div>
          </div>

          {/* Dispatched Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
                Dispatched
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-900 tracking-tight">
              {stats.dispatchedOrders}
            </div>
            <div className="text-[11px] text-blue-600/80 mt-0.5">In transit</div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/40">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
                Delivered
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-900 tracking-tight">
              {stats.deliveredOrders}
            </div>
            <div className="text-[11px] text-emerald-600/80 mt-0.5">Successfully fulfilled</div>
          </div>
        </div>
      </section>

      {/* ── 2. View: Orders Management & Table ───────────────────── */}
      {(activeTab === 'orders' || activeTab === 'dashboard') && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header & Controls Bar */}
          <div className="p-4 sm:p-6 border-b border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customer Orders
                </h2>
                <p className="text-xs text-slate-500">
                  View, filter, search, and manage order fulfillment states.
                </p>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search customer name or ID..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A4A2E] focus:bg-white transition-all"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Controls Row */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {/* Payment Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Payment:</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => handleFilterChange(setPaymentFilter, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>

              {/* Dispatch Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Dispatch:</label>
                <select
                  value={dispatchFilter}
                  onChange={(e) => handleFilterChange(setDispatchFilter, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Dispatched">Dispatched</option>
                </select>
              </div>

              {/* Delivery Filter */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Delivery:</label>
                <select
                  value={deliveryFilter}
                  onChange={(e) => handleFilterChange(setDeliveryFilter, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1.5">
                <label className="text-xs font-semibold text-slate-500">Sort By:</label>
                <select
                  value={sortBy}
                  onChange={(e) => handleFilterChange(setSortBy, e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-dark cursor-pointer"
                >
                  <option value="orderDate">Order Date</option>
                  <option value="name">Customer Name</option>
                  <option value="total">Amount</option>
                </select>
                <button
                  onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                  title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
                  className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs flex items-center cursor-pointer"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span className="ml-1 text-[11px] uppercase font-bold">{sortOrder}</span>
                </button>
              </div>

              {/* Date Filter Inputs */}
              <div className="flex flex-wrap items-center gap-2 ml-auto">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-dark"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-slate-500">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-dark"
                  />
                </div>
                <button
                  onClick={handleApplyDateFilter}
                  className="px-3 py-1 bg-brand-dark hover:bg-brand-olive text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Apply Filter
                </button>
                {(appliedStartDate || appliedEndDate || startDate || endDate) && (
                  <button
                    onClick={handleClearDateFilter}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Content & States */}
          {isLoadingOrders ? (
            /* Skeleton Loading State */
            <div className="p-8 space-y-4">
              <div className="flex items-center justify-center gap-3 py-12 text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-dark" />
                <span className="text-sm font-medium">Loading customer orders...</span>
              </div>
            </div>
          ) : ordersError ? (
            /* Error State */
            <div className="p-12 text-center">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Unable to load orders
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                {ordersError}
              </p>
              <button
                onClick={loadOrders}
                className="px-5 py-2 bg-brand-dark hover:bg-brand-olive text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          ) : orders.length === 0 ? (
            /* Empty State */
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                No orders found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                No orders match your current search criteria or status filters.
              </p>
              {(searchTerm || paymentFilter !== 'All' || dispatchFilter !== 'All' || deliveryFilter !== 'All' || appliedStartDate || appliedEndDate) && (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setPaymentFilter('All');
                    setDispatchFilter('All');
                    setDeliveryFilter('All');
                    handleClearDateFilter();
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            /* Orders Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3.5 px-4 w-14 text-center">S.No</th>
                    <th className="py-3.5 px-4">Customer Name</th>
                    <th className="py-3.5 px-4">Order Date</th>
                    <th className="py-3.5 px-4 text-center">Product</th>
                    <th className="py-3.5 px-4 text-center">Details</th>
                    <th className="py-3.5 px-4 text-center">Payment</th>
                    <th className="py-3.5 px-4 text-center">Dispatch</th>
                    <th className="py-3.5 px-4 text-center">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {orders.map((order, idx) => {
                    const sNo = (pagination.currentPage - 1) * pagination.limit + idx + 1;
                    const isRowUpdating = updatingOrderId === order.orderId;

                    return (
                      <tr
                        key={order.orderId || order._id || idx}
                        className="hover:bg-slate-50/80 transition-colors"
                      >
                        {/* 1. S.No */}
                        <td className="py-3 px-4 text-center font-medium text-slate-500">
                          {sNo}
                        </td>

                        {/* 2. Customer Name */}
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">
                            {order.customerDetails?.name || 'Customer'}
                          </div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span>{order.customerDetails?.phone}</span>
                            <span className="text-slate-300">•</span>
                            <span className="font-mono text-slate-400">#{order.orderId}</span>
                          </div>
                        </td>

                        {/* 3. Order Date */}
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {order.orderDate}
                        </td>

                        {/* 4. Product Details */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedProductOrder(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-medium"
                            title="View Products in Order"
                          >
                            <Eye className="w-3.5 h-3.5 text-brand-dark" />
                            <span>View</span>
                            <span className="ml-0.5 px-1 py-0.2 rounded bg-white text-[10px] font-bold text-slate-600 border border-slate-200">
                              {order.items?.length || 0}
                            </span>
                          </button>
                        </td>

                        {/* 5. Full Details */}
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedFullOrder(order)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0D2A1A]/10 hover:bg-[#0D2A1A]/20 text-[#0D2A1A] font-semibold transition-colors cursor-pointer text-xs"
                            title="View Full Order & Address Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                        </td>

                        {/* 6. Payment Dropdown */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center relative">
                            <select
                              value={order.paymentStatus || 'Pending'}
                              disabled={isRowUpdating}
                              onChange={(e) => handlePaymentChange(order.orderId, e.target.value)}
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border appearance-none pr-6 cursor-pointer focus:outline-none transition-colors ${
                                order.paymentStatus === 'Paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              } ${isRowUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Paid">Paid</option>
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                              ▼
                            </span>
                          </div>
                        </td>

                        {/* 7. Dispatch Dropdown */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center relative">
                            <select
                              value={order.dispatchStatus || 'Pending'}
                              disabled={isRowUpdating}
                              onChange={(e) => handleDispatchChange(order.orderId, e.target.value)}
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border appearance-none pr-6 cursor-pointer focus:outline-none transition-colors ${
                                order.dispatchStatus === 'Dispatched'
                                  ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-blue-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              } ${isRowUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Dispatched">Dispatched</option>
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                              ▼
                            </span>
                          </div>
                        </td>

                        {/* 8. Delivery Dropdown */}
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center relative">
                            <select
                              value={order.deliveryStatus || 'Pending'}
                              disabled={isRowUpdating}
                              onChange={(e) => handleDeliveryChange(order.orderId, e.target.value)}
                              className={`text-xs font-semibold rounded-lg px-2.5 py-1.5 border appearance-none pr-6 cursor-pointer focus:outline-none transition-colors ${
                                order.deliveryStatus === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                              } ${isRowUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Delivered">Delivered</option>
                            </select>
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[9px]">
                              ▼
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {!isLoadingOrders && orders.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
              <div>
                Showing <strong className="text-slate-900">{pagination.startItem}</strong>–
                <strong className="text-slate-900">{pagination.endItem}</strong> of{' '}
                <strong className="text-slate-900">{pagination.totalOrders}</strong> orders
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  disabled={pagination.currentPage <= 1}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage - 1 }))
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                {/* Page Numbers */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, currentPage: pageNum }))
                    }
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      pagination.currentPage === pageNum
                        ? 'bg-brand-dark text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, currentPage: prev.currentPage + 1 }))
                  }
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ── 3. View: Payment Details Section ─────────────────────── */}
      {activeTab === 'payments' && (
        <section className="space-y-6">
          {/* Payment Summary Header */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Collected</span>
              <div className="text-2xl font-bold text-emerald-800 mt-1">
                ₹{paymentSummary.totalCollected.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Paid customer orders</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Pending Collection</span>
              <div className="text-2xl font-bold text-amber-800 mt-1">
                ₹{paymentSummary.totalPending.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">Orders awaiting settlement</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold uppercase">Total Transactions</span>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {paymentSummary.totalTransactions}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">All order transactions</div>
            </div>
          </div>

          {/* Payment Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Payment Transactions</h3>
                <p className="text-xs text-slate-500">
                  Track and verify customer payments, transaction references, and payment dates.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-2">
                {['All', 'Pending', 'Paid'].map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setPaymentTabFilter(st);
                      setPaymentPagination((p) => ({ ...p, currentPage: 1 }));
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      paymentTabFilter === st
                        ? 'bg-brand-dark text-white'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Payments Table */}
            {isLoadingPayments ? (
              <div className="p-12 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-dark" />
                <span className="text-xs">Loading payment records...</span>
              </div>
            ) : payments.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                No payment records matching the selected criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-4 w-14 text-center">S.No</th>
                      <th className="py-3.5 px-4">Order ID</th>
                      <th className="py-3.5 px-4">Customer Name</th>
                      <th className="py-3.5 px-4">Order Date</th>
                      <th className="py-3.5 px-4">Method</th>
                      <th className="py-3.5 px-4">Transaction ID</th>
                      <th className="py-3.5 px-4">Amount</th>
                      <th className="py-3.5 px-4 text-center">Payment Status</th>
                      <th className="py-3.5 px-4">Payment Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {payments.map((p, idx) => {
                      const sNo = (paymentPagination.currentPage - 1) * paymentPagination.limit + idx + 1;
                      return (
                        <tr key={p._id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 text-center font-medium text-slate-500">{sNo}</td>
                          <td className="py-3 px-4 font-mono font-semibold text-slate-900">#{p.orderId}</td>
                          <td className="py-3 px-4 font-medium text-slate-900">{p.customerDetails?.name || 'Customer'}</td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{p.orderDate}</td>
                          <td className="py-3 px-4 text-slate-600">{p.paymentMethod || 'Online Payment'}</td>
                          <td className="py-3 px-4">
                            {p.transactionId ? (
                              <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px] text-slate-800">
                                {p.transactionId}
                              </code>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900">₹{p.total}</td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                                p.paymentStatus === 'Paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {p.paymentDate || (p.paymentStatus === 'Paid' ? p.orderDate : 'Pending')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 4. Modals ────────────────────────────────────────────── */}
      <ProductDetailsModal
        isOpen={Boolean(selectedProductOrder)}
        onClose={() => setSelectedProductOrder(null)}
        order={selectedProductOrder}
      />

      <FullOrderDetailsModal
        isOpen={Boolean(selectedFullOrder)}
        onClose={() => setSelectedFullOrder(null)}
        order={selectedFullOrder}
        onUpdatePayment={handlePaymentChange}
        onUpdateDispatch={handleDispatchChange}
        onUpdateDelivery={handleDeliveryChange}
        isUpdating={updatingOrderId === selectedFullOrder?.orderId}
      />

      {/* ── 5. Toast Feedback ────────────────────────────────────── */}
      <AdminToast toast={toast} onClose={() => setToast(null)} />
    </AdminLayout>
  );
};

export default AdminDashboard;
