import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Sandwich, Layers, Box, LogOut } from 'lucide-react-native';
import { COLORS } from '@/lib/core/constants';
import { useAuth } from '@/lib/modules/auth/AuthProvider';
import { NotificationAdapter } from '@/lib/core/notifications/notification.adapter';

export default function HomeScreen() {
  const router = useRouter();
  const { session, loading, signOut } = useAuth();

  // Mientras carga la sesión
  if (loading) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Cargando...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Si NO hay sesión: pantalla simple de acceso
  if (!session) {
    return (
      <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Sandwich size={80} color={COLORS.primary} strokeWidth={1.5} />
          </View>

          <Text style={styles.title}>dado</Text>
          <Text style={styles.subtitle}>Inicia sesión o crea una cuenta para continuar</Text>

          <Pressable
            onPress={() => router.push('/(auth)/login')}
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push('/(auth)/register')}
            style={({ pressed }) => [styles.buttonOutline, pressed && styles.buttonPressed]}
          >
            <Text style={styles.buttonTextOutline}>Crear cuenta</Text>
          </Pressable>
        </View>
      </LinearGradient>
    );
  }

  // Si HAY sesión: home de pedidos (pero el botón principal abre Hamburguesa 3D)
  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={styles.container}>
      {/* ICONO CERRAR SESIÓN */}
      <Pressable
        onPress={() => {
          Alert.alert('Cerrar sesión', '¿Seguro que deseas salir?', [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Salir',
              style: 'destructive',
              onPress: async () => {
                await signOut();
                router.replace('/');
              },
            },
          ]);
        }}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
        hitSlop={10}
      >
        <LogOut size={22} color="#E2E8F0" />
      </Pressable>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Sandwich size={80} color={COLORS.primary} strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>Haz tu pedido</Text>
        <Text style={styles.subtitle}>Elige tu comida, confirma y recibe una notificación cuando se envíe.</Text>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Layers size={24} color={COLORS.secondary} />
            <Text style={styles.featureText}>Menú rápido</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.feature}>
            <Box size={24} color={COLORS.success} />
            <Text style={styles.featureText}>Pedido seguro</Text>
          </View>
        </View>

        {/* BOTÓN PRINCIPAL: abre la Hamburguesa 3D */}
        <Pressable
          onPress={() => router.push('/burger')}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.buttonText}>Ver hamburguesa</Text>
          </LinearGradient>
        </Pressable>

        {/* BOTÓN: ENVIAR PEDIDO (notificación local) */}
        <Pressable
          onPress={async () => {
            const orderId = `#${Math.floor(Math.random() * 10000)}`;
            Alert.alert('Pedido', 'Pedido enviado.');
            await NotificationAdapter.notifyOrderCreated(orderId);
          }}
          style={({ pressed }) => [styles.buttonOutline, pressed && styles.buttonPressed]}
        >
          <Text style={styles.buttonTextOutline}>Confirmar pedido</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  logoutButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },

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
    fontSize: 40,
    fontWeight: '800',
    color: '#FFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginVertical: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  feature: { alignItems: 'center', gap: 8 },
  divider: { width: 1, height: 30, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  featureText: { color: '#CBD5E1', fontSize: 13, fontWeight: '600' },

  button: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  buttonOutline: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buttonGradient: { paddingVertical: 20, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
  buttonTextOutline: { fontSize: 18, fontWeight: 'bold', color: '#FFF', letterSpacing: 0.5 },
});
