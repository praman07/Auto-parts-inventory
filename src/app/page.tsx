"use client";

import { Hero } from "@/components/marketing/Hero";
import { Footer } from "@/components/layouts/footer";
import { UserHeader } from "@/components/layouts/user-header";

import { UserSecurity } from "@/components/UserSecurity";

export default function LandingPage() {
  return (
    <UserSecurity>
      <div className="flex flex-col min-h-screen font-sans antialiased text-white relative bg-[#09090b]">
        <UserHeader className="!bg-transparent bg-gradient-to-b from-black/50 to-transparent !border-none !shadow-none backdrop-blur-sm" />
        <main className="flex-1">
          <Hero />
        </main>
        <Footer />
      </div>
    </UserSecurity>
  );
}
