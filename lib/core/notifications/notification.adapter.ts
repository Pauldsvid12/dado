import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

const ANDROID_CHANNEL_ID = 'default_v2'; // usa v2 para evitar el canal viejo sin sonido
const WELCOME_SOUND = 'custom_sound.wav'; // nombre base del archivo

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
        sound: WELCOME_SOUND,
      });
    }
  },

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
    // permisos (si el usuario dice "no", no hacemos nada)
    const p1 = await Notifications.getPermissionsAsync();
    if (p1.status !== 'granted') {
      const p2 = await Notifications.requestPermissionsAsync();
      if (p2.status !== 'granted') return;
    }

    // trigger con "type" (esto arregla tu ts(2322))
    const trigger: Notifications.SchedulableNotificationTriggerInput =
      Platform.OS === 'android'
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
            channelId: ANDROID_CHANNEL_ID,
          }
        : {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: 1,
          };

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Cuenta creada',
        body: 'Bienvenido/a 👋',
        sound: WELCOME_SOUND,
      },
      trigger,
    });
  },
};