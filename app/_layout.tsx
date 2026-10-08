import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { addDatabaseChangeListener } from 'expo-sqlite';
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
import { AtualizacaoBanner } from '../src/components/ui/AtualizacaoBanner';
import { colors } from '../src/theme/tokens';

// Tudo é local (SQLite), então qualquer escrita pode afetar qualquer tela.
// As abas ficam montadas em segundo plano, por isso o refetch é 'all': sem
// isso, telas fora de foco ficavam com dados velhos até reabrir o app.
const queryClient: QueryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries({ refetchType: 'all' });
    },
  }),
});

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

  const [atualizacaoPronta, setAtualizacaoPronta] = useState(false);

  // Por padrão o expo-updates só baixa a atualização no boot atual e a
  // aplica no boot SEGUINTE — dá a impressão de que o app "não atualiza".
  // Baixa aqui e avisa com um banner; reiniciar fica a cargo da pessoa, pra
  // não perder algo que ela já começou a digitar.
  useEffect(() => {
    if (!Updates.isEnabled) return;
    Updates.checkForUpdateAsync()
      .then((resultado) => {
        if (resultado.isAvailable) {
          return Updates.fetchUpdateAsync().then(() =>
            setAtualizacaoPronta(true),
          );
        }
      })
      .catch(() => {
        // sem internet ou erro na checagem — segue com a versão já instalada
      });
  }, []);

  // Escritas feitas fora de uma mutation (ex: pular ocorrência, resets) também
  // precisam atualizar as telas.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const assinatura = addDatabaseChangeListener(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        queryClient.invalidateQueries({ refetchType: 'all' });
      }, 50);
    });
    return () => {
      clearTimeout(timer);
      assinatura.remove();
    };
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
        {atualizacaoPronta && (
          <AtualizacaoBanner aoReiniciar={() => Updates.reloadAsync()} />
        )}
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
