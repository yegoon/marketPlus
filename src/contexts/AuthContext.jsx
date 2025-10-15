// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '/utils/supabaseClient';

// Create context with a default value
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState(null);

  // Memoize the value object to prevent unnecessary re-renders
  const value = {
    user,
    isAdmin,
    loading,
    error,
    signIn: useCallback(async (email, password) => {
      try {
        setLoading(true);
        setError(null);
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw signInError;
        }

        return data;
      } catch (err) {
        console.error('Sign in error:', err);
        setError(err.message || 'Failed to sign in');
        throw err;
      } finally {
        setLoading(false);
      }
    }, []),

    signOut: useCallback(async () => {
      try {
        setLoading(true);
        setError(null);
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      } catch (err) {
        console.error('Sign out error:', err);
        setError(err.message || 'Failed to sign out');
        throw err;
      } finally {
        setLoading(false);
      }
    }, [])
  };

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        try {
          const currentUser = session?.user || null;
          setUser(currentUser);

          if (currentUser) {
            try {
              // Check if user is admin by email
              const adminStatus = currentUser.email === import.meta.env.VITE_ADMIN_EMAIL;
              setIsAdmin(adminStatus);
            } catch (err) {
              console.error('Error checking admin status:', err);
              setIsAdmin(false);
            }
          } else {
            setIsAdmin(false);
          }
        } catch (err) {
          console.error('Auth state change error:', err);
          setError(err.message || 'Authentication error');
        } finally {
          setLoading(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Show loading state while initializing
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};