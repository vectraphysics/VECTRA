import React, { useRef } from 'react';
import './SpotlightCard.css';

export type SpotlightShape = 'circle' | 'beam';

export type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement> & {
  spotlightColor?: string;
  intensity?: number;
  spotlightSize?: number;
  softness?: number;
  shape?: SpotlightShape;
  borderGlow?: number;
  proximity?: number;
  smoothing?: number;
  ambient?: boolean;
  flare?: boolean;
  grain?: number;
  theme?: 'dark' | 'light';
};

/**
 * Pointer-driven spotlight and restrained 3D response.
 * Touch input and reduced-motion preferences keep the surface static.
 */
const SpotlightCard = ({
  children,
  className = '',
  style,
  spotlightColor = 'rgba(66, 96, 177, 0.24)',
  ...rest
}: SpotlightCardProps) => {
  const divRef = useRef<HTMLDivElement>(null);

  const handlePointerMove: React.PointerEventHandler<HTMLDivElement> = (event) => {
    const element = divRef.current;
    if (event.pointerType === 'touch' || !element) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const rect = element.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const tiltX = ((x / rect.width) - 0.5) * 3;
    const tiltY = ((y / rect.height) - 0.5) * -3;

    element.style.setProperty('--mouse-x', `${x}px`);
    element.style.setProperty('--mouse-y', `${y}px`);
    element.style.setProperty('--spotlight-color', spotlightColor);
    element.style.setProperty('--pointer-tilt-x', `${tiltX.toFixed(2)}deg`);
    element.style.setProperty('--pointer-tilt-y', `${tiltY.toFixed(2)}deg`);
  };

  const handlePointerEnter: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.pointerType === 'touch' || !divRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    divRef.current.style.setProperty('--spotlight-opacity', '1');
  };

  const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    const element = divRef.current;
    if (!element) return;
    element.style.setProperty('--spotlight-opacity', '0');
    element.style.setProperty('--pointer-tilt-x', '0deg');
    element.style.setProperty('--pointer-tilt-y', '0deg');
  };

  return (
    <div
      ref={divRef}
      className={`spotlight-card glass-panel glass-panel-hover ${className}`}
      style={{
        '--spotlight-color': spotlightColor,
        '--spotlight-opacity': 0,
        '--pointer-tilt-x': '0deg',
        '--pointer-tilt-y': '0deg',
        ...style,
      } as React.CSSProperties}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      {...rest}
    >
      <span className="spotlight-card__texture" aria-hidden="true" />
      <span className="spotlight-card__border" aria-hidden="true" />
      {children}
    </div>
  );
};

export default SpotlightCard;
