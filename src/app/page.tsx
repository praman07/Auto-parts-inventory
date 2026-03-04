"use client";

import { Hero } from "@/components/marketing/Hero";
import { Footer } from "@/components/layouts/footer";
import { UserHeader } from "@/components/layouts/user-header";

import { UserSecurity } from "@/components/UserSecurity";

export default function LandingPage() {
  return (
    <UserSecurity>
      <div className="flex flex-col min-h-screen font-sans antialiased text-white relative">
        <UserHeader className="!bg-transparent bg-gradient-to-b from-white/[0.1] to-transparent !border-none !shadow-none" />
        <main className="flex-1">
          <Hero />
        </main>
        <Footer className="!bg-transparent bg-gradient-to-t from-white/[0.1] to-transparent !border-none shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.5)]" />
      </div>
    </UserSecurity>
  );
}
