import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const ANDROID_CHANNEL_ID = 'default_v2';
const DEFAULT_SOUND = 'custom_sound.wav';

export const NotificationAdapter = {
  setup: async () => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: DEFAULT_SOUND, // solo nombre base
      });
    }
  },

  // Expo push token (para push remoto). Para notificación local NO lo necesitas.
  registerForPushNotificationsAsync: async (): Promise<string | null> => {
    if (!Device.isDevice) return null;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    const projectId =
      (Constants.expoConfig as any)?.extra?.eas?.projectId ??
      (Constants as any)?.easConfig?.projectId;

    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    return token ?? null;
  },

  notifyWelcome: async () => {
    const ok = await NotificationAdapter.ensurePermissions();
    if (!ok) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cuenta creada',
        body: 'Bienvenido/a 👋',
        sound: DEFAULT_SOUND,
      },
      trigger: NotificationAdapter.buildTimeTrigger(1),
    });
  },

  notifyOrderCreated: async (orderId?: string) => {
    const ok = await NotificationAdapter.ensurePermissions();
    if (!ok) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Pedido enviado',
        body: orderId
          ? `Tu pedido ${orderId} fue creado correctamente.`
          : 'Tu pedido fue creado correctamente.',
        sound: DEFAULT_SOUND,
      },
      trigger: NotificationAdapter.buildTimeTrigger(1),
    });
  },

  // Helpers
  ensurePermissions: async (): Promise<boolean> => {
    const p1 = await Notifications.getPermissionsAsync();
    if (p1.status === 'granted') return true;

    const p2 = await Notifications.requestPermissionsAsync();
    return p2.status === 'granted';
  },

  buildTimeTrigger: (seconds: number): Notifications.SchedulableNotificationTriggerInput => {
    return Platform.OS === 'android'
      ? {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
          channelId: ANDROID_CHANNEL_ID,
        }
      : {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds,
        };
  },
};