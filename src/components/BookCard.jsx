import { useCart } from '../context/CartContext';
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import BorrowerModal from './BorrowerModal';
import { supabase } from '../services/supabaseClient';

export default function BookCard({ book: initialBook, confirmBorrow }) {
  const { addToCart } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [isBorrowed, setIsBorrowed] = useState(false);

  const checkBorrowStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('borrowed_books')
        .select('*')
        .eq('book_id', initialBook.id)
        .is('returned_at', null)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking borrow status:', error);
        return;
      }

      setIsBorrowed(!!data);
    } catch (error) {
      console.error('Error checking borrow status:', error);
    }
  }, [initialBook.id]);

  useEffect(() => {
    checkBorrowStatus();
  }, [checkBorrowStatus]);

  const handleBuy = () => {
    addToCart({ ...initialBook, type: 'buy' });
    toast.success('Added to cart as purchase.');
  };

  const handleBorrowClick = () => {
    setModalOpen(true);
  };

  const handleConfirmBorrow = async (contactNumber) => {
    try {
      // Check if borrower exists
      const { data: borrower, error: borrowerError } = await supabase
        .from('borrowers')
        .select('id, full_name')
        .eq('contact_number', contactNumber)
        .single();

      if (borrowerError || !borrower) {
        toast.error('Borrower not found. Please register first.');
        setModalOpen(false);
        return;
      }

      const now = new Date();
      const dueDate = new Date(now.getTime() + (3 * 60 * 60 * 1000)); // 3 hours from now

      // Create borrowed_books record
      const { error: borrowError } = await supabase
        .from('borrowed_books')
        .insert([
          {
            book_id: initialBook.id,
            borrower_id: borrower.id,
            date_borrowed: now.toISOString(),
            due_date: dueDate.toISOString()
          }
        ]);

      if (borrowError) {
        toast.error('Failed to record the borrow transaction.');
        return;
      }

      // Update book availability
      const { error: updateError } = await supabase
        .from('books')
        .update({ available: false })
        .eq('id', initialBook.id);

      if (updateError) {
        toast.error('Failed to update book availability.');
        return;
      }

      setIsBorrowed(true);
      setModalOpen(false);
      toast.success(`Book borrowed successfully by ${borrower.full_name}`);
    } catch (error) {
      toast.error('An error occurred while processing the request.');
      console.error('Borrow error:', error);
    }
  };

  return (
    <>
    <div key={initialBook.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
      <div>
        <img
          src={initialBook.public_image_url}
          alt={initialBook.title}
          className="w-20 h-28 object-cover rounded"
        />

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          className={`px-2 py-1 rounded text-[10px] mt-3 ${
            initialBook.sold || isBorrowed
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-black transition'
          }`}
          disabled={initialBook.sold || isBorrowed}
        >
          {initialBook.sold ? 'Sold Out' : 'Buy'}
        </button>

        {/* Borrow Button */}
        {!initialBook.sold && (
          <button
            onClick={handleBorrowClick}
            className={`px-2 py-1 rounded text-[10px] ml-1 ${
              isBorrowed
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-tealbrand text-white hover:bg-orange-600 transition'
            }`}
            disabled={isBorrowed}
          >
            {isBorrowed ? 'Borrowed' : 'Borrow'}
          </button>
        )}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-lg leading-5">{initialBook.title}</p>
        <p className="text-sm text-gray-600 leading-5">{initialBook.author}</p>
        <p className="text-tealbrand font-semibold mt-1 text-sm">₱{initialBook.price}</p>
        <p className="text-[11px] text-gray-600 my-2">
          {initialBook.published_date
            ? `Published: ${new Date(initialBook.published_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`
            : 'Publish date unknown'}
        </p>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {initialBook.genre?.split(',').map((tag, i) => (
            <span
              key={i}
              className="text-[11px] bg-gray-200 text-gray-600 rounded-full px-1 py-0"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      </div>

      <div>
        <BorrowerModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleConfirmBorrow}
        />
      </div>
    </div>
    </>
  );
}
