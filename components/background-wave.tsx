"use client";
import { motion } from "framer-motion";

export const BackgroundWave = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none">
      <motion.video
        src="/wave-loop.mp4"
        autoPlay
        muted
        loop
        controls={false}
        playsInline
        className="fixed grayscale object-cover bottom-0 z-[-1] hidden md:block pointer-events-none opacity-70 "

      />
      <div className="absolute inset-50 bg-brand/10 mix-blend-multiply" />
    </div>
  );
};
