import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import {
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { db } from '../src/db/client';
import migrations from '../src/db/migrations/migrations';
import { colors } from '../src/theme/tokens';

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
  });
  const { success: migracoesOk, error: erroMigracao } = useMigrations(
    db,
    migrations,
  );

  // Por padrão o expo-updates só baixa a atualização no boot atual e a
  // aplica no boot SEGUINTE — dá a impressão de que o app "não atualiza"
  // porque é preciso reabrir duas vezes. Baixando e recarregando aqui, uma
  // reabertura já basta.
  useEffect(() => {
    if (!Updates.isEnabled) return;
    Updates.checkForUpdateAsync()
      .then((resultado) => {
        if (resultado.isAvailable) {
          return Updates.fetchUpdateAsync().then(() => Updates.reloadAsync());
        }
      })
      .catch(() => {
        // sem internet ou erro na checagem — segue com a versão já instalada
      });
  }, []);

  if (erroMigracao) {
    return (
      <View style={styles.centro}>
        <Text style={styles.mensagem}>
          Erro ao migrar o banco de dados: {erroMigracao.message}
        </Text>
      </View>
    );
  }

  if (!fontsLoaded && !fontError) {
    return <View style={styles.centro} />;
  }

  if (!migracoesOk) {
    return (
      <View style={styles.centro}>
        <Text style={styles.mensagem}>Preparando banco de dados…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bg,
    padding: 24,
  },
  mensagem: {
    fontSize: 15,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
