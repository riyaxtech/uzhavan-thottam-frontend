import express from 'express';
import Order from '../models/Order.js';
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from '../services/mailer.js';

const router = express.Router();

/**
 * POST /api/orders
 * Receives order payload from checkout, saves to DB, and triggers dual emails.
 */
router.post('/', async (req, res) => {
  try {
    const {
      orderId,
      orderDate,
      customerDetails,
      items,
      subtotal,
      deliveryCharge = 0,
      total,
      paymentMethod = 'Online Payment',
    } = req.body;

    // Validate required fields
    if (!customerDetails || !customerDetails.name || !customerDetails.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product.',
      });
    }

    // Generate standard order ID if not passed
    const finalOrderId = orderId || `UZH${Math.floor(10000 + Math.random() * 90000)}`;
    const finalOrderDate = orderDate || new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const orderData = {
      orderId: finalOrderId,
      orderDate: finalOrderDate,
      customerDetails,
      items,
      subtotal: Number(subtotal) || Number(total) || 0,
      deliveryCharge: Number(deliveryCharge) || 0,
      total: Number(total),
      paymentMethod,
      status: 'Pending',
    };

    // 1. Save to Database (MongoDB) if connected
    let savedOrder = null;
    try {
      if (Order.db.readyState === 1) {
        savedOrder = await Order.create(orderData);
        console.log(`✅ Order #${finalOrderId} saved to MongoDB successfully.`);
      } else {
        console.warn(`⚠️ MongoDB is not connected (readyState: ${Order.db.readyState}). Skipping DB write for Order #${finalOrderId}.`);
      }
    } catch (dbErr) {
      console.error(`⚠️ MongoDB save error for Order #${finalOrderId}:`, dbErr.message);
    }

    // 2. Trigger Emails asynchronously (Admin notification + Customer confirmation)
    const emailPromises = [
      sendAdminOrderNotification(orderData)
        .then(() => console.log(`✅ Admin email notification sent for #${finalOrderId}`))
        .catch((err) =>
          console.error(`⚠️ Admin email notification failed for #${finalOrderId}:`, err.message)
        ),
    ];

    if (customerDetails.email && customerDetails.email.includes('@')) {
      emailPromises.push(
        sendCustomerOrderConfirmation(orderData)
          .then((info) => {
            console.log(`✅ Customer confirmation email sent to ${customerDetails.email} for Order #${finalOrderId} (Message ID: ${info?.messageId})`);
          })
          .catch((err) =>
            console.error(`⚠️ Customer confirmation email failed for #${finalOrderId}:`, err.message)
          )
      );
    } else {
      console.warn(`ℹ️ No valid customer email provided for Order #${finalOrderId} (${customerDetails?.email}). Customer confirmation email skipped.`);
    }

    // Await email completions
    await Promise.allSettled(emailPromises);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully!',
      orderId: finalOrderId,
      order: savedOrder || orderData,
    });
  } catch (error) {
    console.error('❌ Order processing error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An unexpected error occurred while placing your order.',
    });
  }
});

/**
 * GET /api/orders
 * Returns all saved orders (admin view).
 */
router.get('/', async (req, res) => {
  try {
    if (Order.db.readyState !== 1) {
      return res.json({
        success: true,
        count: 0,
        orders: [],
        info: 'MongoDB is pending configuration. Add MONGODB_URI to .env to view persistent records.',
      });
    }
    const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/orders/:id
 * Retrieve order by Order ID.
 */
router.get('/:id', async (req, res) => {
  try {
    if (Order.db.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database connection not ready.' });
    }
    const order = await Order.findOne({ orderId: req.params.id });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
