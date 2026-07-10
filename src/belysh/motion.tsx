import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export type PageDirection = 'forward' | 'backward';

type Scene = {
  key: string;
  node: React.ReactNode;
};

/**
 * Transición de páginas tipo carrusel paginado.
 *
 * Conserva la escena anterior montada mientras ambas páginas recorren juntas
 * el ancho completo. Así el gesto visual es continuo: una sale exactamente al
 * mismo ritmo con el que la siguiente entra, sin fades ni doble exposición.
 */
export function PageCarousel({
  sceneKey,
  direction,
  children,
  onTransitionEnd,
}: {
  sceneKey: string;
  direction: PageDirection;
  children: React.ReactNode;
  onTransitionEnd?: () => void;
}) {
  const { width } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(1);
  const directionValue = useSharedValue(1);
  const current = useRef<Scene>({ key: sceneKey, node: children });
  const frame = useRef<number | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([{ key: sceneKey, node: children }]);

  const finish = useCallback((key: string) => {
    setScenes((items) => items.filter((scene) => scene.key === key));
    onTransitionEnd?.();
  }, [onTransitionEnd]);

  useLayoutEffect(() => {
    // La vista activa ya recibe `children` directamente. Solo conservamos aquí
    // su versión más reciente para usarla como saliente en la próxima navegación;
    // no hace falta provocar un segundo render en cada cambio de formulario.
    if (current.current.key === sceneKey) {
      current.current = { key: sceneKey, node: children };
      return;
    }

    const outgoing = current.current;
    const incoming = { key: sceneKey, node: children };
    current.current = incoming;

    if (frame.current !== null) cancelAnimationFrame(frame.current);
    cancelAnimation(progress);

    if (reduceMotion) {
      progress.value = 1;
      // La preferencia de accesibilidad exige que la sustitución sea inmediata.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScenes([incoming]);
      onTransitionEnd?.();
      return;
    }

    directionValue.value = direction === 'forward' ? 1 : -1;
    progress.value = 0;
    // Mantener la misma key conserva montada la pantalla saliente y, con ella,
    // su posición de scroll durante todo el recorrido.
    setScenes([{ ...outgoing }, incoming]);

    frame.current = requestAnimationFrame(() => {
      progress.value = withTiming(
        1,
        { duration: 340, easing: Easing.bezier(0.25, 0.82, 0.25, 1) },
        (finished) => {
          if (finished) runOnJS(finish)(sceneKey);
        },
      );
    });

  }, [children, direction, directionValue, finish, onTransitionEnd, progress, reduceMotion, sceneKey]);

  useEffect(() => () => {
    cancelAnimation(progress);
    if (frame.current !== null) cancelAnimationFrame(frame.current);
  }, [progress]);

  const incomingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: directionValue.value * width * (1 - progress.value) }],
  }));
  const outgoingStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -directionValue.value * width * progress.value }],
  }));

  return (
    <View style={styles.viewport}>
      {scenes.map((scene) => {
        const active = scene.key === sceneKey;
        return (
          <Animated.View
            key={scene.key}
            pointerEvents={active && scenes.length === 1 ? 'auto' : 'none'}
            accessibilityElementsHidden={!active}
            importantForAccessibility={active ? 'auto' : 'no-hide-descendants'}
            style={[styles.page, active ? incomingStyle : outgoingStyle]}
          >
            {active ? children : scene.node}
          </Animated.View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  page: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
});
