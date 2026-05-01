import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchSuggestions = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('waifu_suggestions')
        .select('*, profiles(username)')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setSuggestions(data);
    } catch (err) {
      console.error("Fetch suggestions error:", err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchSuggestions();
  }, [fetchSuggestions]);

  const handleUpdateStatus = async (suggestion, newStatus) => {
    try {
      setLoading(true);

      if (newStatus === 'approved') {
        // 1. Insert ke waifu_pool
        const { error: poolError } = await supabase.from('waifu_pool').insert([
          {
            jikan_id: suggestion.jikan_id,
            name: suggestion.waifu_name,
            image_url: suggestion.image_url,
            tier: suggestion.suggested_tier,
          },
        ]);

        if (poolError) throw new Error('Gagal memasukkan ke pool: ' + poolError.message);

        // 2. Insert ke waifu_changelogs
        await supabase.from('waifu_changelogs').insert([
          {
            action: 'ADD',
            waifu_name: suggestion.waifu_name,
            details: `Ditambahkan dari saran pemain (Tier: ${suggestion.suggested_tier})`,
          },
        ]);
      }

      // 3. Update status saran
      const { error: updateError } = await supabase
        .from('waifu_suggestions')
        .update({ status: newStatus })
        .eq('id', suggestion.id);

      if (updateError) throw updateError;

      await fetchSuggestions();
      return { error: null };
    } catch (err) {
      console.error("Update status error:", err);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    suggestions,
    loading,
    filter,
    setFilter,
    handleUpdateStatus,
    fetchSuggestions,
  };
}
