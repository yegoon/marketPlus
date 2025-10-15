// src/hooks/useRealtime.js
import { useEffect } from 'react';
import { supabase } from '/utils/supabaseClient';

export function useRealtime(tableName, callback) {
  useEffect(() => {
    if (!tableName) return;

    const subscription = supabase
      .channel(`realtime_${tableName}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        (payload) => {
          callback?.(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tableName, callback]);
}