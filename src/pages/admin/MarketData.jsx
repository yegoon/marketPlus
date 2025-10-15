import { useState, useEffect } from 'react';
import { supabase } from '/utils/supabaseClient';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MarketData = () => {
  const [files, setFiles] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [newFile, setNewFile] = useState({
    title: '',
    data_type: 'clean',
    google_sheets_url: ''
  });
  const [loading, setLoading] = useState({
    files: true,
    saving: false
  });

  // Fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

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

  const handleAddFile = async (e) => {
  e.preventDefault();
  if (!newFile.title || !newFile.google_sheets_url) {
    toast.error('Please fill in all required fields');
    return;
  }

  try {
    setLoading(prev => ({ ...prev, saving: true }));
    
    // Create file record
    const { data, error } = await supabase
      .from('market_data_files')
      .insert([{
        filename: newFile.title,
        data_type: newFile.data_type,
        google_sheets_url: newFile.google_sheets_url,
        item_count: 0,  // Add default item_count
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    toast.success('File added successfully');
    setShowImportModal(false);
    setNewFile({ title: '', data_type: 'clean', google_sheets_url: '' });
    fetchFiles(); // Refresh the file list
  } catch (error) {
    console.error('Error adding file:', error);
    toast.error(`Failed to add file: ${error.message}`);
  } finally {
    setLoading(prev => ({ ...prev, saving: false }));
  }
};

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      setLoading(prev => ({ ...prev, files: true }));
      
      const { error } = await supabase
        .from('market_data_files')
        .delete()
        .eq('id', fileId);

      if (error) throw error;

      toast.success('File deleted successfully');
      fetchFiles(); // Refresh the file list
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Market Data</h1>
            <p className="mt-1 text-sm text-gray-500">Manage your market data files</p>
          </div>
          <button
            onClick={() => setShowImportModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add New File
          </button>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Market Data Files</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading.files ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                    </td>
                  </tr>
                ) : files.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No files found. Add a new file to get started.
                    </td>
                  </tr>
                ) : (
                  files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {file.filename}
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
                        <a 
                          href={file.google_sheets_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          Open in Google Sheets
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(file.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="text-red-600 hover:text-red-900"
                          disabled={loading.files}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add File Modal */}
      {showImportModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Add New File</h3>
                <form onSubmit={handleAddFile}>
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newFile.title}
                      onChange={(e) => setNewFile({...newFile, title: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="data_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Data Type
                    </label>
                    <select
                      id="data_type"
                      value={newFile.data_type}
                      onChange={(e) => setNewFile({...newFile, data_type: e.target.value})}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="clean">Clean Data</option>
                      <option value="raw">Raw Data</option>
                    </select>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="google_sheets_url" className="block text-sm font-medium text-gray-700 mb-1">
                      Google Sheets URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      id="google_sheets_url"
                      value={newFile.google_sheets_url}
                      onChange={(e) => setNewFile({...newFile, google_sheets_url: e.target.value})}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      required
                    />
                  </div>
                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                      disabled={loading.saving}
                    >
                      {loading.saving ? 'Saving...' : 'Add File'}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => {
                        setShowImportModal(false);
                        setNewFile({ title: '', data_type: 'clean', google_sheets_url: '' });
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketData;