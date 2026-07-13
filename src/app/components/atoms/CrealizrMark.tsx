import type { SVGProps } from "react";
import { motion } from "framer-motion";

type CrealizrMarkProps = SVGProps<SVGSVGElement> & {
  /**
   * Number of the three underline bars (top to bottom) to reveal, 0-3.
   * Omit for the static logo mark (all bars shown, no animation).
   */
  activeBars?: number;
};

const BARS = [
  { rect: { x: 43.8, y: 58.38, width: 94.8, height: 0.09 }, polygon: "139.55 59.46 42.85 59.46 42.85 57.46 43.8 57.38 139.55 57.38 139.55 59.46", origin: "42.85px 58.4px" },
  { rect: { x: 57.46, y: 63.33, width: 68.52, height: 0.09 }, polygon: "126.66 64.42 56.78 64.42 56.78 62.42 57.46 62.33 126.66 62.33 126.66 64.42", origin: "56.78px 63.35px" },
  { rect: { x: 66.88, y: 68.28, width: 51.84, height: 0.09 }, polygon: "119.24 69.37 66.36 69.37 66.36 67.37 66.88 67.28 119.24 67.28 119.24 69.37", origin: "66.36px 68.3px" },
] as const;

export default function CrealizrMark({ activeBars, ...props }: CrealizrMarkProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="30 0 120 70"
      aria-label="Crealizr logo"
      role="img"
      {...props}
    >
      <g id="Layer_1-2">
        {BARS.map((bar, i) => (
          <motion.g
            key={i}
            fill="currentColor"
            style={{ transformOrigin: bar.origin }}
            initial={false}
            animate={{ scaleX: activeBars === undefined || i < activeBars ? 1 : 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <rect {...bar.rect} />
            <polygon points={bar.polygon} />
          </motion.g>
        ))}
        <g fill="currentColor">
          <path d="M130.33,33.81c-7.74,9.18-16.74,16.29-26.74,21.07h-60.7c-5-2.98-9.28-6.99-12.04-12.07,13.34,6.83,26.58,7.53,40.43,5.52,10.51-1.35,21.18-3.95,30.73-8.88,7.3-3.69,14.09-8.47,20.5-13.56,8.93-7.14,16.7-15.4,21.59-25.89.94,12.45-5.97,24.52-13.77,33.81Z"/>
          <path d="M148.66,26.11c-.11,9.98-3.29,20.11-9.11,28.77h-8.62c8.42-7.05,14.65-17.36,16.74-28.86l.99.09Z"/>
          <g fill="currentColor">
            <path d="M83.07,26.04s0,0,0,0c-.68-9.17-9.24-16.59-18.19-15.78-8.22.41-15.13,7.86-14.59,15.9,0,0,0,0,0,0,.68,9.17,9.24,16.59,18.19,15.78,8.22-.41,15.13-7.86,14.59-15.9ZM68.38,37.83c-5.31-.41-9.19-4.19-9.82-9.06-.15-1.17-1.58-2.35-2.42-2.48-1.6-.25-3.27-.21-4.8-.16.69-6.69,7.03-11.97,13.53-11.2,5.04.39,9.3,4.52,9.9,9.28.09.69-.97,2.72-.05,2.69,1.65-.05,5.12-.13,7.28-.81-.69,6.69-7.13,12.51-13.62,11.75Z"/>
            <path d="M68.75,15.67c3.63,4.28,4.57,10.67,2.34,15.82-.2.46-.43.96-.31,1.45.2.85,1.31,1.13,2.16.96,1.17-.23,2.2-.98,2.91-1.94s1.14-2.1,1.4-3.26c.6-2.69.32-5.57-.78-8.1l-7.72-4.92Z"/>
          </g>
        </g>
      </g>
    </svg>
  );
}
