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
 * SpotlightCard interaction follows the official React Bits implementation:
 * https://github.com/DavidHDev/react-bits/blob/main/src/content/Components/SpotlightCard/SpotlightCard.jsx
 * The extra optional props are retained for compatibility with existing VECTRA cards.
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
    if (event.pointerType === 'touch' || !divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    divRef.current.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    divRef.current.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
    divRef.current.style.setProperty('--spotlight-color', spotlightColor);
  };

  const handlePointerEnter: React.PointerEventHandler<HTMLDivElement> = (event) => {
    if (event.pointerType === 'touch' || !divRef.current) return;
    divRef.current.style.setProperty('--spotlight-opacity', '1');
  };

  const handlePointerLeave: React.PointerEventHandler<HTMLDivElement> = () => {
    divRef.current?.style.setProperty('--spotlight-opacity', '0');
  };

  return (
    <div
      ref={divRef}
      className={`spotlight-card glass-panel glass-panel-hover ${className}`}
      style={{ '--spotlight-color': spotlightColor, '--spotlight-opacity': 0, ...style } as React.CSSProperties}
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
