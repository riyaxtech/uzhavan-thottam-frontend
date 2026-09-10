/**
 * Service to handle submitting orders to the backend API.
 * Saves the order to the database and triggers dual email notifications:
 * 1. Admin order notification to uzhavanthottam26@gmail.com
 * 2. Customer order confirmation email to the customer's email address
 */
export const sendOrderEmail = async (order) => {
  const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
  const apiEndpoint = `${API_URL}/api/orders`;

  try {
    const res = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(order),
    });

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
      });

      if (fallbackRes.ok) {
        return { success: true, orderId: order.orderId, message: "Order placed successfully!" };
      }
    } catch (fallbackErr) {
      console.error("Fallback error:", fallbackErr);
    }

    throw error;
  }
};
