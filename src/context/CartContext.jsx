import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('uzhavan_thottam_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error('Error parsing cart from localStorage', e);
      return [];
    }
  });

  const [buyNowItem, setBuyNowItem] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const defaultCustomerDetails = {
    name: '',
    phone: '',
    doorNo: '',
    street: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
  };

  const [customerDetails, setCustomerDetails] = useState(() => {
    try {
      const savedDetails = localStorage.getItem('uzhavan_thottam_customer');
      return savedDetails ? { ...defaultCustomerDetails, ...JSON.parse(savedDetails) } : defaultCustomerDetails;
    } catch (e) {
      return defaultCustomerDetails;
    }
  });

  const [orderSuccessData, setOrderSuccessData] = useState(null);

  useEffect(() => {
    localStorage.setItem('uzhavan_thottam_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('uzhavan_thottam_customer', JSON.stringify(customerDetails));
  }, [customerDetails]);

  const addToCart = (product, weight, quantity) => {
    const unitPrice = product.prices?.[weight] || parseInt(product.price.replace('₹', '')) || 0;
    
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && item.weight === weight
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      }

      return [
        ...prevCart,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          category: product.category,
          weight,
          quantity,
          price: unitPrice,
        },
      ];
    });
  };

  const updateQuantity = (id, weight, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id && item.weight === weight ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id, weight) => {
    setCart((prevCart) => prevCart.filter((item) => !(item.id === id && item.weight === weight)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        buyNowItem,
        setBuyNowItem,
        isCartOpen,
        setIsCartOpen,
        customerDetails,
        setCustomerDetails,
        orderSuccessData,
        setOrderSuccessData,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
