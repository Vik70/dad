import { cn } from "@/lib/utils";

interface DiyaProps {
  className?: string;
  size?: number;
  animate?: boolean;
}

/**
 * A small SVG diya (oil lamp) with a glowing, gently flickering flame.
 * Used as the recurring light motif across the site.
 */
export default function Diya({ className, size = 48, animate = true }: DiyaProps) {
  return (
    <span
      className={cn("relative inline-block", className)}
      style={{ width: size, height: size * 1.1 }}
      aria-hidden
    >
      {/* glow */}
      <span
        className={cn(
          "absolute left-1/2 top-0 -translate-x-1/2 rounded-full blur-md",
          animate && "diya-glow",
        )}
        style={{
          width: size * 0.5,
          height: size * 0.6,
          background:
            "radial-gradient(circle, rgba(255,196,87,0.95) 0%, rgba(201,162,39,0.5) 45%, transparent 75%)",
        }}
      />
      <svg
        viewBox="0 0 64 70"
        width={size}
        height={size * 1.1}
        className="relative"
        fill="none"
      >
        {/* flame */}
        <g className={animate ? "diya-flame" : undefined} style={{ transformBox: "fill-box" }}>
          <path
            d="M32 6c4 6 7 9 7 15a7 7 0 0 1-14 0c0-5 3-8 7-15Z"
            fill="url(#flameGrad)"
          />
          <path
            d="M32 14c2 3 3.5 5 3.5 8a3.5 3.5 0 0 1-7 0c0-2.5 1.5-4.5 3.5-8Z"
            fill="#FFF4D6"
          />
        </g>
        {/* lamp body */}
        <path
          d="M6 44c0 0 6 14 26 14s26-14 26-14c0-2-3-3-8-3H14c-5 0-8 1-8 3Z"
          fill="url(#lampGrad)"
        />
        <ellipse cx="32" cy="41" rx="26" ry="5" fill="#8a2336" />
        <defs>
          <linearGradient id="flameGrad" x1="32" y1="6" x2="32" y2="28" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFD36B" />
            <stop offset="1" stopColor="#E8862A" />
          </linearGradient>
          <linearGradient id="lampGrad" x1="6" y1="41" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9b2c40" />
            <stop offset="1" stopColor="#6e1a2b" />
          </linearGradient>
        </defs>
      </svg>
    </span>
  );
}
