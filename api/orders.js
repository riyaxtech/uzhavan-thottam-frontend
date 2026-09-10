import 'dotenv/config';
import mongoose from 'mongoose';
import Order from '../server/models/Order.js';
import { sendAdminOrderNotification, sendCustomerOrderConfirmation } from '../server/services/mailer.js';

let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.warn('⚠️ MONGODB_URI not configured in serverless environment.');
    return null;
  }

  cachedDb = await mongoose.connect(mongoUri, {
    bufferCommands: false,
  });
  return cachedDb;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
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

      // Connect DB and save
      try {
        await connectToDatabase();
        if (mongoose.connection.readyState === 1) {
          await Order.create(orderData);
          console.log(`✅ Serverless Order #${finalOrderId} saved to MongoDB.`);
        }
      } catch (dbErr) {
        console.error(`⚠️ DB Save Error in Serverless Function:`, dbErr.message);
      }

      // Send emails
      const emailPromises = [
        sendAdminOrderNotification(orderData)
          .then(() => console.log(`✅ Admin email notification sent for #${finalOrderId}`))
          .catch((err) =>
            console.error(`⚠️ Admin email failed:`, err.message)
          ),
      ];

      if (customerDetails.email && customerDetails.email.includes('@')) {
        emailPromises.push(
          sendCustomerOrderConfirmation(orderData)
            .then((info) => console.log(`✅ Customer confirmation sent to ${customerDetails.email} for #${finalOrderId} (ID: ${info?.messageId})`))
            .catch((err) =>
              console.error(`⚠️ Customer email failed:`, err.message)
            )
        );
      }

      await Promise.allSettled(emailPromises);

      return res.status(201).json({
        success: true,
        message: 'Order placed successfully!',
        orderId: finalOrderId,
        order: orderData,
      });
    } catch (error) {
      console.error('Serverless order processing error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error processing order.',
      });
    }
  }

  if (req.method === 'GET') {
    try {
      await connectToDatabase();
      const orders = await Order.find().sort({ createdAt: -1 }).limit(50);
      return res.json({ success: true, count: orders.length, orders });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  return res.status(405).json({ success: false, message: 'Method Not Allowed' });
}
