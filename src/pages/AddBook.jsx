import { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'



export default function AddBook() {
  const [form, setForm] = useState({
    title: '',
    author: '',
    genre: '',
    price: '',
    quantity: '',
    status: 'available',
    is_premium: false,
    published_date: '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  console.log('Submitting...')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
  
    let imageUrl = ''
  
    // Upload cover image
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${form.title.replace(/\s+/g, '-')}-${Date.now()}.${fileExt}`
  
      const { data: uploaded, error: uploadError } = await supabase
        .storage
        .from('book-covers')
        .upload(fileName, imageFile, {
          contentType: imageFile.type,
        })
  
      if (uploadError) {
        toast.error('Upload failed:', uploadError.message)
        setError('Image upload failed.')
        setLoading(false)
        return
      }
  
      const { data: urlData } = supabase
        .storage
        .from('book-covers')
        .getPublicUrl(uploaded.path)
  
      imageUrl = urlData.publicUrl
    }
  
    // Insert book
    const { title, author, genre, price, quantity, status, is_premium } = form

    const { error: insertError } = await supabase.from('books').insert({
      title,
      author,
      genre,
      published_date: form.published_date,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      status,
      is_premium,
      image_url: imageUrl,
    })
  
    setLoading(false)
  
    if (insertError) {
        toast.error('Insert error:', insertError.message)
      setError('Failed to add book.')
      return
    }
  
    // Success
    toast.success('Book added successfully!')
    navigate('/inventory')

    

  
  }
  

  return (
    <div className="min-h-screen bg-creamwhite flex items-center justify-center  font-poppins" style={{marginTop: '-40px'}}>
        <div className="w-full max-w-xl bg-white p-6 rounded shadow">

          <h1 className="text-lg font-bold text-coffeebrown">Add New Book</h1>
            

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 bg-white text-xs">
                <input type="text" name="title" placeholder="Title" className="w-full p-2 border rounded" onChange={handleChange} required />
                
                <input type="text" name="author" placeholder="Author" className="w-full p-2 border rounded" onChange={handleChange} required />

                <input type="text" name="published_date" placeholder="First published date"
                  className="w-full p-2 border rounded"
                  onChange={handleChange}
                />
                
                <input type="text" name="genre" placeholder="Genre (comma-separated)" className="w-full p-2 border rounded" onChange={handleChange} />

                <div className="flex gap-4">
                    <input type="number" name="price" placeholder="Price" className="w-full p-2 border rounded" onChange={handleChange} />
                    
                    <input type="number" name="rental_price" placeholder="Rental Price" className="w-full p-2 border rounded" onChange={handleChange} />
                </div>

                <input type="number" name="quantity" placeholder="Quantity" className="w-full p-2 border rounded" onChange={handleChange} />

                <select name="status" className="w-full p-2 border rounded" onChange={handleChange}>
                    <option value="available">Available</option>
                    <option value="borrowed">Borrowed</option>
                </select>

                <label className="flex items-center gap-2">
                    <input type="checkbox" name="is_premium" onChange={handleChange} />
                    Premium Book
                </label>
                
                <div className='border px-2 py-2'>
                    <label className="flex items-center text-xs font-semibold pb-3">Upload book cover</label>
                    <input className='text-xs' type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                </div>

                {error && <p className="text-red-500">{error}</p>}
                <div className='flex gap-4 pt-4'>
                  <button type="submit" disabled={loading} className="w-full bg-tealbrand text-white py-2 rounded">
                      {loading ? 'Adding...' : 'Add Book'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/inventory')}
                    className="bg-red-500 text-white py-2 px-4 rounded "
                  >
                    Cancel
                  </button>
                </div>
                
            </form>
        </div>
    </div>

  )
}
