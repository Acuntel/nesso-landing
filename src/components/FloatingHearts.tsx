import { useMemo } from 'react';

const HEART_PATH = 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z';

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export default function FloatingHearts() {
  const hearts = useMemo(() => {
    const rand = seededRandom(123);
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: rand() * 100,
      size: 8 + rand() * 10,
      duration: 18 + rand() * 14,
      delay: rand() * 12,
      opacity: 0.04 + rand() * 0.06,
    }));
  }, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute"
          style={{
            left: `${heart.left}%`,
            bottom: '-20px',
            width: heart.size,
            height: heart.size,
            opacity: heart.opacity,
            animation: `float-up ${heart.duration}s linear ${heart.delay}s infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="hsl(350 40% 52%)"
            className="w-full h-full"
          >
            <path d={HEART_PATH} />
          </svg>
        </div>
      ))}
    </div>
  );
}
