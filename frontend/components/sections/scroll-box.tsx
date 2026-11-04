"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type ScrollBoxProps = {
  children: React.ReactNode;
  /** How many items fit before the rest is reached by scrolling. */
  visibleItems?: number;
  className?: string;
};

/**
 * A two-across grid that shows its first few items and scrolls up and down for
 * the rest.
 *
 * Cards differ in height from one screen to the next, so the box is not given a
 * fixed height: it measures where the last visible card ends and stops there.
 * With no more items than that, there is nothing to scroll and no limit is set.
 *
 * The scrollbar is left out altogether. What tells a client there is more is
 * the edge of the box: cards fade out where more lie beyond, and a small arrow
 * waits at the bottom until the end is reached.
 */
export function ScrollBox({ children, visibleItems = 4, className = "" }: ScrollBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [maxHeight, setMaxHeight] = useState<number | null>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);

  const updateEdges = useCallback(() => {
    const box = boxRef.current;
    if (!box) return;
    setAtTop(box.scrollTop <= 4);
    setAtBottom(box.scrollTop + box.clientHeight >= box.scrollHeight - 4);
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    function measure() {
      if (!grid) return;
      const items = Array.from(grid.children) as HTMLElement[];
      if (items.length <= visibleItems) {
        setMaxHeight(null);
      } else {
        const last = items[visibleItems - 1];
        setMaxHeight(last.offsetTop + last.offsetHeight);
      }
      updateEdges();
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    return () => observer.disconnect();
  }, [visibleItems, children, updateEdges]);

  const scrollable = maxHeight !== null;
  const fadeTop = scrollable && !atTop;
  const fadeBottom = scrollable && !atBottom;
  // A soft edge, so cards dissolve into the page rather than being cut off.
  const mask = `linear-gradient(to bottom, transparent 0, #000 ${fadeTop ? "36px" : "0"}, #000 calc(100% - ${fadeBottom ? "48px" : "0px"}), transparent 100%)`;

  return (
    <div className={`relative ${className}`}>
      <div
        ref={boxRef}
        onScroll={updateEdges}
        tabIndex={scrollable ? 0 : undefined}
        style={{
          ...(scrollable ? { maxHeight } : null),
          ...(scrollable ? { maskImage: mask, WebkitMaskImage: mask } : null)
        }}
        className="scroll-box snap-y snap-proximity overflow-y-auto scroll-smooth"
      >
        <div ref={gridRef} className="relative grid grid-cols-2 gap-3 sm:gap-4">
          {children}
        </div>
      </div>

      {fadeBottom ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-1 flex justify-center"
        >
          <span className="grid h-7 w-7 animate-bounce place-items-center rounded-full border border-brand-border bg-brand-card/90 text-brand-gold shadow-md backdrop-blur-sm">
            <ChevronDown className="h-4 w-4" />
          </span>
        </span>
      ) : null}
    </div>
  );
}
