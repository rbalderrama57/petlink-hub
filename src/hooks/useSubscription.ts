import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const check = async () => {
      const { data } = await supabase
        .from('subscription_ledger')
        .select('id, status, expires_at')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle();

      if (data) {
        const notExpired = !data.expires_at || new Date(data.expires_at) > new Date();
        setIsPremium(notExpired);
      } else {
        setIsPremium(false);
      }
      setLoading(false);
    };

    check();
  }, [user]);

  return { isPremium, loading };
}
