// src/hooks/useFetchData.js
import { useState, useEffect } from 'react';
import { supabase } from '/utils/supabaseClient';
import { fetchImageUrls } from '../utils/imageUtils';

export function useFetchData(table, select = '*', filter = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      let query = supabase
        .from(table)
        .select(select);

      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined) {
          query = query.eq(key, value);
        }
      });

      const { data: fetchedData, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      // Process data if needed
      let processedData = fetchedData || [];

      // Fetch images if the table has an images column
      if (processedData.some(item => item.images?.length > 0)) {
        processedData = await Promise.all(
          processedData.map(async item => {
            if (item.images?.length > 0) {
              const imageUrls = await fetchImageUrls(item.images);
              return { ...item, imageUrls };
            }
            return item;
          })
        );
      }

      setData(processedData);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        { 
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          setData((currentData) => {
            if (payload.eventType === 'DELETE') {
              return currentData.filter(item => item.id !== payload.old.id);
            } 
            if (payload.eventType === 'INSERT') {
              return [payload.new, ...currentData];
            } 
            if (payload.eventType === 'UPDATE') {
              return currentData.map(item => 
                item.id === payload.new.id ? payload.new : item
              );
            }
            return currentData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [table, select, JSON.stringify(filter)]);

  // Add refresh function
  const refresh = () => {
    setLoading(true);
    return fetchData();
  };

  return { data, loading, error, refresh };
}