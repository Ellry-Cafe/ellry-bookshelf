import Header from '../components/Header'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import CartSidebar from '../components/CartSidebar';
import {ShoppingCart} from 'lucide-react'
import { useCart } from '../context/CartContext';

export default function Home({ children }) {
  const [books, setBooks] = useState([]);
  const { setIsCartOpen } = useCart();


  return (
    <div className="flex flex-col min-h-screen bg-creamwhite font-poppins">
      <div className='w-full max-w-[1366px] mx-auto'>
        <Header books={books} />
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-24 right-6  bg-tealbrand hover:bg-coffeebrown transition text-white rounded-full shadow-md w-14 h-14"
        ><ShoppingCart size={20} className='mr-auto ml-auto' />          
        </button>
        <CartSidebar />

        <main className="flex-1 p-4">{children}</main>
        
        <Link to="/add"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-coffeebrown text-white w-14 h-14 flex items-center justify-center text-3xl rounded-full shadow-lg hover:bg-tealbrand transition"> 
          +
        </Link>
        <Footer />
      </div>
    </div>
  )
}
