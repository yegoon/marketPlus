import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
    document.body.classList.remove('menu-open');
  }, [location]);

  // Toggle mobile menu
  const toggleMenu = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (newState) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setIsOpen(false);
    document.body.classList.remove('menu-open');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          MarketPlus
        </Link>
        
        <div className="menu-icon" onClick={toggleMenu}>
          {isOpen ? <FaTimes /> : <FaBars />}
        </div>
        
        <ul className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <li className="nav-item">
            <Link to="/" className="nav-links" onClick={closeMobileMenu}>
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/market-data" className="nav-links" onClick={closeMobileMenu}>
              Market Data
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/insights" className="nav-links" onClick={closeMobileMenu}>
              Insights
            </Link>
          </li>
          {isAdmin && (
            <li className="nav-item">
              <Link to="/admin" className="nav-links" onClick={closeMobileMenu}>
                Admin
              </Link>
            </li>
          )}
          {user ? (
            <li className="nav-item">
              <button 
                onClick={() => {
                  signOut();
                  closeMobileMenu();
                }} 
                className="sign-out-btn"
              >
                Sign Out
              </button>
            </li>
          ) : (
            <li className="nav-item">
              <Link 
                to="/login" 
                className="sign-in-btn" 
                onClick={closeMobileMenu}
              >
                Sign In
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;