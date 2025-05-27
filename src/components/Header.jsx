import { useState } from 'react';
import { Link } from 'react-router-dom'
import { LogOut,  Menu, X  } from 'lucide-react'
import logo from '../assets/logo-white.png';


export default function Header({ books }) {
  const [menuOpen, setMenuOpen] = useState(false);


  const handleLogout = () => {
    localStorage.removeItem('ellryUser')
    window.location.href = '/'
  }

  
  return (
    <nav className="bg-orange-600 text-white" style={{ position: 'sticky', top: 0, zIndex: 10}}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src={logo} alt="Logo" className="w-auto h-10 object-contain" />
          </div>

          {/* Desktop Menu */}
          
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/home"
              className="text-white hover:text-coffeebrown px-3 py-2 flex text-xs"
            > Books
            </Link>
            <Link
              to="/borrowers"
              className="text-white hover:text-coffeebrown px-3 py-2 flex text-xs"
            >
              Borrowers
            </Link>
            <Link
              to="/inventory"
              className="text-white hover:text-coffeebrown px-3 py-2 flex text-xs"
            > Inventory
            </Link>
            <button
              onClick={handleLogout}
              className=" text-black px-4 py-2 rounded flex text-xs"
            ><LogOut size={14} className='mr-1 mt-1' />
              <span className='mt-1'>Logout</span>
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X className="w-8 h-8 mt-1" /> : <Menu className="w-10 h-10 mt-1" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="md:hidden flex flex-col gap-1 py-2">
            <Link
              to="/home"
              className="text-white px-3 py-2 flex text-xs"
            >
              Books
            </Link>
            <Link
              to="/borrowers"
              className="text-white px-3 py-2 flex text-xs"
            >
              Borrowers
            </Link>
            <Link
              to="/inventory"
              className="text-white px-3 py-2 flex text-xs"
            >
              Inventory
            </Link>
            <button
              onClick={handleLogout}
              className=" text-black px-2 py-2 rounded flex text-xs"
            ><LogOut size={14} className='mr-1 mt-1' />
              <span className='mt-1'>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

