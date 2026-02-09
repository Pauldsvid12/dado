import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/core/supabase/client.supabase';
import { NotificationAdapter } from './notification.adapter';

NotificationAdapter.setup();

export const usePushNotifications = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    const register = async () => {
      const token = await NotificationAdapter.registerForPushNotificationsAsync();
      if (!token) return;

      const { error } = await supabase
        .from('devices')
        .upsert(
          {
            user_id: userId,
            token,
            platform: Platform.OS,
            last_used_at: new Date().toISOString(),
          },
          { onConflict: 'token' }
        );

      if (error) console.log('Error guardando token en Supabase:', error.message);
    };

    register();
  }, [userId]);
};