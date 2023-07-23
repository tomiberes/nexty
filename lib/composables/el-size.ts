import { MutableRefObject, useRef, useState, useEffect } from "react";

export interface SizeOptions {
  width: number;
  height: number;
}

export const SizeBase = {
  marginTop: 25,
  marginRight: 25,
  marginBottom: 25,
  marginLeft: 25,
};

export type Size = SizeOptions & typeof SizeBase;

export function combineElSize(opts: SizeOptions, base = SizeBase) {
  const size = {
    ...base,
    ...opts,
  };

  return {
    ...size,
    boundedHeight: Math.max(
      size.height - size.marginTop - size.marginBottom,
      0
    ),
    boundedWidth: Math.max(size.width - size.marginLeft - size.marginRight, 0),
  };
}

export function useElSize<T = Element>(
  opts: SizeOptions,
  base?: typeof SizeBase
): [MutableRefObject<T>, Size] {
  const ref = useRef<T>();
  const size = combineElSize(opts, base);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (size.width && size.height) {
      return;
    }

    const el = ref.current as Element;
    const observer = new ResizeObserver((entries) => {
      if (!Array.isArray(entries)) {
        return;
      }

      if (!entries.length) {
        return;
      }

      const entry = entries[0];

      if (width !== entry.contentRect.width) {
        setWidth(entry.contentRect.width);
      }

      if (height !== entry.contentRect.height) {
        setHeight(entry.contentRect.height);
      }
    });

    if (el != null) {
      observer.observe(el);
    }

    return () => {
      if (el != null) {
        observer.unobserve(el);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts, base]);
  const nextSize = combineElSize(
    {
      ...size,
      width: size.width || width,
      height: size.height || height,
    },
    base
  );

  return [ref as MutableRefObject<T>, nextSize];
}
