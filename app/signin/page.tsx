"use client"

import AnimatedGradient from "@/components/AnimatedGradient"
import { AuthModal } from "@/components/auth/auth-modal"
import HeroSection from "@/components/shared/hero-section"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="relative min-h-screen flex items-center justify-center">

      <AnimatedGradient />
      <AuthModal isOpen={true} onClose={() => router.push("/")} />
    </div>
  )
}