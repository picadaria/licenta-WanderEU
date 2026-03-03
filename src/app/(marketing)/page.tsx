"use client";

import HeroSection from "@/components/marketing/HeroSection";
import SocialProofBar from "@/components/marketing/SocialProofBar";
import HowItWorks from "@/components/marketing/HowItWorks";
import TripExample from "@/components/marketing/TripExample";
import FeaturesGrid from "@/components/marketing/FeaturesGrid";
import PricingSection from "@/components/marketing/PricingSection";
import CTASection from "@/components/marketing/CTASection";

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <SocialProofBar />
      <HowItWorks />
      <TripExample />
      <FeaturesGrid />
      <PricingSection />
      <CTASection />
    </>
  );
}
