import HeroSection from "@/components/shared/hero-section";
import LandingPageContent from "@/components/shared/LandingPageContent";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <HeroSection />
      <LandingPageContent />
    </>
  );
}
