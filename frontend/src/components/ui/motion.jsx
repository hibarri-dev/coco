import { useEffect, useRef, useState } from 'react';
import { motion, useInView, animate } from 'framer-motion';

export const EASE = [0.22, 1, 0.36, 1];

export function Reveal({ children, delay = 0, y = 24, className = '', as = 'div', once = true }) {
  const Comp = motion[as] ?? motion.div;
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '-80px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
    >
      {children}
    </Comp>
  );
}

export function Counter({ value, duration = 1.6, format = (n) => Math.round(n).toLocaleString('en-US'), className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: setDisplay,
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {format(display)}
    </span>
  );
}

/** Counts up once, then keeps ticking upward to feel live. */
export function LiveCounter({ start, tickMin = 3, tickMax = 18, interval = 1100, className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  const target = useRef(start);

  useEffect(() => {
    if (!inView) return;
    const intro = animate(0, start, { duration: 2.2, ease: EASE, onUpdate: (v) => setN(v) });
    let id;
    const startTicking = setTimeout(() => {
      id = setInterval(() => {
        target.current += Math.round(tickMin + Math.random() * (tickMax - tickMin));
        setN(target.current);
      }, interval);
    }, 2300);
    return () => {
      intro.stop();
      clearTimeout(startTicking);
      clearInterval(id);
    };
  }, [inView, start, interval, tickMin, tickMax]);

  return (
    <span ref={ref} className={`tabular ${className}`}>
      {Math.round(n).toLocaleString('en-US')}
    </span>
  );
}
