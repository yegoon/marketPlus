import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setLoading(false);
      }
    },  