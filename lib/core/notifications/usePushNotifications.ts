import { useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/lib/core/supabase/client.supabase';
import { NotificationAdapter } from './notification.adapter';

export const usePushNotifications = (userId?: string) => {
  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    const run = async () => {
      try {
        // 1) Setup (canal Android + handler). Hazlo aquí o en app/_layout.tsx una sola vez.
        await NotificationAdapter.setup();

        if (cancelled) return;

        console.log('push: userId', userId);

        // 2) Token Expo
        const token = await NotificationAdapter.registerForPushNotificationsAsync();
        console.log('push: expoToken', token);

        if (cancelled) return;
        if (!token) return;

        // 3) Guardar en Supabase (devices)
        const { data, error } = await supabase
          .from('devices')
          .upsert(
            {
              user_id: userId,
              token,
              platform: Platform.OS,
              last_used_at: new Date().toISOString(),
            },
            { onConflict: 'token' }
          )
          .select(); // para ver qué devolvió realmente

        console.log('push: upsert result', { data, error });

        if (error) {
          console.log('Error guardando token en Supabase:', error.message);
        }
      } catch (e: any) {
        console.log('push: exception', e?.message ?? e);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [userId]);
};