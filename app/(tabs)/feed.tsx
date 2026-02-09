import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function FeedScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: '700' }}>Feed</Text>
      <Pressable onPress={() => router.push('/burger')}>
        <Text style={{ color: '#7C3AED', fontWeight: '700' }}>Ir a Burger</Text>
      </Pressable>
    </View>
  );
}