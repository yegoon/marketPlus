// src/components/admin/AdminSidebar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AdminSidebar = () => {
  const { signOut } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h3>Admin Panel</h3>
      </div>
      <nav className="sidebar-nav">
        <Link 
          to="/admin" 
          className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
        >
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link 
          to="/admin/insights" 
          className={`nav-item ${isActive('/admin/insights') ? 'active' : ''}`}
        >
          <span className="nav-icon">💡</span>
          <span>Insights</span>
        </Link>
        <Link 
          to="/admin/market-data" 
          className={`nav-item ${isActive('/admin/market-data') ? 'active' : ''}`}
        >
          <span className="nav-icon">📈</span>
          <span>Market Data</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <button onClick={signOut} className="sign-out-btn">
          <span className="nav-icon">🚪</span>
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;