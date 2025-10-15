import { useState, useEffect } from 'react';
import { supabase } from '/utils/supabaseClient';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MarketDataPage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState({
    files: true,
    data: false
  });

  // Fetch files on component mount
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        setLoading(prev => ({ ...prev, files: true }));
        const { data, error } = await supabase
          .from('market_data_files')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setFiles(data || []);
      } catch (error) {
        console.error('Error fetching files:', error);
        toast.error('Failed to load files');
      } finally {
        setLoading(prev => ({ ...prev, files: false }));
      }
    };

    fetchFiles();
  }, []);

  // Handle opening Google Sheets
  const openGoogleSheet = (url) => {
    if (!url) {
      toast.error('No Google Sheets URL found');
      return;
    }
    
    // Ensure the URL is properly formatted
    let sheetUrl = url.trim();
    if (!sheetUrl.startsWith('http')) {
      sheetUrl = 'https://' + sheetUrl;
    }
    
    // Open in a new tab
    window.open(sheetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Market Data Files</h1>
          <p className="mt-1 text-sm text-gray-500">View and access your market data files</p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Available Files</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading.files ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                      No files found.
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr 
                      key={file.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => openGoogleSheet(file.google_sheets_url)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline">
                            {file.filename}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          file.data_type === 'clean' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {file.data_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDataPage;