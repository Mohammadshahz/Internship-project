import React, {useId} from 'react';
import {theme} from '../config/theme';

/**
 * Directional motion blur. Pass the element's velocity in px/frame; the blur is
 * stretched along the direction of travel (an SVG feGaussianBlur with separate
 * x/y deviations), like a real shutter would record it.
 */
export const MotionBlur: React.FC<{
  vx?: number;
  vy?: number;
  /** extra uniform blur in px (focus pulls) */
  blur?: number;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}> = ({vx = 0, vy = 0, blur = 0, style, children, className}) => {
  const id = useId().replace(/:/g, '');
  const k = theme.motion.motionBlur;
  const sx = Math.min(80, Math.abs(vx) * k) + blur;
  const sy = Math.min(80, Math.abs(vy) * k) + blur;
  const active = sx > 0.25 || sy > 0.25;
  return (
    <>
      {active ? (
        <svg width={0} height={0} style={{position: 'absolute'}} aria-hidden>
          <filter id={`mb${id}`} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur stdDeviation={`${sx.toFixed(2)} ${sy.toFixed(2)}`} />
          </filter>
        </svg>
      ) : null}
      <div className={className} style={{...style, filter: active ? `url(#mb${id})${style?.filter ? ` ${style.filter}` : ''}` : style?.filter}}>
        {children}
      </div>
    </>
  );
};
