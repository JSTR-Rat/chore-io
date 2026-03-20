import { useEffect, useRef } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { createUseGesture, dragAction, pinchAction } from '@use-gesture/react';

const useGesture = createUseGesture([dragAction, pinchAction]);

export const InteractiveViewport = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [style, api] = useSpring(() => ({
    x: 0,
    y: 0,
    scale: 1,
    config: {
      duration: 100,
    },
  }));

  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const getBounds = (scale?: number) => {
    if (!ref.current || !containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerW = containerRect.width;
    const containerH = containerRect.height;
    // When scale is provided (e.g. during pinch), use target scale for bounds.
    // Otherwise use current DOM rect (e.g. during drag).
    const subjectRect =
      scale != null ? null : ref.current.getBoundingClientRect();
    const subjectW = scale != null ? containerW * scale : subjectRect!.width;
    const subjectH = scale != null ? containerH * scale : subjectRect!.height;
    const overflowX = subjectW - containerW;
    const overflowY = subjectH - containerH;
    const minX = Math.min(0, -overflowX / 2);
    const minY = Math.min(0, -overflowY / 2);
    const maxX = Math.max(0, overflowX / 2);
    const maxY = Math.max(0, overflowY / 2);
    return { minX, minY, maxX, maxY };
  };

  const clampToBounds = (px: number, py: number, scale?: number) => {
    const b = getBounds(scale);
    if (!b) return [px, py];
    return [
      Math.min(b.maxX, Math.max(b.minX, px)),
      Math.min(b.maxY, Math.max(b.minY, py)),
    ];
  };

  useEffect(() => {
    const handler = (e: Event) => e.preventDefault();
    document.addEventListener('gesturestart', handler);
    document.addEventListener('gesturechange', handler);
    document.addEventListener('gestureend', handler);
    return () => {
      document.removeEventListener('gesturestart', handler);
      document.removeEventListener('gesturechange', handler);
      document.removeEventListener('gestureend', handler);
    };
  }, []);

  const bind = useGesture(
    {
      onDrag: ({ pinching, cancel, offset: [x, y] }) => {
        if (pinching) return cancel();
        api.start({ x, y });
      },
      onPinch: ({
        origin: [ox, oy],
        first,
        movement: [ms],
        offset: [s],
        memo,
      }) => {
        if (first) {
          const { width, height, x, y } = ref.current!.getBoundingClientRect();
          const tx = ox - (x + width / 2);
          const ty = oy - (y + height / 2);
          memo = [style.x.get(), style.y.get(), tx, ty];
        }

        const px = (memo as number[])[0] - (ms - 1) * (memo as number[])[2];
        const py = (memo as number[])[1] - (ms - 1) * (memo as number[])[3];
        const [clampedX, clampedY] = clampToBounds(px, py, s);
        api.start({ scale: s, x: clampedX, y: clampedY });
        return memo;
      },
    },
    {
      drag: {
        from: () => [style.x.get(), style.y.get()],
        bounds: () => {
          const b = getBounds();
          if (!b) return {};
          return { left: b.minX, top: b.minY, right: b.maxX, bottom: b.maxY };
        },
        rubberband: true,
      },
      pinch: {
        scaleBounds: { min: 1, max: 8 },
        rubberband: true,
        bounds: () => {
          const b = getBounds();
          if (!b) return {};
          return { left: b.minX, top: b.minY, right: b.maxX, bottom: b.maxY };
        },
      },
    },
  );

  return (
    <div
      ref={containerRef}
      className="relative flex aspect-square w-full touch-none items-center justify-center select-none"
    >
      <animated.div
        ref={ref}
        {...bind()}
        style={style}
        className="absolute h-full w-full touch-none"
      >
        {children}
      </animated.div>
    </div>
  );
};
