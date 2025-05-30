import { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import toast from 'react-hot-toast'

export default function AuthPage({ setUser }) {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('pincode', pin)
        .single()

      if (error || !data) {
        setError('Invalid pincode. Please try again.')
        return
      }

      localStorage.setItem('ellryUser', JSON.stringify(data))
      setUser(data)
      toast.success(`Welcome back, ${data.name}!`)
      
      // Redirect to home after successful login
      setTimeout(() => {
        window.location.href = '/home'
      }, 1000)
    } catch (error) {
      console.error('Error:', error)
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-creamwhite px-4">
      {/* Logo */}
      <img src="/logo.png" alt="Ellry Bookshelf" className="w-32 h-auto mb-4" />

      {/* Pincode Login */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm space-y-4 text-center"
      >
        <h1 className="text-xl font-bold text-coffeebrown">Enter Pincode</h1>
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          pattern="\d{6}"
          placeholder="6-digit pincode"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="w-full border p-2 rounded text-center tracking-widest"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-tealbrand text-white py-2 rounded hover:bg-opacity-90"
        >
          {loading ? 'Please wait...' : 'Login'}
        </button>
      </form>
    </div>
  )
}
