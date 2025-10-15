import React, { useState, useEffect } from "react";
import { supabase } from '../../utils/supabaseClient';
import './InsightsDashboard.css';

const InsightsDashboard = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInsight, setSelectedInsight] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('insights')
        .select('*')
        .order('created_at', { ascending: false });
  
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
  
      const formattedData = data.map(insight => ({
        ...insight,
        images: Array.isArray(insight.images) ? insight.images : [],
        title: insight.title || 'Untitled',
        content: insight.content || '',
        author: insight.author || 'Unknown',
        category: insight.category || 'General',
        is_featured: insight.is_featured || false,
        created_at: insight.created_at || new Date().toISOString()
      }));
  
      setInsights(formattedData);
    } catch (err) {
      console.error('Error in fetchInsights:', err);
      setError('Failed to load insights. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleReadMore = (insight) => {
    setSelectedInsight(insight);
    setIsPanelOpen(true);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when panel is open
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    document.body.style.overflow = 'auto'; // Re-enable scrolling
  };

  // Get the latest featured insight
  const featuredInsight = insights.length > 0 ? insights[0] : null;

  if (loading) return <div className="loading">Loading insights...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="insights-dashboard">
      <h2>Market Insights</h2>
      
      {/* Featured Insight Card */}
      {featuredInsight && (
        <div className="featured-insight-card">
          <div className="featured-content">
            <div className="featured-badge">Featured</div>
            <h3>{featuredInsight.title}</h3>
            <p className="meta">
              By {featuredInsight.author || 'Unknown'} • {featuredInsight.category || 'General'} • 
              {new Date(featuredInsight.created_at).toLocaleDateString()}
            </p>
            <p className="excerpt">
              {featuredInsight.content?.substring(0, 200)}...
            </p>
            <button 
              className="read-more-btn"
              onClick={() => handleReadMore(featuredInsight)}
            >
              Read Full Insight
            </button>
          </div>
          {featuredInsight.images?.[0] && (
            <div className="featured-image">
              <img 
                src={featuredInsight.images[0]} 
                alt={featuredInsight.title} 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600x400?text=No+Image';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* All Insights Grid */}
      <div className="insights-section">
        <h3>Latest Insights</h3>
        <div className="insights-grid">
          {insights.map((insight) => (
            <div key={insight.id} className="insight-card">
              {insight.images?.[0] && (
                <div className="card-image">
                  <img 
                    src={insight.images[0]} 
                    alt={insight.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                    }}
                  />
                </div>
              )}
              <div className="card-content">
                <h4>{insight.title}</h4>
                <p className="meta">
                  {insight.category} • {new Date(insight.created_at).toLocaleDateString()}
                </p>
                <p className="excerpt">
                  {insight.content?.substring(0, 100)}...
                </p>
                <button 
                  className="read-more-btn"
                  onClick={() => handleReadMore(insight)}
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Slide-in Panel */}
      <div className={`slide-panel-overlay ${isPanelOpen ? 'active' : ''}`} onClick={closePanel}>
        <div className="slide-panel" onClick={e => e.stopPropagation()}>
          {selectedInsight && (
            <>
              <button className="close-panel" onClick={closePanel}>
                &times;
              </button>
              <div className="panel-content">
                <h2>{selectedInsight.title}</h2>
                <div className="panel-meta">
                  <span>By {selectedInsight.author || 'Unknown'}</span>
                  <span>•</span>
                  <span>{selectedInsight.category || 'General'}</span>
                  <span>•</span>
                  <span>{new Date(selectedInsight.created_at).toLocaleDateString()}</span>
                </div>
                <div className="panel-body">
                  {selectedInsight.images?.map((image, index) => (
                    <img 
                      key={index} 
                      src={image} 
                      alt={`${selectedInsight.title} - ${index + 1}`}
                      className="panel-image"
                    />
                  ))}
                  <div className="insight-text">
                    {selectedInsight.content?.split('\n').map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InsightsDashboard;