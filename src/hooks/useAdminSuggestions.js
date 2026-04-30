import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAdminSuggestions() {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  const fetchSuggestions = async () => {
    setLoading(true);
    let query = supabase
      .from('waifu_suggestions')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    if (data) setSuggestions(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSuggestions();
  }, [filter]);

  const handleUpdateStatus = async (suggestion, newStatus) => {
    setLoading(true);

    if (newStatus === 'approved') {
      const { error: poolError } = await supabase.from('waifu_pool').insert([
        {
          jikan_id: suggestion.jikan_id,
          name: suggestion.waifu_name,
          image_url: suggestion.image_url,
          tier: suggestion.suggested_tier,
        },
      ]);

      if (poolError) {
        setLoading(false);
        return { error: 'Gagal memasukkan ke pool: ' + poolError.message };
      }

      await supabase.from('waifu_changelogs').insert([
        {
          action: 'ADD',
          waifu_name: suggestion.waifu_name,
          details: `Ditambahkan dari saran pemain (Tier: ${suggestion.suggested_tier})`,
        },
      ]);
    }

    const { error } = await supabase
      .from('waifu_suggestions')
      .update({ status: newStatus })
      .eq('id', suggestion.id);

    if (!error) {
      fetchSuggestions();
    }
    setLoading(false);
    return { error: error?.message };
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
