import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const fetchProfile = async (userId, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile(data);
      } else if (retryCount < 5) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(
          () => fetchProfile(userId, retryCount + 1),
          1000,
        );
      } else {
        const fallbackProfile = {
          id: userId,
          username: 'Player_' + userId.substring(0, 5),
          coins: 0,
          dice_count: 10,
        };
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([fallbackProfile]);
        if (!insertError) setProfile(fallbackProfile);
      }
    } catch (err) {
      console.error('Fetch profile error:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, fetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
