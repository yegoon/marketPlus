import React, { useState, useEffect } from 'react';
import { supabase } from '/utils/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  FaPlus, 
  FaArrowRight, 
  FaChevronRight, 
  FaSyncAlt, 
  FaEye, 
  FaCommentAlt, 
  FaUser, 
  FaClock,
  FaChartLine,
  FaNewspaper,
  FaTimes,
  FaExternalLinkAlt
} from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const [featuredInsight, setFeaturedInsight] = useState(null);
  const [latestInsights, setLatestInsights] = useState([]);
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMarketDataPanelOpen, setIsMarketDataPanelOpen] = useState(false);
  const [selectedMarketData, setSelectedMarketData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch featured insight
      const { data: featuredData, error: featuredError } = await supabase
        .from('insights')
        .select('*')
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (featuredError) throw featuredError;

      // Fetch latest insights
      const { data: insightsData, error: insightsError } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);

      if (insightsError) throw insightsError;

      // Fetch latest market data
      const { data: marketDataResponse, error: marketDataError } = await supabase
        .from('market_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Fallback market data
      const marketDataFallback = {
        id: 'fallback',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data_quality: 'raw',
        metrics: {
          'Market Cap': '$1.2T',
          '24h Volume': '$45.6B',
          'BTC Dominance': '42.5%',
          'Active Markets': '45,678'
        },
        notes: 'This is sample market data. Real-time data will be displayed when available.',
        source: 'Market Data API'
      };

      setFeaturedInsight(featuredData || null);
      setLatestInsights(insightsData || []);
      setMarketData(marketDataResponse || marketDataFallback);
      setLastUpdated(new Date().toISOString());
      
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const refreshInterval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, []);

  const handleMarketDataClick = (marketDataItem) => {
    setSelectedMarketData(marketDataItem);
    setIsMarketDataPanelOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeMarketDataPanel = () => {
    setIsMarketDataPanelOpen(false);
    document.body.style.overflow = 'auto';
  };

  const handleInsightClick = (insightId) => {
    if (insightId) {
      navigate(`/insights/${insightId}`);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'N/A';
    }
  };

  const formatDateTime = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch {
      return 'N/A';
    }
  };

  if (loading && !featuredInsight) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          <FaSyncAlt className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Market Dashboard</h1>
          {lastUpdated && (
            <p className="last-updated">
              Last updated {formatDistanceToNow(new Date(lastUpdated))} ago
              <button onClick={fetchData} className="refresh-btn" title="Refresh data">
                <FaSyncAlt className="refresh-icon" />
              </button>
            </p>
          )}
        </div>
        <div className="dashboard-actions">
          <Link to="/insights/new" className="btn btn-primary">
            <FaPlus className="mr-1" /> New Insight
          </Link>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Featured Insight Card */}
        <div className="card featured-insight">
          <div className="card-header">
            <h2>Featured Insight</h2>
            <Link to="/insights" className="view-all">View All</Link>
          </div>
          <div className="card-body">
            {featuredInsight ? (
              <div 
                className="insight-content" 
                onClick={() => handleInsightClick(featuredInsight.id)}
              >
                <div className="insight-tags">
                  <span className="tag category">{featuredInsight.category || 'General'}</span>
                  <span className="tag featured">Featured</span>
                </div>
                <h3>{featuredInsight.title}</h3>
                <p className="insight-meta">
                  <span><FaUser className="meta-icon" /> {featuredInsight.author || 'Unknown'}</span>
                  <span><FaClock className="meta-icon" /> {formatDate(featuredInsight.created_at)}</span>
                </p>
                <div className="insight-summary">
                  {featuredInsight.content?.substring(0, 200)}...
                </div>
                <div className="card-footer">
                  <div className="btn btn-outline">
                    Read Full Insight <FaArrowRight className="ml-1" />
                  </div>
                  <div className="insight-stats">
                    <span><FaEye className="stat-icon" /> 1.2k</span>
                    <span><FaCommentAlt className="stat-icon" /> 24</span>
                  </div>
                </div>
                {featuredInsight.images?.[0] && (
                  <div className="insight-image">
                    <img 
                      src={featuredInsight.images[0]} 
                      alt={featuredInsight.title}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/800x400?text=No+Image';
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <FaNewspaper className="empty-icon" />
                <h3>No Featured Insights</h3>
                <p>Check back later for featured market insights</p>
                <Link to="/insights" className="btn btn-outline">
                  Browse All Insights
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Market Data Card */}
        <div className="card market-data">
          <div className="card-header">
            <h2>Market Snapshot</h2>
            <div>
              {marketData?.updated_at && (
                <span className="last-updated-sm">
                  Updated {formatDistanceToNow(new Date(marketData.updated_at))} ago
                </span>
              )}
              <button 
                onClick={() => handleMarketDataClick(marketData)} 
                className="btn btn-text"
              >
                View Details <FaChevronRight className="ml-1" />
              </button>
            </div>
          </div>
          <div className="card-body">
            {marketData ? (
              <div 
                className="market-data-content"
                onClick={() => handleMarketDataClick(marketData)}
              >
                <div className="market-data-header">
                  <h3>Latest Market Data</h3>
                  <span className={`data-tag ${marketData.data_quality === 'clean' ? 'clean' : 'raw'}`}>
                    {marketData.data_quality || 'raw'}
                  </span>
                </div>
                <div className="market-stats">
                  {marketData.metrics && Object.entries(marketData.metrics).map(([key, value], index) => (
                    <div key={key} className="stat-item">
                      <span className="stat-label">{key}</span>
                      <span className="stat-value">{value}</span>
                      <span className={`stat-change ${index % 2 === 0 ? 'positive' : 'negative'}`}>
                        {index % 2 === 0 ? '↑' : '↓'} {index % 2 === 0 ? '2.3%' : '1.1%'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="market-meta">
                  <span>
                    <FaSyncAlt className="meta-icon" /> 
                    <span>Click to view details</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <FaChartLine className="empty-icon" />
                <h3>No Market Data</h3>
                <p>Market data is currently unavailable</p>
                <button onClick={fetchData} className="btn btn-outline">
                  <FaSyncAlt className="mr-1" /> Retry
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Latest Insights */}
        <div className="card latest-insights">
          <div className="card-header">
            <h2>Latest Insights</h2>
            <Link to="/insights" className="view-all">View All</Link>
          </div>
          <div className="card-body">
            {latestInsights.length > 0 ? (
              <div className="insights-list">
                {latestInsights.map(insight => (
                  <div 
                    key={insight.id} 
                    className="insight-item"
                    onClick={() => handleInsightClick(insight.id)}
                  >
                    <div className="insight-details">
                      <div className="insight-tags">
                        <span className="tag">{insight.category || 'General'}</span>
                      </div>
                      <h3>{insight.title}</h3>
                      <p className="insight-meta">
                        <FaClock className="meta-icon" /> {formatDate(insight.created_at)}
                      </p>
                    </div>
                    {insight.images?.[0] && (
                      <div className="insight-thumbnail">
                        <img 
                          src={insight.images[0]} 
                          alt={insight.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100x70?text=No+Image';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <FaNewspaper className="empty-icon" />
                <h3>No Insights Yet</h3>
                <p>Be the first to share your market insights</p>
                <Link to="/insights/new" className="btn btn-outline">
                  Create First Insight
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Market Data Slide-out Panel */}
      <div 
        className={`slide-panel-overlay ${isMarketDataPanelOpen ? 'active' : ''}`}
        onClick={closeMarketDataPanel}
      >
        <div className="slide-panel" onClick={e => e.stopPropagation()}>
          {selectedMarketData && (
            <>
              <button className="close-panel" onClick={closeMarketDataPanel}>
                <FaTimes />
              </button>
              <div className="panel-content">
                <h2>Market Data Details</h2>
                <div className="panel-meta">
                  <span>Last Updated: {formatDateTime(selectedMarketData.updated_at)}</span>
                  <span className={`data-tag ${selectedMarketData.data_quality === 'clean' ? 'clean' : 'raw'}`}>
                    {selectedMarketData.data_quality || 'raw'}
                  </span>
                </div>
                
                <div className="market-details">
                  {selectedMarketData.metrics && Object.entries(selectedMarketData.metrics).map(([key, value], index) => (
                    <div key={key} className="detail-row">
                      <span className="detail-label">{key}</span>
                      <div className="detail-value-container">
                        <span className="detail-value">{value}</span>
                        <span className={`detail-change ${index % 2 === 0 ? 'positive' : 'negative'}`}>
                          {index % 2 === 0 ? '↑' : '↓'} {index % 2 === 0 ? '2.3%' : '1.1%'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedMarketData.notes && (
                  <div className="panel-section">
                    <h3>Notes</h3>
                    <p>{selectedMarketData.notes}</p>
                  </div>
                )}

                <div className="panel-section">
                  <h3>Source</h3>
                  <p>{selectedMarketData.source || 'Internal Data'}</p>
                </div>

                <div className="panel-actions">
                  <button 
                    className="btn btn-outline"
                    onClick={closeMarketDataPanel}
                  >
                    Close
                  </button>
                  <a 
                    href="/market-data" 
                    className="btn btn-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeMarketDataPanel();
                    }}
                  >
                    View Full Report <FaExternalLinkAlt className="ml-1" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;