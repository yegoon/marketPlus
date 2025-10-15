import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { supabase } from '/utils/supabaseClient';
import { fetchImageUrls } from '../utils/imageUtils';
import './BlogPost.css';

function BlogPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: post, error } = await supabase
          .from('posts')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!post) {
          throw new Error('Post not found');
        }

        // Fetch images for the post
        try {
          const imageUrls = await fetchImageUrls(id);
          setImages(Array.isArray(imageUrls) ? imageUrls : []);
        } catch (imgError) {
          console.error('Error fetching images:', imgError);
          setImages([]);
        }

        setPost({
          ...post,
          title: post.title || 'Untitled Post',
          body: post.body || '',
          category: post.category || 'uncategorized',
          created_at: post.created_at || new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error fetching post:', error);
        setError('Failed to load the post. It may have been removed or you may not have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="blog-post-container">
        <div className="loading">Loading post...</div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-post-container">
        <div className="error-message">
          {error || 'Post not found.'}
          <button 
            onClick={() => navigate('/blog')} 
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to all posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-post-container">
      <button 
        onClick={() => navigate(-1)} 
        className="back-button"
      >
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M10 19l-7-7m0 0l7-7m-7 7h18" 
          />
        </svg>
        Back to all posts
      </button>

      <article>
        <header className="blog-post-header">
          <span className="blog-post-category">{post.category}</span>
          <h1 className="blog-post-title">{post.title}</h1>
          <div className="blog-post-meta">
            <time dateTime={post.created_at}>
              {new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
            <span>•</span>
            <span>{Math.ceil(post.body?.length / 1000) || 5} min read</span>
          </div>
        </header>

        {images.length > 0 && (
          <img 
            src={images[0]} 
            alt={post.title} 
            className="blog-post-image"
            loading="eager"
          />
        )}

        <div 
          className="blog-post-content" 
          dangerouslySetInnerHTML={{ 
            __html: post.body || '<p>No content available.</p>' 
          }} 
        />
      </article>
    </div>
  );
}

export default BlogPost;