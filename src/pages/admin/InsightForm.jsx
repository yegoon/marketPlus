// src/components/admin/InsightForm.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';

const InsightForm = ({ insight, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'market'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (insight) {
      setFormData({
        title: insight.title || '',
        content: insight.content || '',
        author: insight.author || '',
        category: insight.category || 'market'
      });
    }
  }, [insight]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      if (insight) {
        // Update existing insight
        const { error: updateError } = await supabase
          .from('insights')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', insight.id);

        if (updateError) throw updateError;
      } else {
        // Create new insight
        const { error: insertError } = await supabase
          .from('insights')
          .insert([{
            ...formData,
            created_at: new Date().toISOString()
          }]);

        if (insertError) throw insertError;
      }

      onSuccess?.();
    } catch (err) {
      console.error('Error saving insight:', err);
      setError(err.message || 'Failed to save insight');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="insight-form">
      <h2>{insight ? 'Edit Insight' : 'Add New Insight'}</h2>
      
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Title</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Content</label>
        <textarea
          name="content"
          value={formData.content}
          onChange={handleChange}
          rows="6"
          required
        ></textarea>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="market">Market</option>
            <option value="analysis">Analysis</option>
            <option value="trend">Trend</option>
            <option value="news">News</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => onSuccess?.()}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Insight'}
        </button>
      </div>
    </form>
  );
};

export default InsightForm;