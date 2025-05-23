import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';

export default function BorrowerRegister() {
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    id_card: null,
  });
  const [uploading, setUploading] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('borrowed_books')
        .select(`
          *,
          books:book_id(title),
          borrowers:borrower_id(full_name)
        `)
        .order('date_borrowed', { ascending: false });

      if (error) throw error;
      setBorrowedBooks(data);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      toast.error('Failed to load borrowed books.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('borrowed_books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Record deleted successfully');
      fetchBorrowedBooks(); // Refresh the table
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Failed to delete record');
    }
  };

  const handleReturn = async (id) => {
    try {
      const { error } = await supabase
        .from('borrowed_books')
        .update({ returned_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      // Update book availability
      const borrowedBook = borrowedBooks.find(book => book.id === id);
      if (borrowedBook) {
        await supabase
          .from('books')
          .update({ available: true })
          .eq('id', borrowedBook.book_id);
      }

      toast.success('Book marked as returned');
      fetchBorrowedBooks(); // Refresh the table
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error('Failed to update return status');
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'id_card') {
      setFormData({ ...formData, id_card: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUploading(true);

      let idCardUrl = null;

      // Upload the ID card to Supabase Storage
      if (formData.id_card) {
        const file = formData.id_card;
        const filePath = `id-cards/${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from('book-assets')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('book-assets')
          .getPublicUrl(filePath);

        idCardUrl = data.publicUrl;
      }

      // Insert to `borrowers` table
      const { error } = await supabase.from('borrowers').insert([
        {
          full_name: formData.full_name,
          contact_number: formData.contact_number,
          id_card: idCardUrl,
        },
      ]);

      if (error) throw error;

      toast.success('Borrower profile created!');
      setFormData({
        full_name: '',
        contact_number: '',
        id_card: null,
      });
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to register borrower.');
    } finally {
      setUploading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-creamwhite flex flex-col items-center justify-start p-6 font-poppins">
      <div className="w-full max-w-4xl">
        {/* Registration Form */}
        <div className="bg-white p-6 rounded shadow mb-8">
          <h1 className="text-lg font-bold text-coffeebrown mb-4">Register New Borrower</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded text-xs"
            />
            <input
              type="text"
              name="contact_number"
              placeholder="Contact Number"
              value={formData.contact_number}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded text-xs"
            />
            <input
              type="file"
              name="id_card"
              accept="image/*"
              onChange={handleChange}
              className="w-full border p-2 rounded text-xs"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 text-xs"
            >
              {uploading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        {/* Borrowed Books Table */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold text-coffeebrown mb-4">Borrowed Books</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 text-left text-xs">Book Name</th>
                    <th className="px-4 py-2 text-left text-xs">Borrower's Name</th>
                    <th className="px-4 py-2 text-left text-xs">Date Borrowed</th>
                    <th className="px-4 py-2 text-left text-xs">Due Date</th>
                    <th className="px-4 py-2 text-left text-xs">Return Status</th>
                    <th className="px-4 py-2 text-left text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {borrowedBooks.map((record) => (
                    <tr key={record.id} className="border-b">
                      <td className="px-4 py-2 text-xs">{record.books.title}</td>
                      <td className="px-4 py-2 text-xs">{record.borrowers.full_name}</td>
                      <td className="px-4 py-2 text-xs">
                        {formatDateTime(record.date_borrowed)}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {formatDateTime(record.due_date)}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {record.returned_at ? (
                          <span className="text-green-600">
                            Returned on {formatDateTime(record.returned_at)}
                          </span>
                        ) : (
                          <span className="text-orange-600">Not returned</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs">
                        {!record.returned_at && (
                          <button
                            onClick={() => handleReturn(record.id)}
                            className="bg-green-500 text-white px-2 py-1 rounded mr-2 hover:bg-green-600"
                          >
                            Return
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
