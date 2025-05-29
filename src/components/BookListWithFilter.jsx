import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import BookCard from './BookCard';
import { FaEdit, FaTrash } from 'react-icons/fa' 
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'



export default function BookListWithFilter({ layout = 'grid' }) {
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedAuthor, setSelectedAuthor] = useState('');
    const [soldBook, setSoldBook] = useState('');
    // eslint-disable-next-line no-unused-vars
    const [borrowStatus, setBorrowStatus] = useState({});
    

    const navigate = useNavigate()
  
    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            // Fetch books
            const { data: booksData, error: booksError } = await supabase
                .from('books')
                .select('*')
                .order('title', { ascending: true });

            if (booksError) throw booksError;

            // Fetch active borrows
            const { data: borrowsData, error: borrowsError } = await supabase
                .from('borrowed_books')
                .select('book_id')
                .is('returned_at', null);

            if (borrowsError) throw borrowsError;

            // Create a map of borrowed book IDs
            const borrowedBooks = borrowsData.reduce((acc, borrow) => {
                acc[borrow.book_id] = true;
                return acc;
            }, {});

            // Map each book to attach its public image URL and borrow status
            const booksWithImageUrls = booksData.map(book => {
                let publicUrl = '';
              
                if (book.image_url?.startsWith('http')) {
                  // Already a full URL, use as is
                  publicUrl = book.image_url;
                } else if (book.image_url) {
                  // Needs conversion
                  const { data: imageData } = supabase
                    .storage
                    .from('book-covers')
                    .getPublicUrl(book.image_url);
              
                  publicUrl = imageData?.publicUrl || '';
                }
              
                return {
                  ...book,
                  public_image_url: publicUrl,
                  is_borrowed: borrowedBooks[book.id] || false
                };
            });
            
      
            setBooks(booksWithImageUrls);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load books');
        }
    };


    const handleEdit = (id) => {
        navigate(`/edit/${id}`);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm('Are you sure you want to delete this book?');
        if (!confirmed) return;

        const { error } = await supabase.from('books').delete().eq('id', id);
        if (!error) {
            setBooks(prev => prev.filter(book => book.id !== id));
            toast.success('Book deleted successfully!');
        } else {
            console.error('Delete failed:', error);
            toast.error('Failed to delete book');
        }
    };
  
    const genres = [...new Set(books.map(book => book.genre))].sort();
    const authors = [...new Set(books.map(book => book.author))].sort();
  
    const filteredBooks = books
    .filter(book =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedGenre === '' || book.genre === selectedGenre) &&
      (selectedAuthor === '' || book.author === selectedAuthor) &&
      (soldBook === '' || 
      (soldBook === 'sold' && book.sold === true) || 
      (soldBook === 'available' && book.sold === false))

    );

    const exportToCSV = (bookList) => {
  if (!bookList || bookList.length === 0) return;

  const headers = ['SKU', 'Title', 'Author', 'Genre', 'Price', 'Published', 'Status'];
  const rows = bookList.map(book =>
    [
      book.sku,
      book.title,
      book.author,
      book.genre,
      book.price,
      book.published_date,
      book.sold ? 'Sold' : book.is_borrowed ? 'Borrowed' : 'Available'
    ].join(',')
  );

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'books_inventory.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};





  
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 mt-2 justify-between">
          <input
            type="text"
            placeholder="Search by title..."
            className="p-2 border rounded w-full sm:w-1/3 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="p-2 border rounded w-full sm:w-1/4 text-xs"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
          >
            <option value="">All Genres</option>
            {genres.map((genre, i) => (
              <option key={i} value={genre}>{genre}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded w-full sm:w-1/4 text-xs"
            value={selectedAuthor}
            onChange={(e) => setSelectedAuthor(e.target.value)}
          >
            <option value="">All Authors</option>
            {authors.map((author, i) => (
              <option key={i} value={author}>{author}</option>
            ))}
          </select>
          <select
            className="p-2 border rounded w-full sm:w-1/4 text-xs"
            value={soldBook}
            onChange={(e) => setSoldBook(e.target.value)}
          >
            <option value="">All Books</option>
            <option value="available">Available</option>
            <option value="sold">Sold</option>
          </select>
          
          <button onClick={() => exportToCSV(filteredBooks)}
            className="text-white px-2 py-2 rounded flex text-xs bg-tealbrand">
              Export
          </button>
        </div>
  
        {layout === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredBooks.map(book => (
              <BookCard key={book.id} book={book}/>
            ))}
          </div>
        ) : (
        <div className="overflow-auto overflow-x-auto bg-white rounded shadow">
            <table className="min-w-full table-auto text-xs">
                <thead className="bg-gray-200 text-left">
                    <tr>
                        <th className="p-2">SKU</th>
                        <th className="p-2">Title</th>
                        <th className="p-2">Author</th>
                        <th className="p-2">Genre</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Published</th>
                        <th className="p-2">Status</th>
                        <th className="p-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredBooks.map(book => (
                    <tr key={book.id} className="border-t hover:bg-gray-100 transition-colors duration-200">
                        <td className="p-2 font-mono">{book.sku}</td>
                        <td className="p-2">{book.title}</td>
                        <td className="p-2">{book.author}</td>
                        <td className="p-2">{book.genre}</td>
                        <td className="p-2">₱{book.price}</td>
                        <td className="p-2">{book.quantity}</td>
                        <td className="p-2">
                            {book.published_date
                                ? new Date(book.published_date).toLocaleDateString()
                                : '—'}
                        </td>
                        <td className="p-2">
                          { book.sold ? 
                            <span className='font-semibold text-red-700'>Sold</span> 
                            : book.is_borrowed ? 
                            <span className='font-semibold text-orange-600'>Borrowed</span>
                            : <span className='text-green-700'>Available</span>
                          }
                        </td>
                        <td className="p-2 space-x-2 flex items-center">
                            <button
                                onClick={() => handleEdit(book.id)}
                                className="text-blue-600 hover:underline text-xs flex items-center space-x-1"
                            >
                                <FaEdit /> 
                            </button>
                            <button
                                onClick={() => handleDelete(book.id)}
                                className="text-red-500 hover:underline text-xs"
                            >
                                <FaTrash /> 
                            </button>
                        </td>
                    </tr>
                    ))}
                    {books.length === 0 && (
                    <tr>
                        <td colSpan="9" className="p-4 text-center text-gray-500">
                        No books found.
                        </td>
                    </tr>
                    )}
                </tbody>
            </table>
        </div>
        )}
      </div>
    );
}
  