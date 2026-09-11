import express from 'express';
import Order from '../models/Order.js';
import { requireAdmin, createAdminToken } from '../middleware/adminAuth.js';

const router = express.Router();

/**
 * Normalizes an order document to ensure paymentStatus, dispatchStatus,
 * deliveryStatus, and payment fields exist with valid defaults for legacy documents.
 */
const normalizeOrder = (doc) => {
  const order = doc.toObject ? doc.toObject() : { ...doc };
  return {
    ...order,
    paymentStatus: order.paymentStatus || 'Pending',
    dispatchStatus: order.dispatchStatus || 'Pending',
    deliveryStatus: order.deliveryStatus || 'Pending',
    transactionId: order.transactionId || '',
    paymentDate: order.paymentDate || '',
    amountPaid: typeof order.amountPaid === 'number' ? order.amountPaid : (order.paymentStatus === 'Paid' ? order.total : 0),
  };
};

/**
 * POST /api/admin/login
 * Validates admin credentials from server environment variables.
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required.',
      });
    }

    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || '1234';

    if (username.trim() !== expectedUsername || password !== expectedPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin username or password.',
      });
    }

    const token = createAdminToken({ username: expectedUsername });

    return res.json({
      success: true,
      message: 'Admin login successful.',
      token,
      user: {
        username: expectedUsername,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({
      success: false,
      message: 'An internal error occurred while processing login.',
    });
  }
});

/**
 * GET /api/admin/verify
 * Verifies the validity of the current admin session token.
 */
router.get('/verify', requireAdmin, (req, res) => {
  return res.json({
    success: true,
    valid: true,
    user: req.admin,
  });
});

/**
 * GET /api/admin/stats
 * Aggregates dashboard summary cards metrics.
 */
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    if (Order.db.readyState !== 1) {
      return res.json({
        success: true,
        stats: {
          totalOrders: 0,
          pendingPayments: 0,
          paidOrders: 0,
          pendingDispatch: 0,
          dispatchedOrders: 0,
          deliveredOrders: 0,
          totalRevenue: 0,
        },
      });
    }

    const allOrders = await Order.find().lean();
    const normalized = allOrders.map(normalizeOrder);

    const stats = {
      totalOrders: normalized.length,
      pendingPayments: normalized.filter(o => o.paymentStatus === 'Pending').length,
      paidOrders: normalized.filter(o => o.paymentStatus === 'Paid').length,
      pendingDispatch: normalized.filter(o => o.dispatchStatus === 'Pending').length,
      dispatchedOrders: normalized.filter(o => o.dispatchStatus === 'Dispatched').length,
      deliveredOrders: normalized.filter(o => o.deliveryStatus === 'Delivered').length,
      totalRevenue: normalized
        .filter(o => o.paymentStatus === 'Paid')
        .reduce((sum, o) => sum + (Number(o.total) || 0), 0),
    };

    return res.json({ success: true, stats });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/orders
 * Returns filtered, searched, sorted, and paginated orders (10 per page default).
 */
router.get('/orders', requireAdmin, async (req, res) => {
  try {
    if (Order.db.readyState !== 1) {
      return res.json({
        success: true,
        orders: [],
        pagination: {
          totalOrders: 0,
          totalPages: 0,
          currentPage: 1,
          limit: 10,
          startItem: 0,
          endItem: 0,
        },
        stats: {
          totalOrders: 0,
          pendingPayments: 0,
          paidOrders: 0,
          pendingDispatch: 0,
          dispatchedOrders: 0,
          deliveredOrders: 0,
        },
      });
    }

    const {
      page = 1,
      limit = 10,
      search = '',
      paymentStatus = 'All',
      dispatchStatus = 'All',
      deliveryStatus = 'All',
      startDate = '',
      endDate = '',
      sortBy = 'orderDate',
      sortOrder = 'desc',
    } = req.query;

    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    // Build MongoDB filter query
    const filter = {};

    // 1. Search (by customer name, phone, or order ID)
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { 'customerDetails.name': searchRegex },
        { 'customerDetails.phone': searchRegex },
        { orderId: searchRegex },
      ];
    }

    // 2. Status Filters with backward compatibility
    if (paymentStatus && paymentStatus !== 'All') {
      if (paymentStatus === 'Pending') {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { paymentStatus: 'Pending' },
            { paymentStatus: { $exists: false } },
            { paymentStatus: null },
            { paymentStatus: '' },
          ],
        });
      } else {
        filter.paymentStatus = paymentStatus;
      }
    }

    if (dispatchStatus && dispatchStatus !== 'All') {
      if (dispatchStatus === 'Pending') {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { dispatchStatus: 'Pending' },
            { dispatchStatus: { $exists: false } },
            { dispatchStatus: null },
            { dispatchStatus: '' },
          ],
        });
      } else {
        filter.dispatchStatus = dispatchStatus;
      }
    }

    if (deliveryStatus && deliveryStatus !== 'All') {
      if (deliveryStatus === 'Pending') {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { deliveryStatus: 'Pending' },
            { deliveryStatus: { $exists: false } },
            { deliveryStatus: null },
            { deliveryStatus: '' },
          ],
        });
      } else {
        filter.deliveryStatus = deliveryStatus;
      }
    }

    // 3. Date Filters
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // 4. Sorting
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    let sortObj = { createdAt: -1 };
    if (sortBy === 'name') {
      sortObj = { 'customerDetails.name': sortDirection };
    } else if (sortBy === 'total') {
      sortObj = { total: sortDirection };
    } else if (sortBy === 'orderDate') {
      sortObj = { createdAt: sortDirection };
    }

    const totalOrders = await Order.countDocuments(filter);
    const rawOrders = await Order.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const orders = rawOrders.map(normalizeOrder);
    const totalPages = Math.ceil(totalOrders / parsedLimit) || 1;
    const startItem = totalOrders === 0 ? 0 : skip + 1;
    const endItem = Math.min(skip + parsedLimit, totalOrders);

    // Compute aggregate summary counts
    const allOrders = await Order.find().lean();
    const normalizedAll = allOrders.map(normalizeOrder);
    const stats = {
      totalOrders: normalizedAll.length,
      pendingPayments: normalizedAll.filter(o => o.paymentStatus === 'Pending').length,
      paidOrders: normalizedAll.filter(o => o.paymentStatus === 'Paid').length,
      pendingDispatch: normalizedAll.filter(o => o.dispatchStatus === 'Pending').length,
      dispatchedOrders: normalizedAll.filter(o => o.dispatchStatus === 'Dispatched').length,
      deliveredOrders: normalizedAll.filter(o => o.deliveryStatus === 'Delivered').length,
    };

    return res.json({
      success: true,
      orders,
      pagination: {
        totalOrders,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        startItem,
        endItem,
      },
      stats,
    });
  } catch (err) {
    console.error('Error fetching admin orders:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/orders/:id
 * Retrieve full order details by orderId or _id.
 */
router.get('/orders/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    const rawOrder = await Order.findOne(query).lean();

    if (!rawOrder) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    return res.json({
      success: true,
      order: normalizeOrder(rawOrder),
    });
  } catch (err) {
    console.error('Error fetching order details:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/admin/orders/:id/payment
 * Update payment status (Pending / Paid) and payment metadata.
 */
router.patch('/orders/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, transactionId, paymentDate, amountPaid } = req.body;

    if (!['Pending', 'Paid'].includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment status. Must be Pending or Paid.',
      });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = paymentStatus;
    if (transactionId !== undefined) order.transactionId = transactionId;
    if (paymentDate !== undefined) {
      order.paymentDate = paymentDate;
    } else if (paymentStatus === 'Paid' && !order.paymentDate) {
      order.paymentDate = new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    if (amountPaid !== undefined) {
      order.amountPaid = Number(amountPaid);
    } else if (paymentStatus === 'Paid') {
      order.amountPaid = order.total;
    }

    await order.save();

    return res.json({
      success: true,
      message: 'Payment status updated successfully.',
      order: normalizeOrder(order),
    });
  } catch (err) {
    console.error('Error updating payment status:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/admin/orders/:id/dispatch
 * Update dispatch status (Pending / Dispatched).
 */
router.patch('/orders/:id/dispatch', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { dispatchStatus } = req.body;

    if (!['Pending', 'Dispatched'].includes(dispatchStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid dispatch status. Must be Pending or Dispatched.',
      });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.dispatchStatus = dispatchStatus;
    if (dispatchStatus === 'Dispatched' && order.status === 'Pending') {
      order.status = 'Dispatched';
    }

    await order.save();

    return res.json({
      success: true,
      message: 'Order dispatch status updated successfully.',
      order: normalizeOrder(order),
    });
  } catch (err) {
    console.error('Error updating dispatch status:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * PATCH /api/admin/orders/:id/delivery
 * Update delivery status (Pending / Delivered).
 */
router.patch('/orders/:id/delivery', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryStatus } = req.body;

    if (!['Pending', 'Delivered'].includes(deliveryStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid delivery status. Must be Pending or Delivered.',
      });
    }

    const query = id.match(/^[0-9a-fA-F]{24}$/) ? { _id: id } : { orderId: id };
    const order = await Order.findOne(query);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.deliveryStatus = deliveryStatus;
    if (deliveryStatus === 'Delivered') {
      order.status = 'Delivered';
      // If delivered, payment usually should also be marked paid if not already
      if (order.paymentStatus === 'Pending') {
        order.paymentStatus = 'Paid';
        order.amountPaid = order.total;
        if (!order.paymentDate) {
          order.paymentDate = new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
        }
      }
    }

    await order.save();

    return res.json({
      success: true,
      message: 'Order marked as delivered successfully.',
      order: normalizeOrder(order),
    });
  } catch (err) {
    console.error('Error updating delivery status:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/admin/payments
 * Payments list view with search, filter (Pending, Paid), and pagination.
 */
router.get('/payments', requireAdmin, async (req, res) => {
  try {
    if (Order.db.readyState !== 1) {
      return res.json({ success: true, payments: [], total: 0 });
    }

    const { page = 1, limit = 10, search = '', paymentStatus = 'All' } = req.query;
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (parsedPage - 1) * parsedLimit;

    const filter = {};

    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { orderId: regex },
        { 'customerDetails.name': regex },
        { transactionId: regex },
      ];
    }

    if (paymentStatus && paymentStatus !== 'All') {
      if (paymentStatus === 'Pending') {
        filter.$or = [
          { paymentStatus: 'Pending' },
          { paymentStatus: { $exists: false } },
          { paymentStatus: null },
        ];
      } else {
        filter.paymentStatus = paymentStatus;
      }
    }

    const total = await Order.countDocuments(filter);
    const rawOrders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit)
      .lean();

    const payments = rawOrders.map(normalizeOrder);
    const totalPages = Math.ceil(total / parsedLimit) || 1;

    // Calculate totals for payment summary
    const all = await Order.find().lean();
    const normalizedAll = all.map(normalizeOrder);
    const totalCollected = normalizedAll
      .filter(o => o.paymentStatus === 'Paid')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
    const totalPending = normalizedAll
      .filter(o => o.paymentStatus === 'Pending')
      .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    return res.json({
      success: true,
      payments,
      pagination: {
        total,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
      },
      summary: {
        totalCollected,
        totalPending,
        totalTransactions: normalizedAll.length,
      },
    });
  } catch (err) {
    console.error('Error fetching payments:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
