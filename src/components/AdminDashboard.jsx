// src/components/AdminDashboard.jsx
import React from 'react';
import { useFetchData } from '../hooks/useFetchData';
import { Link } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  const { data: posts = [] } = useFetchData('posts');
  const { data: marketData = [] } = useFetchData('market_data');
  const { data: users = [] } = useFetchData('profiles');

  // Prepare data for charts
  const postCountByCategory = React.useMemo(() => {
    const categories = {};
    posts.forEach(post => {
      const category = post.category || 'Uncategorized';
      categories[category] = (categories[category] || 0) + 1;
    });
    return categories;
  }, [posts]);

  const chartData = {
    labels: Object.keys(postCountByCategory),
    datasets: [
      {
        label: 'Posts by Category',
        data: Object.values(postCountByCategory),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Total Posts</h3>
          <p className="text-3xl font-bold">{posts.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm font-medium">Market Data Entries</h3>
          <p className="text-3xl font-bold">{marketData.length}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Posts by Category</h3>
          {posts.length > 0 ? (
            <Bar 
              data={chartData} 
              options={{ 
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }} 
            />
          ) : (
            <p className="text-gray-500">No posts data available</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              to="/admin/panel"
              className="block p-3 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
            >
              Manage Content
            </Link>
            <Link
              to="/admin/market-data"
              className="block p-3 bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
            >
              Manage Market Data
            </Link>
            <Link
              to="/admin/insights"
              className="block p-3 bg-purple-50 text-purple-700 rounded hover:bg-purple-100 transition-colors"
            >
              View Insights
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {posts.slice(0, 5).map(post => (
            <div key={post.id} className="border-b pb-2">
              <p className="font-medium">{post.title}</p>
              <p className="text-sm text-gray-500">
                Created on {new Date(post.created_at).toLocaleDateString()}
              </p>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}