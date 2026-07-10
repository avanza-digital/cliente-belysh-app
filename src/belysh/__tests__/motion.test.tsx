import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { PageCarousel } from '../motion';

let mockReduceMotion = false;
const originalRequestAnimationFrame = global.requestAnimationFrame;
const originalCancelAnimationFrame = global.cancelAnimationFrame;

jest.mock('react-native-reanimated', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    __esModule: true,
    default: { View },
    cancelAnimation: jest.fn(),
    Easing: { bezier: () => (value: number) => value },
    runOnJS: (callback: (...args: unknown[]) => unknown) => callback,
    useAnimatedStyle: (factory: () => object) => factory(),
    useReducedMotion: () => mockReduceMotion,
    useSharedValue: (value: unknown) => ({ value }),
    withTiming: (value: unknown, _config: unknown, callback?: (finished: boolean) => void) => {
      callback?.(true);
      return value;
    },
  };
});

describe('PageCarousel', () => {
  beforeEach(() => { mockReduceMotion = false; });

  beforeAll(() => {
    global.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 1;
    }) as typeof requestAnimationFrame;
    global.cancelAnimationFrame = jest.fn();
  });

  afterAll(() => {
    global.requestAnimationFrame = originalRequestAnimationFrame;
    global.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('reemplaza la escena y notifica cuando termina la transición', async () => {
    const onTransitionEnd = jest.fn();
    const view = await render(
      <PageCarousel sceneKey="inicio" direction="forward" onTransitionEnd={onTransitionEnd}>
        <Text>Inicio</Text>
      </PageCarousel>,
    );

    await view.rerender(
      <PageCarousel sceneKey="promos" direction="forward" onTransitionEnd={onTransitionEnd}>
        <Text>Promociones</Text>
      </PageCarousel>,
    );

    expect(view.queryByText('Inicio')).toBeNull();
    expect(view.getByText('Promociones')).toBeTruthy();
    expect(onTransitionEnd).toHaveBeenCalledTimes(1);
  });

  it('actualiza una escena sin iniciar otra transición si la key no cambia', async () => {
    const onTransitionEnd = jest.fn();
    const view = await render(
      <PageCarousel sceneKey="reserva" direction="forward" onTransitionEnd={onTransitionEnd}>
        <Text>Paso inicial</Text>
      </PageCarousel>,
    );

    await view.rerender(
      <PageCarousel sceneKey="reserva" direction="forward" onTransitionEnd={onTransitionEnd}>
        <Text>Hora seleccionada</Text>
      </PageCarousel>,
    );

    expect(view.queryByText('Paso inicial')).toBeNull();
    expect(view.getByText('Hora seleccionada')).toBeTruthy();
    expect(onTransitionEnd).not.toHaveBeenCalled();
  });

  it('cambia inmediatamente cuando el sistema pide reducir movimiento', async () => {
    mockReduceMotion = true;
    const onTransitionEnd = jest.fn();
    const view = await render(
      <PageCarousel sceneKey="inicio" direction="forward" onTransitionEnd={onTransitionEnd}>
        <Text>Inicio</Text>
      </PageCarousel>,
    );

    await view.rerender(
      <PageCarousel sceneKey="perfil" direction="forward" onTransitionEnd={onTransitionEnd}>
        <Text>Perfil</Text>
      </PageCarousel>,
    );

    expect(view.queryByText('Inicio')).toBeNull();
    expect(view.getByText('Perfil')).toBeTruthy();
    expect(onTransitionEnd).toHaveBeenCalledTimes(1);
  });
});
