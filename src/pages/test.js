import { useCart } from '../context/CartContext';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';


export default function BookCard({ book }) {
  const { addToCart } = useCart();
  const [borrowerName, setBorrowerName] = useState('');
  const [showBorrowInput, setShowBorrowInput] = useState(false);

  const handleBuy = () => {
    addToCart({ ...book, type: 'buy' });
    toast.success('Added to cart as purchase.');
  };

  const handleBorrowClick = () => {
    setShowBorrowInput(true);
  };

  const handleBorrowSubmit = async () => {
    if (!borrowerName.trim()) {
      toast.error('Please enter borrower name.');
      return;
    }

    const { data, error } = await supabase
      .from('borrowers')
      .select('*')
      .ilike('full_name', borrowerName.trim())
      .single();

    if (error || !data) {
      toast.error('Borrower not found or not registered.');
    } else {
      addToCart({
        ...book,
        type: 'borrow',
        borrower_name: data.full_name,
      });
      toast.success('Book added to cart for borrow!');
      setShowBorrowInput(false);
      setBorrowerName('');
    }
  };



  return (
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
            book.sold
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-black transition'
          }`}
          disabled={book.sold}
        >
          {book.sold ? 'Sold Out' : 'Buy'}
        </button>

        {/* Borrow Button */}
        {!book.sold && (
          <button
            onClick={handleBorrowClick}
            className="bg-tealbrand text-white px-2 py-1 rounded hover:bg-orange-600 transition text-[10px] ml-1"
          >
            Borrow
          </button>
        )}

        {/* Borrow Input */}
        {showBorrowInput && (
          <div className="mt-2 text-[10px]">
            <input
              type="text"
              value={borrowerName}
              onChange={(e) => setBorrowerName(e.target.value)}
              placeholder="Enter borrower name"
              className="border text-xs p-1 rounded w-full mb-1"
            />
            <button
              onClick={handleBorrowSubmit}
              className="bg-blue-600 text-white px-2 py-1 rounded w-full text-[10px]"
            >
              Confirm Borrow
            </button>
          </div>
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
    </div>
  )
}
