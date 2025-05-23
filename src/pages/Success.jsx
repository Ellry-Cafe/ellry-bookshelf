import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Success() {
  const { cartItems, getTotalPrice } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/');
    }
  }, [cartItems, navigate]);

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-tealbrand mb-4">✅ Checkout Successful</h1>

      <div className="bg-white shadow rounded p-4 text-sm">
        <p className="mb-4">Thank you for your purchase! Here's your receipt:</p>

        <ul className="divide-y text-gray-700">
          {cartItems.map((item, i) => (
            <li key={i} className="py-2">
              <div className="font-semibold">{item.title}</div>
              <div>Type: {item.type}</div>
              {item.type === 'buy' && <div>Qty: {item.quantity} x ₱{item.price}</div>}
              {item.type === 'rent' && <div>Days: {item.days} x ₱{item.rental_price}</div>}
              <div className="font-medium">
                Subtotal: ₱
                {item.type === 'buy'
                  ? item.price * item.quantity
                  : item.rental_price * item.days}
              </div>
            </li>
          ))}
        </ul>

        <div className="text-right font-bold text-lg mt-4">
          Total: ₱{getTotalPrice()}
        </div>

        <div className="text-xs text-gray-400 mt-2">
          Transaction Time: {new Date().toLocaleString()}
        </div>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-6 w-full bg-tealbrand text-white py-2 rounded hover:bg-teal-600 transition"
      >
        Back to Home
      </button>
    </div>
  );
}
