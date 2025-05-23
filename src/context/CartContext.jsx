import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cachedTotal, setCachedTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

 const addToCart = (book, type = 'buy', value = 1) => {
  setCartItems(prevItems => {
    const existingIndex = prevItems.findIndex(
      item => item.id === book.id && item.type === type
    );

    const updatedItems = [...prevItems];

    if (existingIndex !== -1) {
      // If already in cart
      if (type === 'buy') {
        updatedItems[existingIndex].quantity += 1;
      } else {
        updatedItems[existingIndex].days += value;
      }
      return updatedItems;
    }

    return [
      ...prevItems,
      {
        ...book,
        type,
        quantity: type === 'buy' ? 1 : undefined,
        days: type === 'rent' ? value : undefined,
      }
    ];
  });
};


const incrementQuantity = (bookId, type) => {
  setCartItems(prev =>
    prev.map(item =>
      item.id === bookId && item.type === type
        ? {
            ...item,
            quantity: item.type === 'buy' ? item.quantity + 1 : undefined,
            days: item.type === 'rent' ? item.days + 1 : undefined,
          }
        : item
    )
  );
};

const decrementQuantity = (bookId, type) => {
  setCartItems(prev =>
    prev
      .map(item =>
        item.id === bookId && item.type === type
          ? {
              ...item,
              quantity: item.type === 'buy' ? item.quantity - 1 : undefined,
              days: item.type === 'rent' ? item.days - 1 : undefined,
            }
          : item
      )
      .filter(item =>
        (item.type === 'buy' && item.quantity > 0) ||
        (item.type === 'rent' && item.days > 0)
      )
  );
};

  

  const removeFromCart = (bookId, type) => {
    setCartItems(prevItems =>
      prevItems.filter(item => !(item.id === bookId && item.type === type))
    );
  };


  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      if (item.type === 'buy') {
        return total + (item.price * item.quantity);
      } else if (item.type === 'rent') {
        return total + (item.rental_price * item.days);
      }
      return total;
    }, 0);
  };


  const cacheTotal = () => {
    const total = cartItems.reduce((sum, item) => {
      if (item.type === 'buy') {
        return sum + item.price * item.quantity;
      } else if (item.type === 'rent') {
        return sum + item.rental_price * item.days;
      }
      return sum;
    }, 0);
    setCachedTotal(total);
  };




  return (
    <CartContext.Provider
    value={{
      cartItems,
      addToCart,
      removeFromCart,
      incrementQuantity,
      decrementQuantity,
      getTotalPrice,
      clearCart: () => setCartItems([]),
      cachedTotal,
      cacheTotal,
      isCartOpen,
      setIsCartOpen
    }}
    >
    {children}
    </CartContext.Provider>

  );
}

export const useCart = () => useContext(CartContext);
