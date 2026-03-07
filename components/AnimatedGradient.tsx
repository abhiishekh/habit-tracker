"use client"
import { motion } from "framer-motion"

export default function AnimatedGradient() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute inset-0 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-3xl"
        style={{
          backgroundSize: "200% 200%"
        }}
      />
      
    </div>
  )
}