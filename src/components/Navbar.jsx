// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAdmin, signOut } = useAuth();
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };

  useEffect(() => {
    showButton();
    window.addEventListener('resize', showButton);
    return () => {
      window.removeEventListener('resize', showButton);
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
          MarketPlus
        </Link>
        
        <div className="menu-icon" onClick={handleClick}>
          <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
        </div>
        
        <ul className={click ? 'nav-menu active' : 'nav-menu'}>
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