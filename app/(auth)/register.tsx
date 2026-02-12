import React, { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sandwich } from 'lucide-react-native';
import { COLORS } from '@/lib/core/constants';
import { NotificationAdapter } from '@/lib/core/notifications/notification.adapter';
import { signUpWithEmail } from '@/lib/modules/auth/auth.service';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function RegisterScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: { email?: string; password?: string } = {};
    if (email && !email.includes('@')) e.email = 'Email inválido.';
    if (password && password.length < 6) e.password = 'Mínimo 6 caracteres.';
    return e;
  }, [email, password]);

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

      // Notificación local al registrarse
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

  const disableSubmit = loading || !!errors.email || !!errors.password;

  return (
    <LinearGradient
      colors={[COLORS.background, (COLORS as any).background2 ?? COLORS.diceBg]}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Sandwich size={80} color={COLORS.primary} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Regístrate para continuar</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="tu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="Mínimo 6 caracteres"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
        </View>

        <Button
          title="Crear cuenta"
          onPress={onRegister}
          loading={loading}
          disabled={disableSubmit}
        />

        <Button
          title="Iniciar sesión"
          variant="outline"
          onPress={() => router.push('/(auth)/login')}
          disabled={loading}
        />

        <Pressable onPress={() => router.replace('/')} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    width: '100%',
    gap: 12,
  },
  iconContainer: {
    padding: 24,
    borderRadius: 32,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    marginBottom: 12,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 6,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  form: {
    width: '100%',
    gap: 12,
    marginTop: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backButton: { marginTop: 2, paddingVertical: 10, paddingHorizontal: 14 },
  backText: { color: '#94A3B8', fontWeight: '600' },
});