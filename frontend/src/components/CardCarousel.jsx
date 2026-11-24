import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CardCarousel renders a horizontally-scrollable track.
 *
 * Props:
 *   children      – card elements
 *   label         – accessible label for the carousel region
 *   renderHeader  – optional render-prop that receives
 *                   { canScrollLeft, canScrollRight, scrollLeft, scrollRight }
 *                   and returns a React node rendered ABOVE the track.
 *                   When not provided, prev/next buttons appear above the track
 *                   only when there is overflow.
 */
export const CardCarousel = ({ children, label = 'elementos', renderHeader }) => {
  const trackRef = useRef(null);
  const [scrollState, setScrollState] = useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false
  });

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const { scrollLeft, scrollWidth, clientWidth } = track;
    const hasOverflow = scrollWidth > clientWidth + 2;
    setScrollState({
      hasOverflow,
      canScrollLeft: hasOverflow && scrollLeft > 2,
      canScrollRight: hasOverflow && scrollLeft + clientWidth < scrollWidth - 2
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;

    updateScrollState();

    const observer = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(updateScrollState)
      : null;
    observer?.observe(track);

    window.addEventListener('resize', updateScrollState);
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateScrollState);
    };
  }, [children, updateScrollState]);

  const scrollByDirection = (direction) => {
    const track = trackRef.current;
    if (!track) return;
    const step = Math.max(260, Math.round(track.clientWidth * 0.8));
    track.scrollBy({ left: direction * step, behavior: 'smooth' });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByDirection(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByDirection(-1);
    }
  };

  const scrollLeft = () => scrollByDirection(-1);
  const scrollRight = () => scrollByDirection(1);

  return (
    <div className="f1-carousel" aria-roledescription="carrusel" aria-label={label}>
      {renderHeader
        ? renderHeader({
            canScrollLeft: scrollState.canScrollLeft,
            canScrollRight: scrollState.canScrollRight,
            hasOverflow: scrollState.hasOverflow,
            scrollLeft,
            scrollRight
          })
        : scrollState.hasOverflow && (
            <div className="f1-carousel-controls">
              <button
                type="button"
                className="f1-carousel-btn"
                onClick={scrollLeft}
                disabled={!scrollState.canScrollLeft}
                aria-label={`Desplazar ${label} hacia la izquierda`}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button
                type="button"
                className="f1-carousel-btn"
                onClick={scrollRight}
                disabled={!scrollState.canScrollRight}
                aria-label={`Desplazar ${label} hacia la derecha`}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          )}

      <div
        ref={trackRef}
        className="f1-carousel-track"
        tabIndex={0}
        onScroll={updateScrollState}
        onKeyDown={handleKeyDown}
      >
        {children}
      </div>
    </div>
  );
};
