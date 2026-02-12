import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sandwich } from 'lucide-react-native';
import { COLORS } from '@/lib/core/constants';
import { useAuth } from '@/lib/modules/auth/AuthProvider';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const errors = useMemo(() => {
    const e: { email?: string; password?: string } = {};
    if (email && !email.includes('@')) e.email = 'Email inválido.';
    if (password && password.length < 6) e.password = 'Mínimo 6 caracteres.';
    return e;
  }, [email, password]);

  const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Faltan datos', 'Escribe email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmail(email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'No se pudo iniciar sesión.');
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

        <Text style={styles.title}>Iniciar sesión</Text>
        <Text style={styles.subtitle}>Ingresa con tu correo y contraseña</Text>

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
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />
        </View>

        <Button
          title="Entrar"
          onPress={onLogin}
          loading={loading}
          disabled={disableSubmit}
        />

        <Button
          title="Crear cuenta"
          variant="outline"
          onPress={() => router.push('/(auth)/register')}
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