import { useEffect, useState } from 'react';
import './Stage.css';

// Figma frame size — every anketa screen is designed at exactly this.
export const STAGE_W = 1280;
export const STAGE_H = 750;

/**
 * Renders children inside a fixed 1280×750 "stage" (matching the Figma frame)
 * and scales the whole stage to fit the viewport, preserving aspect ratio.
 * This lets us position everything in exact Figma pixels.
 */
export default function Stage({ children }) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function recompute() {
      const s = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
      setScale(s);
    }
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, []);

  return (
    <div className="stageViewport">
      <div
        className="stage"
        style={{
          width: STAGE_W,
          height: STAGE_H,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
