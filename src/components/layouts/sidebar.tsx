"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Users } from "lucide-react";
import { useState, useRef } from "react";
import { navItems } from "@/components/layouts/nav-config";
import Image from "next/image";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  const isExpanded = true; // Keep expanded all the time

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-white/[0.06] bg-zinc-950 text-white transition-all duration-300 ease-in-out z-30",
        "w-52",
        className
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-11 items-center border-b border-white/[0.06] px-3 overflow-hidden", isExpanded ? "justify-start gap-2" : "justify-center")}>
        <div className="w-6 h-6 rounded flex items-center justify-center shrink-0">
          <Image src="/logo.png" alt="Logo" width={24} height={24} className="w-full h-full object-cover" />
        </div>
        <span className={cn(
          "text-xs font-black tracking-widest text-white uppercase whitespace-nowrap transition-opacity duration-200",
          isExpanded ? "opacity-100" : "opacity-0 w-0 hidden"
        )}>
          Bhogal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-0.5 px-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-lg px-2.5 py-1.5 text-[12px] font-medium transition-colors whitespace-nowrap overflow-hidden",
                    isActive
                      ? "bg-orange-500/10 text-orange-500"
                      : "text-white/35 hover:text-white/60 hover:bg-white/[0.04]",
                    !isExpanded && "justify-center"
                  )}
                  title={!isExpanded ? item.title : undefined}
                >
                  <item.icon className={cn("h-4 w-4 flex-shrink-0", isExpanded ? "mr-2.5" : "", isActive ? "text-white/80" : "")} strokeWidth={1.5} />
                  <span className={cn(
                    "transition-opacity duration-200",
                    isExpanded ? "opacity-100" : "opacity-0 w-0"
                  )}>
                    {item.title}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-2.5">
        <div className={cn("flex items-center overflow-hidden", !isExpanded ? "justify-center" : "gap-2.5")}>
          <div className="h-6 w-6 rounded-full bg-white/[0.08] flex items-center justify-center flex-shrink-0">
            <Users className="h-3 w-3 text-white/40" strokeWidth={1.5} />
          </div>
          <div className={cn(
            "flex flex-col overflow-hidden transition-opacity duration-200",
            isExpanded ? "opacity-100" : "opacity-0 w-0"
          )}>
            <span className="truncate text-[11px] font-medium text-white/60">Owner</span>
            <span className="truncate text-[10px] text-white/25">owner@bhogal.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
