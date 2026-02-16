"use client"

import React, { useState } from "react"
import { Maximize2, X, LucideIcon } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface DashboardSectionProps {
    title: string
    subtitle?: string
    icon: LucideIcon
    children: React.ReactNode
    details?: React.ReactNode
    className?: string
    gradient?: string
}

export function DashboardSection({
    title,
    subtitle,
    icon: Icon,
    children,
    details,
    className,
    gradient = "from-zinc-800/80 to-zinc-900/90",
}: DashboardSectionProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <section
            className={cn(
                "group relative rounded-2xl bg-gradient-to-br border border-white/[0.06] shadow-lg shadow-black/20 transition-all duration-300 hover:border-white/10",
                gradient,
                className
            )}
        >
            <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                            <Icon className="w-3.5 h-3.5 text-white/50" />
                        </div>
                        <div>
                            <h3 className="text-xs font-semibold text-white/70 leading-none">
                                {title}
                            </h3>
                            {subtitle && (
                                <p className="text-[10px] text-white/30 mt-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    {details && (
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <button className="p-1.5 rounded-lg bg-white/0 hover:bg-white/5 text-white/20 hover:text-white/60 transition-all">
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-zinc-950 border-white/10 p-0 overflow-hidden gap-0">
                                <DialogHeader className="px-6 py-4 border-b border-white/5 shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-xl bg-white/5">
                                            <Icon className="w-5 h-5 text-white/70" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-lg font-bold text-white">
                                                {title} - Full Report
                                            </DialogTitle>
                                            <p className="text-xs text-white/40">
                                                Comprehensive breakdown and historical data
                                            </p>
                                        </div>
                                    </div>
                                </DialogHeader>
                                <ScrollArea className="flex-1 p-6">
                                    <div className="space-y-6">
                                        {details}
                                    </div>
                                </ScrollArea>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="relative">
                    {children}
                </div>
            </div>
        </section>
    )
}
