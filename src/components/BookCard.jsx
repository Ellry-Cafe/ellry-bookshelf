import { useCart } from '../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import BorrowerModal from './BorrowerModal';
import { supabase } from '../services/supabaseClient';

export default function BookCard({ book: initialBook, confirmBorrow }) {
  const { addToCart } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const [book, setBook] = useState(initialBook);

  const handleBuy = () => {
    addToCart({ ...book, type: 'buy' });
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

      // Create borrowed_books record
      const { error: borrowError } = await supabase
        .from('borrowed_books')
        .insert([
          {
            book_id: book.id,
            borrower_id: borrower.id,
            date_borrowed: new Date().toISOString(),
            due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
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
        .eq('id', book.id);

      if (updateError) {
        toast.error('Failed to update book availability.');
        return;
      }

      setBook(prev => ({ ...prev, borrowed: true }));
      setModalOpen(false);
      toast.success(`Book borrowed successfully by ${borrower.full_name}`);
    } catch (error) {
      toast.error('An error occurred while processing the request.');
      console.error('Borrow error:', error);
    }
  };

  return (
    <>
    <div key={book.id} className="bg-white rounded-lg shadow p-4 flex gap-4">
      
      <div>
        <img
          src={book.public_image_url}
          alt={book.title}
          className="w-20 h-28 object-cover rounded"
        />

      
        {/* Buy Button */}
        <button
          onClick={handleBuy}
          className={`px-2 py-1 rounded text-[10px] mt-3 ${
            book.sold || book.borrowed
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-black transition'
          }`}
          disabled={book.sold || book.borrowed}
        >
          {book.sold ? 'Sold Out' : 'Buy'}
        </button>

        {/* Borrow Button */}
        {!book.sold && (
          <button
            onClick={handleBorrowClick}
            className={`px-2 py-1 rounded text-[10px] ml-1 ${
              book.borrowed
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-tealbrand text-white hover:bg-orange-600 transition'
            }`}
            disabled={book.borrowed}
          >
            {book.borrowed ? 'Borrowed' : 'Borrow'}
          </button>
        )}
      </div>

      <div className="flex-1">
        <p className="font-semibold text-lg leading-5">{book.title}</p>
        <p className="text-sm text-gray-600 leading-5">{book.author}</p>
        <p className="text-tealbrand font-semibold mt-1 text-sm">₱{book.price}</p>
        <p className="text-[11px] text-gray-600 my-2">
          {book.published_date
            ? `Published: ${new Date(book.published_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`
            : 'Publish date unknown'}
        </p>

        {/* Genre Tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {book.genre?.split(',').map((tag, i) => (
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
  )
}
