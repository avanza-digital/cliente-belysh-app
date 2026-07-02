import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { T, serif, sans } from './theme';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

// Atrapa errores de render para no mostrar pantalla en blanco. Punto de enganche para Sentry.
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO(Sentry): cuando exista el DSN, reportar aquí →
    // Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
    console.error('[Belysh] Error no capturado:', error, info.componentStack);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <View style={{ flex: 1, backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontFamily: serif(600), fontSize: 26, color: T.ink, textAlign: 'center' }}>Algo salió mal</Text>
        <Text style={{ fontFamily: sans(600), fontSize: 14, color: T.muted, textAlign: 'center', marginTop: 10, lineHeight: 20 }}>
          Tuvimos un problema inesperado. Vuelve a intentarlo.
        </Text>
        <Pressable
          onPress={this.reset}
          accessibilityRole="button"
          accessibilityLabel="Reintentar"
          style={{ marginTop: 22, backgroundColor: T.rose, borderRadius: 999, paddingVertical: 13, paddingHorizontal: 30 }}
        >
          <Text style={{ fontFamily: sans(700), fontSize: 14, color: '#fff' }}>Reintentar</Text>
        </Pressable>
      </View>
    );
  }
}
