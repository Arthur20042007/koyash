import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import './WideStage.css';

const BASE_W = 1280;
const MAX_SCALE = 1.6;

/**
 * Renders a 1280px-wide design and scales it to fill the viewport width
 * (capped at MAX_SCALE), letting it scroll vertically. Keeps the results
 * page as wide as the quiz instead of leaving big white side margins.
 */
export default function WideStage({ children }) {
  const innerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [outerH, setOuterH] = useState(0);

  useLayoutEffect(() => {
    function recompute() {
      const s = Math.min(window.innerWidth / BASE_W, MAX_SCALE);
      setScale(s);
      if (innerRef.current) setOuterH(innerRef.current.offsetHeight * s);
    }
    recompute();
    window.addEventListener('resize', recompute);
    const ro = new ResizeObserver(recompute);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => {
      window.removeEventListener('resize', recompute);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="wideStageOuter" style={{ height: outerH || undefined }}>
      <div
        ref={innerRef}
        className="wideStageInner"
        style={{ width: BASE_W, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
