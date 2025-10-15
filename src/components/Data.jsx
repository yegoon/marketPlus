// src/components/Data.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '/utils/supabaseClient';
import './Data.css';

function DataDashboard() {
  const [marketData, setMarketData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First, get a single row to determine the columns
        const { data: sampleData, error: sampleError } = await supabase
          .from('market_data')
          .select('*')
          .limit(1)
          .single();

        if (sampleError && !sampleData) {
          // If no data, set empty state
          setMarketData([]);
          return;
        }

        // Then fetch all data
        const { data, error: fetchError } = await supabase
          .from('market_data')
          .select('*')
          .order('id', { ascending: false })  // Assuming there's an id column
          .limit(100);

        if (fetchError) throw fetchError;

        setMarketData(data || []);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError(`Failed to load market data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = marketData.filter(item => 
    item && Object.values(item).some(val => 
      String(val || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatValue = (key, value) => {
    if (value === null || value === undefined) return 'N/A';
    
    // Check if the key suggests it's a date field
    const isDateField = 
      ['date', 'time', 'created', 'updated', 'timestamp'].some(term => 
        key.toLowerCase().includes(term)
      );
    
    if (isDateField && value) {
      try {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
        }
      } catch (e) {
        console.error('Error formatting date:', e);
      }
    }
    
    // For JSON/objects, stringify them
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Loading market data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <p>{error}</p>
        <p className="mt-2">
          Please make sure your Supabase table is properly set up.
        </p>
      </div>
    );
  }

  return (
    <div className="data-dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Market Data Dashboard</h1>
          <p>View and analyze the latest market data</p>
        </div>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search data..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <svg className="search-icon" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>
      </header>

      <div className="data-table-container">
        {marketData.length === 0 ? (
          <div className="no-data">
            <p>No market data available</p>
            <p className="mt-2">
              Please add some data to your Supabase table.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  {marketData[0] && Object.keys(marketData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'even' : 'odd'}>
                    {Object.entries(row).map(([key, value]) => (
                      <td key={`${index}-${key}`}>
                        {formatValue(key, value)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DataDashboard;