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
          <Home>
            <Books />
          </Home>
        } />

        <Route path="/inventory" element={
          <Home>
            <Inventory />
          </Home>
        } />

        <Route path="/add" element={
          <Home>
            <AddBook />
          </Home>
        } />

        <Route path="/edit/:id" element={
          <Home>
            <EditBook />
          </Home>          
          } />

        <Route path="/checkout" element={
          <Home>
            <Checkout />
          </Home>
        } />

        <Route path="/success" element={
          <Home>
            <Success />
          </Home>
        } />

        <Route path="*" element={<Navigate to="/" />} />

        <Route path="/cart" element={
          <Home>
            <CartProvider>
              <Books />
            </CartProvider>
          </Home>
        } />

        <Route path="/borrowers" element={
          <Home>
            <BorrowerRegister />
          </Home>
        } />

        <Route path="/coupons" element={
          <Home>
            <CouponManagement />
          </Home>
        } />

        <Route path="/transactions" element={
          <Home>
            <TransactionHistory />
          </Home>
        } />

      </Routes>
    </>
  )
}

export default App
