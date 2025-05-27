import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import AuthPage from './pages/Auth'
import { Toaster } from 'react-hot-toast'
// Pages
import Home from './pages/Home'
import Inventory from './pages/Inventory'
import AddBook from './pages/AddBook'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import BorrowerRegister from './pages/BorrowerRegister';
import CouponManagement from './pages/CouponManagement';
import TransactionHistory from './pages/TransactionHistory';

// Components
import EditBook from './components/EditBook'
import Books from './components/Books'
import { CartProvider } from './context/CartContext'
import ProtectedRoute from './components/ProtectedRoute'


function App() {
  const [user, setUsers] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('ellryUser')
    if (stored) {
      setUsers(JSON.parse(stored))
    }
  }, [])

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <AuthPage setUser={setUsers} />} />

        <Route path="/home" element={
          <ProtectedRoute>
            <Home>
              <Books />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/inventory" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Home>
              <Inventory />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/add" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Home>
              <AddBook />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/edit/:id" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Home>
              <EditBook />
            </Home>          
          </ProtectedRoute>
        } />

        <Route path="/checkout" element={
          <ProtectedRoute>
            <Home>
              <Checkout />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/success" element={
          <ProtectedRoute>
            <Home>
              <Success />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/cart" element={
          <ProtectedRoute>
            <Home>
              <CartProvider>
                <Books />
              </CartProvider>
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/borrowers" element={
          <ProtectedRoute>
            <Home>
              <BorrowerRegister />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/coupons" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Home>
              <CouponManagement />
            </Home>
          </ProtectedRoute>
        } />

        <Route path="/transactions" element={
          <ProtectedRoute>
            <Home>
              <TransactionHistory />
            </Home>
          </ProtectedRoute>
        } />

      </Routes>
    </>
  )
}

export default App
