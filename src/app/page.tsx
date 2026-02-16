import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="space-y-6 text-center animate-in fade-in zoom-in duration-500">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            BHOGAL AUTO
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
            Elite Inventory Management for Modern Workshops.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="h-12 px-8 text-lg rounded-full">
              Enter Dashboard
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-8 text-xs text-muted-foreground">
        © 2026 Bhogal Auto Service. All rights reserved.
      </div>
    </div>
  );
}
