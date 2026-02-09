import { View, Text, Pressable } from 'react-native';
import { useAuth } from '@/lib/modules/auth/AuthProvider';

export default function ProfileScreen() {
  const { session, signOut } = useAuth();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Perfil</Text>
      <Text>UID: {session?.user.id ?? '—'}</Text>

      <Pressable onPress={signOut} style={{ paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#111' }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
}