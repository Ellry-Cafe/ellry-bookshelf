import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import toast from 'react-hot-toast'

export default function EditBook() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [book, setBook] = useState(null)
  const [formData, setFormData] = useState()
  const [newImageFile, setImageFile] = useState(null);



  useEffect(() => {
    const fetchBook = async () => {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('id', id)
        .single();
  
      if (data) {
        // Check if image_url is already a full URL
        const isFullUrl = data.image_url?.startsWith('http');
  
        const imageUrl = isFullUrl
          ? data.image_url
          : supabase
              .storage
              .from('book-covers')
              .getPublicUrl(data.image_url).data.publicUrl;
  
        setFormData({
          ...data,
          image_path: data.image_url,
          image_url: imageUrl
        });
  
        setBook(data);
      }
  
      if (error) {
        console.error('Error fetching book:', error);
        toast.error('Failed to load book.');
      }
    };
  
    fetchBook();
  }, [id]);
  
  

  const handleChange = (e) => {
    const { name, value } = e.target
    setBook((prev) => ({ ...prev, [name]: value }))
  }

  

  // ✅ 2. Handle image replacement
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!book) {
      toast.error('Book data not loaded.')
      return
    }

    let uploadedImagePath = formData.image_path;
  
    // ✅ 1. Declare this early so it's accessible later
    const updatedBook = {
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: parseFloat(book.price),
      quantity: parseInt(book.quantity),
      published_date: book.published_date || null,
      status: book.status,
      image_url: uploadedImagePath // ✅ updated image (new or existing)
    }


    // ✅ 2. Handle image replacement
  if (newImageFile) {
    if (formData.image_path) {
      await supabase.storage.from('book-covers').remove([formData.image_path]);
    }

    const fileExt = newImageFile.name.split('.').pop();
    const newFileName = `${book.title.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('book-covers')
      .upload(newFileName, newImageFile);

    if (uploadError) {
      toast.error('Image upload failed.');
      setLoading(false);
      return;
    }

    updatedBook.image_url = newFileName;
  }


   // ✅ 3. Save update
   const { error } = await supabase.from('books').update(updatedBook).eq('id', id);

   if (error) {
     toast.error('Failed to update book.');
   } else {
     toast.success('Book updated!');
     setTimeout(() => navigate('/inventory'), 1000);
   }

   setLoading(false);
   };

   if (!book) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-500 text-sm">
        Loading book data...
      </div>
    )
  }


return (
    <div className="min-h-screen bg-creamwhite flex items-center justify-center font-poppins">
      <div className="w-full max-w-xl bg-white p-6 rounded shadow">
        <h1 className="text-lg font-bold text-coffeebrown pb-2">Edit Book</h1>

        {formData.image_url && (
          <img
            src={formData.image_url}
            alt="Book cover"
            className="w-32 h-auto mb-4"
          />
        )}      
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-500 mb-1">Update Cover</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="w-full p-2 border rounded text-xs"
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <InputField label="Title" name="title" value={book.title} onChange={handleChange} required />
          <InputField label="Author" name="author" value={book.author} onChange={handleChange} required />
          <InputField label="Genre" name="genre" value={book.genre} onChange={handleChange} />
          <InputField label="Price" name="price" value={book.price} onChange={handleChange} type="number" required />
          <InputField label="Quantity" name="quantity" value={book.quantity} onChange={handleChange} type="number" required />
          <InputField label="Published Date" name="published_date" value={book.published_date || ''} onChange={handleChange} type="date" />
          
          <select name="status" className="w-full p-2 border rounded" onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
          </select>

          <div className='flex gap-4 pt-4'>
            <button type="submit" disabled={loading} 
              className="w-full bg-tealbrand text-white py-2 rounded">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button"
              onClick={() => navigate('/inventory')}
              className="bg-red-500 text-white py-2 px-4 rounded ">
                Cancel
              </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ✅ Simple reusable input field component
function InputField({ label, name, value, onChange, type = 'text', required = false }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full p-2 border rounded"
      />
    </div>
  )
}
