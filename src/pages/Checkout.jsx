import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

export default function Checkout() {
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('Cash');
  const [cashReceived, setCashReceived] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const navigate = useNavigate();
  const subtotal = getTotalPrice();
  const total = subtotal - (subtotal * (discount / 100));

  const applyCoupon = async () => {
    if (!couponCode) {
      toast.error('Please enter a coupon code');
      return;
    }

    try {
      const { data: coupon, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error || !coupon) {
        toast.error('Invalid or expired coupon code');
        return;
      }

      // Check if coupon is expired
      if (new Date(coupon.expiry_date) < new Date()) {
        toast.error('This coupon has expired');
        return;
      }

      setDiscount(coupon.discount_percentage);
      setAppliedCoupon(coupon);
      toast.success(`Coupon applied! ${coupon.discount_percentage}% discount`);
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Failed to apply coupon');
    }
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponCode('');
  };

  const handleCheckout = async () => {
    try {
      if (selectedPayment === 'Cash' && parseFloat(cashReceived) < total) {
        toast.error('Cash received is less than the total amount.');
        return;
      }

      const transactions = cartItems.map(item => ({
        book_id: item.id,
        type: item.type,
        quantity: item.quantity,
        payment_method: selectedPayment,
        total: item.price * item.quantity,
        coupon_id: appliedCoupon?.id,
        discount_amount: appliedCoupon ? (item.price * item.quantity * (appliedCoupon.discount_percentage / 100)) : 0
      }));

      // Insert transaction
      const { error: insertError } = await supabase
        .from('transactions')
        .insert(transactions);
        
      if (insertError) {
        toast.error('Checkout failed. Please try again.');
        console.error(insertError);
        return;
      } 
      
      // Mark each book as sold
      for (const item of cartItems) {
        const { error: updateError } = await supabase
          .from('books')
          .update({ sold: true })
          .eq('id', item.id);

        if (updateError) {
          console.error(`Failed to mark book as sold (ID: ${item.id})`, updateError);
          toast.error(`Failed to update status for ${item.title}`);
        }
      }

      toast.success('Checkout successful! Book(s) marked as sold.');
      clearCart();
      navigate('/success');

    } catch (err) {
      console.error('Unexpected error:', err);
      toast.error('An error occurred.');
    }
  };

  return (
    <div className="flex flex-col items-center bg-creamwhite min-h-screen mx-auto pt-20">
      <div className="p-4 w-3/5 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold text-coffeebrown mb-4">Checkout</h2>

        {/* Coupon Section */}
        <div className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter coupon code"
              className="w-full p-2 border rounded text-sm"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              disabled={appliedCoupon}
            />
            {appliedCoupon ? (
              <button
                onClick={removeCoupon}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={applyCoupon}
                className="bg-tealbrand text-white px-4 py-2 rounded text-sm"
              >
                Apply
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="text-green-600 text-sm mt-2">
              Coupon applied: {appliedCoupon.discount_percentage}% off
            </p>
          )}
        </div>

        <p className="text-left text-lg font-bold mt-4">
          <span className="text-gray-500 font-normal">Subtotal:</span> ₱{subtotal.toFixed(2)}
        </p>
        {discount > 0 && (
          <p className="text-left text-lg font-bold text-green-600">
            <span className="text-gray-500 font-normal">Discount:</span> -₱{(subtotal * (discount / 100)).toFixed(2)}
          </p>
        )}
        <p className="text-left text-lg font-bold">
          <span className="text-gray-500 font-normal">Total amount due:</span> ₱{total.toFixed(2)}
        </p>

        {/* Cash Input */}
        {selectedPayment === 'Cash' && (
          <>
            <div className="flex gap-4 mb-4">
              <div className="w-1/2">
                <label className="block mt-4 mb-1 text-[13px] text-green-700">Cash Received</label>
                <input
                  type="number"
                  className="w-full p-2 border rounded mt-2"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                />
              </div>

              <div className="w-1/2">
                {parseFloat(cashReceived) >= total && (
                  <>
                    <label className="block mt-4 mb-1 text-[13px] text-green-700 font-semibold">Change</label>
                    <p className="text-xl mt-2 text-green-700 font-semibold bg-green-50 p-2 rounded">
                      ₱{(cashReceived - total).toFixed(2) > 0 ? (cashReceived - total).toFixed(2) : 0}
                    </p>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        <label className="block mt-4 mb-1 text-[13px] text-gray-500">Payment Method</label>

        <div className="flex gap-4 mb-4">
          <button
            type="button"
            className={`px-4 py-2 rounded ${selectedPayment === 'Cash' ? 'bg-tealbrand text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setSelectedPayment('Cash')}
          >
            Cash
          </button>

          <button
            type="button"
            className={`px-4 py-2 rounded ${selectedPayment === 'GCash' ? 'bg-tealbrand text-white' : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setSelectedPayment('GCash')}
          >
            GCash
          </button>
        </div>

        <button
          onClick={handleCheckout}
          className="w-1/2 bg-tealbrand text-white py-3 rounded mt-6 text-lg"
        >
          Confirm Checkout
        </button>
      </div>
    </div>
  );
}
