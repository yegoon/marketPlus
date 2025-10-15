// src/components/DataDashboard.jsx
import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { supabase } from '/utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

const DataDashboard = () => {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    value: '',
    images: []
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const { user } = useAuth();

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const { data: { user: userData } } = await supabase.auth.getUser();
        setIsAdmin(userData?.user_metadata?.role === 'admin');
      }
    };
    checkAdminStatus();
  }, [user]);

  // Fetch market data
  // Update the fetchMarketData function
  const fetchMarketData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('market_data')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) throw error;
      setMarketData(data || []);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError(err.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMarketData();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'value' ? parseFloat(value) || '' : value
    }));
  };

  // Handle image upload
  const handleImageUpload = async (e) => {
    if (!isAdmin) {
      setError('Only admins can upload images');
      return;
    }

    const files = Array.from(e.target.files);
    const newPreviews = [];
    const uploadedUrls = [];

    for (let file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `market_data_images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);
        uploadedUrls.push(publicUrl);
        newPreviews.push(URL.createObjectURL(file));
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...uploadedUrls]
    }));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      setError('Only admins can add market data');
      return;
    }
  
    try {
      setLoading(true);
      const { error } = await supabase
        .from('market_data')
        .insert([{ 
          category: formData.category,
          value: parseFloat(formData.value),
          images: formData.images || [], // Ensure it's an array
          user_id: user?.id,
          user_email: user?.email
        }]);
  
      if (error) throw error;
  
      // Reset form and refresh data
      setFormData({ category: '', value: '', images: [] });
      setImagePreviews([]);
      setError(null);
      setIsAdding(false);
      await fetchMarketData();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }; 

  if (loading && marketData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-600">Error: {error}</div>;
  }

  // Prepare chart data
  const chartData = {
    labels: marketData.map(item => item.category),
    datasets: [{
      label: 'Market Values',
      data: marketData.map(item => item.value),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Market Data</h2>
        {isAdmin && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isAdding ? 'Cancel' : 'Add New Entry'}
          </button>
        )}
      </div>

      {/* Add New Entry Form - Only show for admins */}
      {isAdmin && isAdding && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Add Market Data</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Value *
              </label>
              <input
                type="number"
                step="0.01"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-2 border rounded"
                disabled={!isAdmin}
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {imagePreviews.map((src, index) => (
                  <div key={index} className="relative">
                    <img
                      src={src}
                      alt={`Preview ${index}`}
                      className="h-16 w-16 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newPreviews = [...imagePreviews];
                        const newImages = [...formData.images];
                        newPreviews.splice(index, 1);
                        newImages.splice(index, 1);
                        setImagePreviews(newPreviews);
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setFormData({ category: '', value: '', images: [] });
                  setImagePreviews([]);
                  setError(null);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Market Data Overview</h3>
        <div className="h-64">
          <Bar 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Added By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {marketData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.value}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.user_email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataDashboard;
