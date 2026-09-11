import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../server/models/Order.js';
import { createAdminToken, verifyAdminToken } from '../server/middleware/adminAuth.js';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    return null;
  }

  cachedDb = await mongoose.connect(mongoUri, {
    bufferCommands: false,
  });
  return cachedDb;
}

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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path / query action
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname.replace(/^\/api\/admin\/?/, '');
  const action = req.query.action || pathname.split('/')[0] || '';
  const subId = req.query.id || pathname.split('/')[1] || '';
  const subAction = req.query.subAction || pathname.split('/')[2] || '';

  // 1. POST /api/admin/login
  if (req.method === 'POST' && (action === 'login' || pathname === 'login')) {
    const { username, password } = req.body || {};
    const expectedUsername = process.env.ADMIN_USERNAME || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || '1234';

    if (username?.trim() !== expectedUsername || password !== expectedPassword) {
      return res.status(401).json({ success: false, message: 'Invalid admin username or password.' });
    }

    const token = createAdminToken({ username: expectedUsername });
    return res.json({
      success: true,
      message: 'Admin login successful.',
      token,
      user: { username: expectedUsername, role: 'admin' },
    });
  }

  // All other endpoints require admin token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication token required.' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session.' });
  }

  await connectToDatabase();

  // 2. GET /api/admin/verify
  if (req.method === 'GET' && (action === 'verify' || pathname === 'verify')) {
    return res.json({ success: true, valid: true, user: payload });
  }

  // 3. GET /api/admin/stats
  if (req.method === 'GET' && (action === 'stats' || pathname === 'stats')) {
    const all = await Order.find().lean();
    const normalized = all.map(normalizeOrder);
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
  }

  // 4. GET /api/admin/orders
  if (req.method === 'GET' && (action === 'orders' || pathname === 'orders' || action === '')) {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      const regex = new RegExp(req.query.search.trim(), 'i');
      filter.$or = [
        { 'customerDetails.name': regex },
        { 'customerDetails.phone': regex },
        { orderId: regex },
      ];
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== 'All') {
      if (req.query.paymentStatus === 'Pending') {
        filter.$or = [{ paymentStatus: 'Pending' }, { paymentStatus: { $exists: false } }, { paymentStatus: null }];
      } else {
        filter.paymentStatus = req.query.paymentStatus;
      }
    }
    if (req.query.dispatchStatus && req.query.dispatchStatus !== 'All') {
      if (req.query.dispatchStatus === 'Pending') {
        filter.$or = [{ dispatchStatus: 'Pending' }, { dispatchStatus: { $exists: false } }, { dispatchStatus: null }];
      } else {
        filter.dispatchStatus = req.query.dispatchStatus;
      }
    }
    if (req.query.deliveryStatus && req.query.deliveryStatus !== 'All') {
      if (req.query.deliveryStatus === 'Pending') {
        filter.$or = [{ deliveryStatus: 'Pending' }, { deliveryStatus: { $exists: false } }, { deliveryStatus: null }];
      } else {
        filter.deliveryStatus = req.query.deliveryStatus;
      }
    }

    const totalOrders = await Order.countDocuments(filter);
    const rawOrders = await Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean();
    const orders = rawOrders.map(normalizeOrder);

    const all = await Order.find().lean();
    const normalizedAll = all.map(normalizeOrder);
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
        totalPages: Math.ceil(totalOrders / limit) || 1,
        currentPage: page,
        limit,
        startItem: totalOrders === 0 ? 0 : skip + 1,
        endItem: Math.min(skip + limit, totalOrders),
      },
      stats,
    });
  }

  // 5. PATCH updates
  if (req.method === 'PATCH') {
    const targetId = subId || action;
    const targetField = subAction || req.query.field;
    const query = targetId.match(/^[0-9a-fA-F]{24}$/) ? { _id: targetId } : { orderId: targetId };
    const order = await Order.findOne(query);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (targetField === 'payment' || req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
      if (req.body.paymentStatus === 'Paid') {
        order.amountPaid = order.total;
        order.paymentDate = new Date().toLocaleString('en-IN');
      }
    }
    if (targetField === 'dispatch' || req.body.dispatchStatus) {
      order.dispatchStatus = req.body.dispatchStatus;
    }
    if (targetField === 'delivery' || req.body.deliveryStatus) {
      order.deliveryStatus = req.body.deliveryStatus;
      if (req.body.deliveryStatus === 'Delivered') {
        order.paymentStatus = 'Paid';
        order.amountPaid = order.total;
      }
    }

    await order.save();
    return res.json({ success: true, message: 'Order updated', order: normalizeOrder(order) });
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
