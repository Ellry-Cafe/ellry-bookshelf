import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from 'react-hot-toast';
import { RotateCcw, Trash2, Edit2, Save, X } from 'lucide-react';

export default function BorrowerRegister() {
  const [formData, setFormData] = useState({
    full_name: '',
    contact_number: '',
    id_card: null,
  });
  const [uploading, setUploading] = useState(false);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [registeredBorrowers, setRegisteredBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBorrower, setEditingBorrower] = useState(null);
  const [editContactNumber, setEditContactNumber] = useState('');

  useEffect(() => {
    fetchBorrowedBooks();
    fetchRegisteredBorrowers();
  }, []);

  const fetchRegisteredBorrowers = async () => {
    try {
      const { data, error } = await supabase
        .from('borrowers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRegisteredBorrowers(data);
    } catch (error) {
      console.error('Error fetching registered borrowers:', error);
      toast.error('Failed to load registered borrowers');
    }
  };

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
      fetchBorrowedBooks();
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
      fetchBorrowedBooks();
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
      
      // Refresh the borrowers list
      fetchRegisteredBorrowers();
    } catch (error) {
      console.error('Error:', error);
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

  const handleDeleteBorrower = async (id) => {
    if (!window.confirm('Are you sure you want to delete this borrower?')) return;
    
    try {
      const { error } = await supabase
        .from('borrowers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Borrower deleted successfully');
      fetchRegisteredBorrowers();
    } catch (error) {
      console.error('Error deleting borrower:', error);
      toast.error('Failed to delete borrower');
    }
  };

  const handleEditClick = (borrower) => {
    setEditingBorrower(borrower.id);
    setEditContactNumber(borrower.contact_number);
  };

  const handleCancelEdit = () => {
    setEditingBorrower(null);
    setEditContactNumber('');
  };

  const handleSaveEdit = async (borrowerId) => {
    try {
      const { error } = await supabase
        .from('borrowers')
        .update({ contact_number: editContactNumber })
        .eq('id', borrowerId);

      if (error) throw error;

      toast.success('Contact number updated successfully');
      setEditingBorrower(null);
      fetchRegisteredBorrowers();
    } catch (error) {
      console.error('Error updating contact number:', error);
      toast.error('Failed to update contact number');
    }
  };

  return (
    <div className="min-h-screen bg-creamwhite flex flex-col items-center justify-start p-6 font-poppins">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Registration Form */}
        <div className="bg-white p-6 rounded shadow">
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

        {/* Registered Borrowers Table */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-lg font-bold text-coffeebrown mb-4">Registered Borrowers</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left text-xs">Full Name</th>
                  <th className="px-4 py-2 text-left text-xs">Contact Number</th>
                  <th className="px-4 py-2 text-left text-xs">ID Card</th>
                  <th className="px-4 py-2 text-left text-xs">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registeredBorrowers.map((borrower) => (
                  <tr key={borrower.id} className="border-b">
                    <td className="px-4 py-2 text-xs">{borrower.full_name}</td>
                    <td className="px-4 py-2 text-xs">
                      {editingBorrower === borrower.id ? (
                        <input
                          type="text"
                          value={editContactNumber}
                          onChange={(e) => setEditContactNumber(e.target.value)}
                          className="border rounded px-2 py-1 text-xs w-full"
                        />
                      ) : (
                        borrower.contact_number
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      {borrower.id_card && (
                        <a
                          href={borrower.id_card}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View ID
                        </a>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <div className="flex gap-2">
                        {editingBorrower === borrower.id ? (
                          <>
                            <button
                              onClick={() => handleSaveEdit(borrower.id)}
                              className="text-green-500 hover:text-green-600 transition-colors"
                              title="Save Changes"
                            >
                              <Save size={16} />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-gray-500 hover:text-gray-600 transition-colors"
                              title="Cancel Edit"
                            >
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditClick(borrower)}
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                              title="Edit Contact Number"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteBorrower(borrower.id)}
                              className="text-red-500 hover:text-red-600 transition-colors"
                              title="Delete Borrower"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Borrowed Books Table */}
        <div className="bg-white p-6 rounded shadow md:col-span-2">
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
                        <div className="flex gap-2">
                          {!record.returned_at && (
                            <button
                              onClick={() => handleReturn(record.id)}
                              className="text-green-500 hover:text-green-600 transition-colors"
                              title="Return Book"
                            >
                              Return
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(record.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
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
