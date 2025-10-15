import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { supabase } from "/utils/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("blog");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Blog Post State
  const [post, setPost] = useState({
    title: "",
    body: "",
    category: "",
    images: []
  });

  // Market Data State
  const [marketData, setMarketData] = useState({
    category: "",
    value: "",
    images: []
  });

  // Insight State
  const [insight, setInsight] = useState({
    title: "",
    content: "",
    category: "market", // Default category
    images: []
  });

  const [imagePreviews, setImagePreviews] = useState({
    blog: [],
    market: [],
    insight: []
  });

  // Handle image upload
  // In your image upload handler
const handleImageUpload = async (e, type) => {
  const files = Array.from(e.target.files);
  const newPreviews = [];
  const uploadedPaths = []; // Store paths instead of URLs

  for (let file of files) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      continue;
    }

    // Store the path to save in the database
    uploadedPaths.push(fileName);
    newPreviews.push(URL.createObjectURL(file));
  }

  // Update the appropriate state
  if (type === 'blog') {
    setPost(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedPaths]
    }));
  } else if (type === 'insight') {
    setInsight(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedPaths]
    }));
  } else {
    setMarketData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...uploadedPaths]
    }));
  }

  // Update previews
  setImagePreviews(prev => ({
    ...prev,
    [type]: [...(prev[type] || []), ...newPreviews]
  }));
};

  // Handle form submission
  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (type === 'blog') {
        const { error } = await supabase
          .from('posts')
          .insert([{ 
            title: post.title,
            body: post.body,
            category: post.category,
            images: post.images || [],
            author_id: user.id,
            post_type: 'blog'
          }]);
  
        if (error) throw error;
        alert('Blog post created successfully!');
        setPost({ title: "", body: "", category: "", images: [] });
        setImagePreviews(prev => ({ ...prev, blog: [] }));
      } 
      else if (type === 'insight') {
        const { error } = await supabase
          .from('posts')
          .insert([{ 
            title: insight.title,
            body: insight.content,
            category: insight.category,
            images: insight.images || [],
            author_id: user.id,
            post_type: 'insight'
          }]);
  
        if (error) throw error;
        alert('Insight published successfully!');
        setInsight({ title: "", content: "", category: "market", images: [] });
        setImagePreviews(prev => ({ ...prev, insight: [] }));
      }
      else {
        // Handle market data submission
        const { error } = await supabase
          .from('market_data')
          .insert([{ 
            category: marketData.category,
            value: parseFloat(marketData.value),
            images: marketData.images || [],
            user_id: user.id,
            user_email: user.email
          }]);
  
        if (error) throw error;
        alert('Market data added successfully!');
        setMarketData({ category: "", value: "", images: [] });
        setImagePreviews(prev => ({ ...prev, market: [] }));
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Tab component
  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`py-2 px-4 font-medium ${
        activeTab === tab 
          ? 'border-b-2 border-blue-500 text-blue-600' 
          : 'text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6 space-x-1">
        <TabButton tab="blog" label="Blog Posts" />
        <TabButton tab="insight" label="Insights" />
        <TabButton tab="market" label="Market Data" />
      </div>

      {/* Blog Post Form */}
      {activeTab === 'blog' && (
        <form onSubmit={(e) => handleSubmit(e, 'blog')} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={post.title}
              onChange={(e) => setPost({...post, title: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={post.category}
              onChange={(e) => setPost({...post, category: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <ReactQuill
              value={post.body}
              onChange={(value) => setPost({...post, body: value})}
              className="h-64 mb-12"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e, 'blog')}
              className="w-full p-2 border rounded"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.blog.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Preview ${index}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = [...imagePreviews.blog];
                      const newImages = [...post.images];
                      newPreviews.splice(index, 1);
                      newImages.splice(index, 1);
                      setImagePreviews(prev => ({ ...prev, blog: newPreviews }));
                      setPost(prev => ({ ...prev, images: newImages }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400"
          >
            {loading ? 'Saving...' : 'Save Blog Post'}
          </button>
        </form>
      )}

      {/* Insight Form */}
      {activeTab === 'insight' && (
        <form onSubmit={(e) => handleSubmit(e, 'insight')} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={insight.title}
              onChange={(e) => setInsight({...insight, title: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={insight.category}
                onChange={(e) => setInsight({...insight, category: e.target.value})}
                className="w-full p-2 border rounded"
                required
              >
                <option value="market">Market Analysis</option>
                <option value="trend">Trending</option>
                <option value="forecast">Forecast</option>
                <option value="news">Industry News</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <ReactQuill
              value={insight.content}
              onChange={(value) => setInsight({...insight, content: value})}
              className="h-64 mb-12"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{'list': 'ordered'}, {'list': 'bullet'}],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Featured Images (Optional)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleImageUpload(e, 'insight')}
              className="w-full p-2 border rounded"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.insight.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Insight Preview ${index}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = [...imagePreviews.insight];
                      const newImages = [...insight.images];
                      newPreviews.splice(index, 1);
                      newImages.splice(index, 1);
                      setImagePreviews(prev => ({ ...prev, insight: newPreviews }));
                      setInsight(prev => ({ ...prev, images: newImages }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-purple-400"
          >
            {loading ? 'Publishing...' : 'Publish Insight'}
          </button>
        </form>
      )}

      {/* Market Data Form */}
      {activeTab === 'market' && (
        <form onSubmit={(e) => handleSubmit(e, 'market')} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <input
              type="text"
              value={marketData.category}
              onChange={(e) => setMarketData({...marketData, category: e.target.value})}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="number"
              step="0.01"
              value={marketData.value}
              onChange={(e) => setMarketData({...marketData, value: e.target.value})}
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
              onChange={(e) => handleImageUpload(e, 'market')}
              className="w-full p-2 border rounded"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {imagePreviews.market.map((src, index) => (
                <div key={index} className="relative">
                  <img
                    src={src}
                    alt={`Market Preview ${index}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newPreviews = [...imagePreviews.market];
                      const newImages = [...marketData.images];
                      newPreviews.splice(index, 1);
                      newImages.splice(index, 1);
                      setImagePreviews(prev => ({ ...prev, market: newPreviews }));
                      setMarketData(prev => ({ ...prev, images: newImages }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400"
          >
            {loading ? 'Saving...' : 'Save Market Data'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AdminPanel;
