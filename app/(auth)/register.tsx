import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { signUpWithEmail } from '@/lib/modules/auth/auth.service';
import { NotificationAdapter } from '@/lib/core/notifications/notification.adapter';

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Escribe email y contraseña.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Contraseña débil', 'Usa al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { session } = await signUpWithEmail(email.trim(), password);

      // dispara noti local SIEMPRE que el signUp fue OK (aunque session sea null por confirmación email)
      await NotificationAdapter.notifyWelcome();

      if (!session) {
        Alert.alert('Cuenta creada', 'Revisa tu correo para confirmar y luego inicia sesión.');
        router.replace('/(auth)/login');
        return;
      }

      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear cuenta</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña (mínimo 6)"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={onRegister} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creando...' : 'Crear cuenta'}</Text>
      </Pressable>

      <Text style={styles.footerText}>
        ¿Ya tienes cuenta? <Link href="/(auth)/login">Iniciar sesión</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
  button: { backgroundColor: '#111', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footerText: { marginTop: 10, color: '#444' },
});