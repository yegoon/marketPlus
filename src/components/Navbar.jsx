// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaBars, FaTimes } from 'react-icons/fa';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className="navbar">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          MarketPlus
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
          <Link to="/market-data" className="hover:text-blue-600">Market Data</Link>
          <Link to="/insights" className="hover:text-blue-600">Insights</Link>
          {user?.isAdmin && (
            <Link to="/admin" className="hover:text-blue-600">Admin</Link>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-blue-600"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg py-2">
            <Link to="/dashboard" className="block px-4 py-2 hover:bg-gray-100">Dashboard</Link>
            <Link to="/market-data" className="block px-4 py-2 hover:bg-gray-100">Market Data</Link>
            <Link to="/insights" className="block px-4 py-2 hover:bg-gray-100">Insights</Link>
            {user?.isAdmin && (
              <Link to="/admin" className="block px-4 py-2 hover:bg-gray-100">Admin</Link>
            )}
            {user ? (
              <button
                onClick={signOut}
                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
              >
                Sign Out
              </button>
            ) : (
              <Link to="/login" className="block px-4 py-2 text-blue-600 hover:bg-gray-100">
                Sign In
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;