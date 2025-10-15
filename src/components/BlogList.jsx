import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '/utils/supabaseClient';
import { fetchImageUrls } from '../utils/imageUtils';
import './BlogList.css';

function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let query = supabase
          .from('posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data: posts = [], error } = await query;

        if (error) throw error;

        const postsWithImages = await Promise.all(
          posts.map(async (post) => {
            try {
              const imageUrls = post.id ? await fetchImageUrls(post.id) : [];
              return { 
                ...post, 
                title: post.title || 'Untitled Post',
                body: post.body || '',
                category: post.category || 'uncategorized',
                created_at: post.created_at || new Date().toISOString(),
                imageUrls: Array.isArray(imageUrls) ? imageUrls : []
              };
            } catch (err) {
              console.error(`Error processing post ${post.id}:`, err);
              return { 
                ...post, 
                title: post.title || 'Untitled Post',
                body: post.body || '',
                category: post.category || 'uncategorized',
                created_at: post.created_at || new Date().toISOString(),
                imageUrls: [] 
              };
            }
          })
        );

        setPosts(postsWithImages);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPosts();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="blog-list-container">
        <div className="loading-state">
          <div className="loading-text">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-list-container">
        <div className="error-state">
          <div className="error-text">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-list-container">
      <header className="blog-header">
        <h1 className="blog-title">Latest Blog Posts</h1>
        <p className="blog-subtitle">
          Fresh insights and updates on Kenya's market, power, and economy trends.
        </p>
      </header>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search blog posts"
        />
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <p className="empty-text">No blog posts found.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map((post) => (
            <article key={post.id} className="post-card">
              {post.imageUrls?.[0] && (
                <div className="post-image">
                  <img 
                    src={post.imageUrls[0]} 
                    alt={post.title} 
                    loading="lazy"
                  />
                </div>
              )}
              <div className="post-content">
                <h2 className="post-title">
                  <Link to={`/blog/${post.id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </h2>
                <p className="post-excerpt">
                  {post.body ? 
                    (post.body.length > 120 
                      ? `${post.body.substring(0, 120)}...` 
                      : post.body)
                    : 'No content available'
                  }
                </p>
                <div className="post-meta">
                  <span className="post-category">{post.category}</span>
                  <span className="post-date">{formatDate(post.created_at)}</span>
                </div>
                <Link 
                  to={`/blog/${post.id}`} 
                  className="read-more"
                >
                  Read more
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M14 5l7 7m0 0l-7 7m7-7H3" 
                    />
                  </svg>
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default BlogList;