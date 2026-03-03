"use client";

import { Hero } from "@/components/marketing/Hero";
import { Footer } from "@/components/layouts/footer";
import { UserHeader } from "@/components/layouts/user-header";

import { UserSecurity } from "@/components/UserSecurity";

export default function LandingPage() {
  return (
    <UserSecurity>
      <div className="flex flex-col min-h-screen bg-zinc-950 font-sans antialiased text-white">
        <UserHeader />
        <main className="flex-1 pt-16 md:pt-20">
          <Hero />
        </main>
        <Footer />
      </div>
    </UserSecurity>
  );
}
