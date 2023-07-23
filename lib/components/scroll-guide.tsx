"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { animated, useSpring } from "@react-spring/web";
import clsx from "clsx";

import { useClientOnly } from "@/lib/composables/client-only";

export interface ScrollGuideProps {
  selectors: string[];
  classes?: {
    base?: string;
    active?: string;
  };
  intersectOpts?: Omit<IntersectionObserverInit, "root"> & {
    // Workaround to make it a serializable prop for Next.js
    selector?: string;
  };
}

export interface ScrollGuideHintProps {
  target: Element;
  active?: Element;
  classes?: ScrollGuideProps["classes"];
}

export const BaseIntersectOpts = {
  // Create a virtual horizontal "line" in the center of the viewport
  rootMargin: "-50% 0% -50% 0%",
  threshold: 0,
};

export function useCurrentPosition(
  selectors: ScrollGuideProps["selectors"],
  opts: ScrollGuideProps["intersectOpts"]
) {
  const [targets, setTargets] = useState<Element[]>([]);
  const [current, setCurrent] = useState<IntersectionObserverEntry[]>([]);
  const [active, setActive] = useState<Element>();

  useEffect(() => {
    const intersectOpts = {
      ...BaseIntersectOpts,
      ...opts,
    };
    const root = document.querySelector(intersectOpts?.selector as string);
    const observed: Element[] = [];

    for (const s of selectors) {
      observed.push(...Array.from(document.querySelectorAll(s)));
    }

    setTargets(observed);

    const observer = new IntersectionObserver(
      (entries) => {
        if (!Array.isArray(entries)) {
          return;
        }

        const el = entries.find((e) => e.isIntersecting)?.target;

        if (el === active) {
          return;
        }

        setCurrent(entries);
        setActive(el);
      },
      { ...intersectOpts, root }
    );

    for (const el of observed) {
      observer.observe(el);
    }

    return () => {
      for (const el of observed) {
        observer.unobserve(el);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectors, opts]);

  return { targets, active, current };
}

/**
 * Requires the edge targets to reach center of the viewport, in order to
 * trigger intersecting
 */
export function ScrollGuide(props: ScrollGuideProps) {
  const { targets, active } = useCurrentPosition(
    props.selectors,
    props.intersectOpts
  );

  if (!useClientOnly()) {
    return null;
  }

  return createPortal(
    <div className="fixed flex flex-col top-1/2 left-0">
      {targets.map((el, i) => (
        <ScrollGuideHint key={i} target={el} active={active} {...props} />
      ))}
    </div>,
    document.body
  );
}

export function ScrollGuideHint(props: ScrollGuideHintProps) {
  const isActive = props.target === props.active;
  const renderProps = {
    className: clsx(
      "h-2",
      "w-5",
      "p-0.5",
      "m-1",
      props.classes?.base,
      isActive && props.classes?.active
    ),
    style: {
      transformOrigin: "0% 50%",
      ...useSpring({
        transform: isActive ? `scale(1.5)` : `scale(1)`,
      }),
    },
  };

  if (typeof props.target.id === "string") {
    // @TODO POC, the target w/ the ID is positioned to the top, and the action
    // does not match the desired center position of a target
    return <animated.a {...renderProps} href={"#" + props.target.id} />;
  } else {
    return <animated.div {...renderProps} />;
  }
}
