import { useEffect, useState } from 'react';

const useCountUp = (target = 0, duration = 1000) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let frameId;
    let start;
    const end = Number(target) || 0;

    const tick = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(Math.round(end * progress));
      if (progress < 1) frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  return value;
};

export default useCountUp;
