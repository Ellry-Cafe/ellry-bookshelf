import { useCart } from '../context/CartContext';
import { X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CartSidebar() {
  const {
    cartItems,
    removeFromCart,
    getTotalPrice,
    incrementQuantity,
    decrementQuantity,
    cacheTotal,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const navigate = useNavigate();
  const total = getTotalPrice();

  return (
    <div className={`fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-50 transform transition-transform duration-300 ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Your Cart</h2>
        <button onClick={() => setIsCartOpen(false)}>
          <X className="text-gray-600 hover:text-black" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100%-4rem)]">
        {cartItems.map((item, i) => (
          <div key={i} className="border-b pb-2 mb-2">
            <div className="flex items-center gap-2 mb-2 justify-between">
              <p className="font-semibold">{item.title}</p>
              <button
                onClick={() => removeFromCart(item.id, item.type)}
                className="text-red-700 mt-1"
              >
                <Trash2 className='w-4 h-auto' />
              </button>
            </div>

            {item.type === 'buy' && (
              <div className="text-sm text-gray-400">
                <p>Price: <span className='text-gray-700'>₱{item.price}</span></p>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <span className="text-gray-400">Quantity:</span>
                  <button onClick={() => decrementQuantity(item.id, item.type)} className="px-2 py-1 bg-gray-200 rounded text-xs">−</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => incrementQuantity(item.id, item.type)} className="px-2 py-1 bg-gray-200 rounded text-xs">+</button>
                </div>
              </div>
            )}

            {item.type === 'rent' && (
              <div className="text-sm text-gray-400">
                <p>Rental: <span className='text-gray-700'>₱{item.rental_price}/day</span></p>
                <div className="flex items-center gap-2 mt-1 text-gray-700">
                  <span className="text-gray-400">Days:</span>
                  <button onClick={() => decrementQuantity(item.id, item.type)} className="px-2 py-1 bg-gray-200 rounded text-xs">−</button>
                  <span>{item.days}</span>
                  <button onClick={() => incrementQuantity(item.id, item.type)} className="px-2 py-1 bg-gray-200 rounded text-xs">+</button>
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="p-4 mt-auto">
          <div className="text-right font-semibold mb-2">
            Total: ₱{total.toFixed(2)}
          </div>
          <button
            onClick={() => {
              cacheTotal();
              setIsCartOpen(false); // ✅ this now works properly
              navigate('/checkout');
            }}
            className="block bg-tealbrand text-white text-center px-4 py-2 rounded hover:bg-teal-600 transition w-full"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
