/**
 * Service to handle submitting orders to the backend API.
 * Saves the order to the database and triggers dual email notifications:
 * 1. Admin order notification to uzhavanthottam26@gmail.com
 * 2. Customer order confirmation email to the customer's email address
 */
const getApiEndpoint = () => {
  // 1. If running in Vite development mode or on localhost, use local proxy (/api/orders)
  // This automatically routes to http://localhost:5000 without CORS or Render cold-start delays
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (import.meta.env.DEV || isLocalhost) {
    const configured = import.meta.env.VITE_API_URL;
    if (configured && configured.includes('localhost')) {
      return `${configured.replace(/\/+$/, '')}/api/orders`;
    }
    return '/api/orders';
  }

  // 2. In production (deployed environment)
  // If VITE_API_URL is configured (e.g. Render backend), use it.
  // Otherwise default to same-origin relative path /api/orders (for Vercel serverless / monorepo)
  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
  return `${API_URL}/api/orders`;
};

export const sendOrderEmail = async (order) => {
  const apiEndpoint = getApiEndpoint();

  try {
    // 40 second timeout to allow for Render free-tier cold starts if deployed
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 40000);

    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(order),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        orderId: data.orderId || order.orderId,
        message: "Order placed successfully!",
      };
    }

    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.message || `Server responded with status: ${res.status}`);
  } catch (error) {
    console.error("Backend order submission error:", error);

    // If we tried a remote URL and failed, but we are running on localhost, attempt fallback to local proxy
    if (apiEndpoint.startsWith('http') && typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      try {
        console.warn("Attempting local backend fallback at /api/orders...");
        const localRes = await fetch('/api/orders', {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(order),
        });

        if (localRes.ok) {
          const localData = await localRes.json();
          return {
            success: true,
            orderId: localData.orderId || order.orderId,
            message: "Order placed successfully!",
          };
        }
      } catch (localErr) {
        console.error("Local backend fallback failed:", localErr);
      }
    }

    // Fallback: If backend is offline or unreachable, attempt formsubmit fallback so order is not lost
    try {
      console.warn("Attempting fallback email dispatch via FormSubmit...");
      const itemsList = (order.items || [])
        .map(
          (item) =>
            `- ${item.name} (${item.weight}): ${item.quantity} x ₹${item.price} = ₹${item.quantity * item.price}`
        )
        .join("\n");

      const { name, phone, email, doorNo, street, district, state, pincode } = order.customerDetails || {};
      const formattedAddress = [doorNo ? `Door No: ${doorNo}` : '', street, district, state ? `${state} - ${pincode}` : pincode]
        .filter(Boolean)
        .join(', ');

      const fallbackController = new AbortController();
      const fallbackTimeoutId = setTimeout(() => fallbackController.abort(), 10000);

      const fallbackRes = await fetch("https://formsubmit.co/ajax/094885df4f1acc7b7087c7553b8166dd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          _subject: `New Order Placed - Order ID: ${order.orderId}`,
          orderId: order.orderId,
          orderDate: order.orderDate,
          customerName: name,
          customerPhone: phone,
          customerEmail: email || 'Not provided',
          deliveryAddress: formattedAddress,
          itemsOrdered: itemsList,
          finalOrderAmount: `₹${order.total}`,
          paymentMethod: order.paymentMethod || 'Online Payment',
          _captcha: "false",
        }),
        signal: fallbackController.signal,
      });

      clearTimeout(fallbackTimeoutId);

      if (fallbackRes.ok) {
        return { success: true, orderId: order.orderId, message: "Order placed successfully!" };
      }
    } catch (fallbackErr) {
      console.error("Fallback error:", fallbackErr);
    }

    // Provide friendly error message instead of raw "TypeError: Failed to fetch"
    if (error.name === 'AbortError') {
      throw new Error("Server request timed out. If the backend is waking up, please try again in a few moments.");
    }
    if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
      throw new Error("Unable to connect to the order server. Please check your internet connection or try again in a moment.");
    }

    throw error;
  }
};
