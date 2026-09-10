import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Configure Nodemailer transport with SMTP settings.
 * Defaults to Gmail SMTP (using App Password).
 */
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT) || 587;
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('⚠️ SMTP credentials not fully configured (SMTP_USER / SMTP_PASS). Email sending may fail or be skipped.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  });
};

/**
 * Sends Admin notification email when a new order is received.
 */
export const sendAdminOrderNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || 'uzhavanthottam26@gmail.com';
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(`[MAILER] SMTP credentials not set. Order #${order.orderId} email logged to console.`);
    return null;
  }

  const transporter = createTransporter();

  const { customerDetails, items, orderId, orderDate, subtotal, deliveryCharge = 0, total, paymentMethod } = order;

  // Build items text & HTML
  const itemsText = items
    .map(
      (item) =>
        `Product: ${item.name}\nQuantity: ${item.quantity}\nWeight: ${item.weight || 'Standard'}\nPrice: ₹${item.price}\nSubtotal: ₹${item.quantity * item.price}\n`
    )
    .join('\n------------------------\n');

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 12px; font-weight: 600; color: #1f2937;">${item.name}</td>
        <td style="padding: 10px 12px; color: #4b5563;">${item.weight || 'Standard'}</td>
        <td style="padding: 10px 12px; text-align: center; color: #1f2937;">${item.quantity}</td>
        <td style="padding: 10px 12px; text-align: right; color: #4b5563;">₹${item.price}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 600; color: #1f2937;">₹${item.quantity * item.price}</td>
      </tr>
    `
    )
    .join('');

  const plainText = `
🛒 NEW ORDER RECEIVED

Order ID: ${orderId}
Date: ${orderDate}

CUSTOMER DETAILS
────────────────────────
Name: ${customerDetails.name}
Phone: ${customerDetails.phone}
Email: ${customerDetails.email || 'Not provided'}

DELIVERY ADDRESS
────────────────────────
Door No: ${customerDetails.doorNo}
Area/Street: ${customerDetails.street}
District: ${customerDetails.district}
State: ${customerDetails.state || 'Tamil Nadu'}
Pincode: ${customerDetails.pincode}

ORDER DETAILS
────────────────────────
${itemsText}
────────────────────────
Subtotal: ₹${subtotal}
Delivery: ₹${deliveryCharge}
TOTAL: ₹${total}

[Order ID: ${orderId}]
`.trim();

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>New Order #${orderId}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f7f2ea; margin: 0; padding: 20px; color: #14251f;">
    <div style="max-width: 620px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5e7eb; border-top: 6px solid #d4891a; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      
      <div style="background-color: #123c24; color: #f5e8cf; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">UZHAVAN THOTTAM</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; letter-spacing: 2px; text-transform: uppercase; color: #d4891a;">🛒 New Order Received</p>
      </div>

      <div style="padding: 24px;">
        <div style="background-color: #faf7f0; border-left: 4px solid #123c24; padding: 12px 16px; margin-bottom: 20px;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #123c24;">Order ID: #${orderId}</p>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Date: ${orderDate}</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #d4891a; margin-bottom: 10px; border-bottom: 2px solid #faf7f0; padding-bottom: 6px;">Customer Details</h3>
        <table style="width: 100%; font-size: 14px; margin-bottom: 20px; line-height: 1.6;">
          <tr><td style="width: 120px; color: #6b7280; font-weight: bold;">Name:</td><td>${customerDetails.name}</td></tr>
          <tr><td style="color: #6b7280; font-weight: bold;">Phone:</td><td><a href="tel:${customerDetails.phone}" style="color: #123c24; font-weight: bold; text-decoration: none;">${customerDetails.phone}</a></td></tr>
          <tr><td style="color: #6b7280; font-weight: bold;">Email:</td><td>${customerDetails.email ? `<a href="mailto:${customerDetails.email}" style="color: #123c24; text-decoration: none;">${customerDetails.email}</a>` : 'Not provided'}</td></tr>
        </table>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #d4891a; margin-bottom: 10px; border-bottom: 2px solid #faf7f0; padding-bottom: 6px;">Delivery Address</h3>
        <div style="background-color: #fafafa; border: 1px solid #f3f4f6; border-radius: 6px; padding: 14px; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
          <p style="margin: 0;"><strong>Door No:</strong> ${customerDetails.doorNo}</p>
          <p style="margin: 4px 0 0 0;"><strong>Area / Street:</strong> ${customerDetails.street}</p>
          <p style="margin: 4px 0 0 0;"><strong>District:</strong> ${customerDetails.district}</p>
          <p style="margin: 4px 0 0 0;"><strong>State & Pincode:</strong> ${customerDetails.state || 'Tamil Nadu'} - ${customerDetails.pincode}</p>
        </div>

        <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #d4891a; margin-bottom: 10px; border-bottom: 2px solid #faf7f0; padding-bottom: 6px;">Ordered Items</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #f9fafb; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 8px 12px;">Product</th>
              <th style="padding: 8px 12px;">Weight</th>
              <th style="padding: 8px 12px; text-align: center;">Qty</th>
              <th style="padding: 8px 12px; text-align: right;">Price</th>
              <th style="padding: 8px 12px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: #faf7f0; padding: 14px 20px; border-radius: 6px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
            <span>Subtotal:</span>
            <span style="font-weight: 600;">₹${subtotal}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px;">
            <span>Delivery:</span>
            <span style="font-weight: 600; color: #16a34a;">₹${deliveryCharge} (Free)</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 2px solid #e5e7eb; padding-top: 8px; color: #123c24;">
            <span>Total Payable:</span>
            <span>₹${total}</span>
          </div>
        </div>

      </div>

      <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
        Uzhavan Thottam Order Management &bull; Kangayampalayam, Karur, Tamil Nadu
      </div>
    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"Uzhavan Thottam Orders" <${process.env.SMTP_USER || 'no-reply@uzhavanthottam.com'}>`,
    to: adminEmail,
    subject: `🛒 New Order #${orderId} – ₹${total}`,
    text: plainText,
    html: htmlContent,
  });
};

/**
 * Sends Customer confirmation email when an order is placed.
 */
export const sendCustomerOrderConfirmation = async (order) => {
  const customerEmail = order.customerDetails?.email?.trim();
  if (!customerEmail) {
    console.log(`ℹ️ Customer email not provided for order #${order.orderId}, skipping customer confirmation email.`);
    return null;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'uzhavanthottam26@gmail.com').toLowerCase().trim();
  if (customerEmail.toLowerCase() === adminEmail) {
    console.log(`ℹ️ Customer email is same as admin store email (${customerEmail}). Uzhavan Thottam will only receive the order email.`);
    return null;
  }

  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn(`[MAILER] SMTP credentials not set. Customer confirmation for order #${order.orderId} logged to console.`);
    return null;
  }

  const transporter = createTransporter();
  const { customerDetails, items, orderId, total } = order;

  const itemsHtml = items
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #f3f4f6;">
        <td style="padding: 10px 0; font-weight: 600; color: #14251f;">${item.name} (${item.weight || 'Standard'})</td>
        <td style="padding: 10px 0; text-align: center; color: #6b7280;">x${item.quantity}</td>
        <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #14251f;">₹${item.price * item.quantity}</td>
      </tr>
    `
    )
    .join('');

  const plainText = `
Hi ${customerDetails.name},

Thank you for your order from Uzhavan Thottam! 🌱

Your order #${orderId} has been successfully placed.

Order Total: ₹${total}

💳 IMPORTANT PAYMENT NOTICE:
We accept Online Payments only (UPI / GPay / PhonePe / Net Banking).
We will contact you shortly with online payment instructions and delivery updates.
If you have any doubts or questions, please call or WhatsApp us at +91 63851 72761.

Delivery Address:
Door No: ${customerDetails.doorNo}
Area/Street: ${customerDetails.street}
District: ${customerDetails.district}
State: ${customerDetails.state || 'Tamil Nadu'} - ${customerDetails.pincode}

Thank you for shopping authentic organic farm products with us!
Uzhavan Thottam
📞 +91 63851 72761
✉️ uzhavanthottam26@gmail.com
`.trim();

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Order Confirmation #${orderId}</title>
  </head>
  <body style="font-family: Arial, sans-serif; background-color: #f7f2ea; margin: 0; padding: 20px; color: #14251f;">
    <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); border-top: 6px solid #123c24;">
      
      <div style="background-color: #123c24; color: #f5e8cf; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: 1px;">UZHAVAN THOTTAM</h1>
        <p style="margin: 6px 0 0 0; font-size: 13px; color: #d4891a; letter-spacing: 1px;">Pure · Natural · Trusted</p>
      </div>

      <div style="padding: 24px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 50%; background-color: #e8f5e9; color: #16a34a; font-size: 24px;">✓</div>
          <h2 style="margin: 12px 0 4px 0; font-size: 20px; color: #123c24;">Order Placed Successfully! 🎉</h2>
          <p style="margin: 0; font-size: 14px; color: #4b5563;">Thank you, <strong>${customerDetails.name}</strong>!</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; font-weight: bold; color: #d4891a;">Order ID: #${orderId}</p>
        </div>

        <!-- Online Payment Notice Box -->
        <div style="background-color: #fefce8; border: 1px solid #fde047; border-left: 4px solid #ca8a04; padding: 14px 16px; border-radius: 6px; margin-bottom: 22px;">
          <p style="margin: 0; font-size: 14px; font-weight: bold; color: #854d0e;">💳 Online Payment Notice</p>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #713f12; line-height: 1.5;">
            We accept <strong>Online Payments only</strong> (UPI / GPay / PhonePe / Net Banking). We will contact you shortly with the payment details and delivery confirmation.
          </p>
          <p style="margin: 8px 0 0 0; font-size: 13px; color: #713f12;">
            If you have any doubts, please call or WhatsApp us at: <strong><a href="tel:+916385172761" style="color: #854d0e; text-decoration: underline;">+91 63851 72761</a></strong>
          </p>
        </div>

        <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
          We have received your order and our farm team is preparing your authentic organic products with care.
        </p>

        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #123c24; margin: 20px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 16px;">
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="background-color: #faf7f0; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: bold; color: #123c24;">
            <span>Total:</span>
            <span>₹${total}</span>
          </div>
        </div>

        <h3 style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #123c24; margin: 20px 0 10px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px;">Delivery Details</h3>
        <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.5;">
          ${customerDetails.doorNo}, ${customerDetails.street},<br/>
          ${customerDetails.district}, ${customerDetails.state || 'Tamil Nadu'} - ${customerDetails.pincode}<br/>
          <strong>Phone:</strong> ${customerDetails.phone}
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f3f4f6; text-align: center;">
          <a href="https://www.uzhavanthottam.com/products" style="display: inline-block; background-color: #123c24; color: #f5e8cf; text-decoration: none; padding: 12px 24px; border-radius: 4px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">Continue Shopping</a>
        </div>
      </div>

      <div style="background-color: #f9fafb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
        Need help with your order? Contact us at <a href="mailto:uzhavanthottam26@gmail.com" style="color: #123c24;">uzhavanthottam26@gmail.com</a> or call +91 63851 72761.
      </div>
    </div>
  </body>
  </html>
  `;

  return transporter.sendMail({
    from: `"Uzhavan Thottam" <${process.env.SMTP_USER || 'no-reply@uzhavanthottam.com'}>`,
    to: customerEmail,
    subject: `Order Confirmation – #${orderId} | Uzhavan Thottam`,
    text: plainText,
    html: htmlContent,
  });
};
