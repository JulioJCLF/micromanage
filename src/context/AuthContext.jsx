import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadTenant = async (userId) => {
    if (!userId) {
      setCurrentTenant(null);
      return;
    }
    // Fetch the first tenant this user belongs to
    const { data } = await supabase
      .from('tenant_users')
      .select('tenant_id, tenants(id, name)')
      .eq('user_id', userId)
      .limit(1)
      .single();
    
    if (data && data.tenants) {
      setCurrentTenant(data.tenants);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        loadTenant(currentUser.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        loadTenant(currentUser.id);
      } else {
        setCurrentTenant(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = async (attributes) => {
    const { data, error } = await supabase.auth.updateUser(attributes);
    if (error) throw error;
    return data;
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    if (error) throw error;
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, currentTenant, signIn, signOut, updateUser, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
