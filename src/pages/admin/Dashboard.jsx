// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { supabase } from '/utils/supabaseClient';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    insights: 0,
    marketData: 0,
    users: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch insights count
        const { count: insightsCount } = await supabase
          .from('market_insights')
          .select('*', { count: 'exact', head: true });
        
        // Fetch market data count
        const { count: marketDataCount } = await supabase
          .from('market_data')
          .select('*', { count: 'exact', head: true });
        
        // Fetch users count
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setStats({
          insights: insightsCount || 0,
          marketData: marketDataCount || 0,
          users: usersCount || 0
        });
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Dashboard Overview</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon insights">💡</div>
          <div className="stat-info">
            <h3>Total Insights</h3>
            <p className="stat-value">{stats.insights}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon data">📊</div>
          <div className="stat-info">
            <h3>Market Data Entries</h3>
            <p className="stat-value">{stats.marketData}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon users">👥</div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p className="stat-value">{stats.users}</p>
          </div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <p className="no-activity">No recent activity to display</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;