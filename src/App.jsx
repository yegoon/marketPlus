// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';  // Added AuthProvider import
import PublicLayout from './layouts/PublicLayout';
import Dashboard from './components/Dashboard';
import InsightsDashboard from './components/InsightsDashboard';
import MarketDataPage from './components/MarketDataPage';
import BlogList from './components/BlogList';
import BlogPost from './components/BlogPost';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import  AdminDashboard  from './pages/admin/Dashboard';
import AdminMarketData from './pages/admin/MarketData';
import AdminInsights from './pages/admin/Insight';
import AdminBlog from './pages/admin/Blog';
import AdminData from './pages/admin/Data';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/insights" element={<InsightsDashboard />} />
          <Route path="/market-data" element={<MarketDataPage />} />
          <Route path="/blog" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="market-data" element={<AdminMarketData />} />
          <Route path="insights" element={<AdminInsights />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="data" element={<AdminData />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;



