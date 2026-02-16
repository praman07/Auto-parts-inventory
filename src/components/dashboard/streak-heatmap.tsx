"use client"

import { useMemo } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

type Props = {
    data: { date: string; count: number }[]
    year?: number
}

export function StreakHeatmap({ data, year = new Date().getFullYear() }: Props) {
    // Generate all days for the year
    const days = useMemo(() => {
        const days = []
        const startDate = new Date(year, 0, 1)
        const endDate = new Date(year, 11, 31)

        // Create a map for quick lookup
        const dataMap = new Map(data.map((d) => [d.date.split("T")[0], d.count]))

        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = d.toISOString().split("T")[0] // YYYY-MM-DD
            const count = dataMap.get(dateStr) || 0

            // Normalize count for color intensity (0-4)
            // 0 = no sales
            // 1 = 1-2 sales
            // 2 = 3-5 sales
            // 3 = 6-9 sales
            // 4 = 10+ sales
            let level = 0
            if (count > 0) level = 1
            if (count > 2) level = 2
            if (count > 5) level = 3
            if (count > 9) level = 4

            days.push({
                date: new Date(d),
                dateStr,
                count,
                level,
            })
        }
        return days
    }, [data, year])

    // Group by weeks for the grid
    const weeks = useMemo(() => {
        const weeks = []
        let currentWeek = []

        // Pad the beginning if the year doesn't start on Sunday
        const firstDay = days[0].date.getDay()
        for (let i = 0; i < firstDay; i++) {
            currentWeek.push(null)
        }

        for (const day of days) {
            currentWeek.push(day)
            if (currentWeek.length === 7) {
                weeks.push(currentWeek)
                currentWeek = []
            }
        }

        // Push remaining days
        if (currentWeek.length > 0) {
            weeks.push(currentWeek)
        }

        return weeks
    }, [days])

    const months = [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ]

    const monthLabels = useMemo(() => {
        const labels: { name: string; weekIndex: number }[] = []
        weeks.forEach((week, i) => {
            const firstDay = week.find((d) => d !== null)
            if (firstDay) {
                const monthName = months[firstDay.date.getMonth()]
                if (labels.length === 0 || labels[labels.length - 1].name !== monthName) {
                    labels.push({ name: monthName, weekIndex: i })
                }
            }
        })
        return labels
    }, [weeks])

    return (
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex flex-col gap-1 w-fit mx-auto lg:mx-0">
                {/* Month labels - Positioned based on week index */}
                <div className="relative h-4 mb-2" style={{ marginLeft: "36px" }}>
                    {monthLabels.map((m) => (
                        <div
                            key={m.name}
                            className="absolute text-[10px] text-white/40 font-medium"
                            style={{ left: `${m.weekIndex * 13}px` }}
                        >
                            {m.name}
                        </div>
                    ))}
                </div>

                <div className="flex gap-0 px-1">
                    {/* Day labels */}
                    <div className="flex flex-col justify-between text-[9px] text-white/30 pb-2 h-[88px] shrink-0" style={{ width: "32px" }}>
                        <span>Mon</span>
                        <span>Wed</span>
                        <span>Fri</span>
                    </div>

                    {/* The Grid */}
                    <div className="flex gap-[3px]">
                        {weeks.map((week, i) => (
                            <div key={i} className="flex flex-col gap-[3px]">
                                {week.map((day, j) => {
                                    if (!day) return <div key={j} className="w-[10px] h-[10px]" />

                                    return (
                                        <TooltipProvider key={day.dateStr}>
                                            <Tooltip delayDuration={0}>
                                                <TooltipTrigger asChild>
                                                    <div
                                                        className={cn(
                                                            "w-[10px] h-[10px] rounded-[2px] transition-colors hover:border hover:border-white/50 cursor-crosshair",
                                                            day.level === 0 && "bg-white/5",
                                                            day.level === 1 && "bg-emerald-900/40",
                                                            day.level === 2 && "bg-emerald-700/60",
                                                            day.level === 3 && "bg-emerald-500/80",
                                                            day.level === 4 && "bg-emerald-400 font-bold",
                                                        )}
                                                    />
                                                </TooltipTrigger>
                                                <TooltipContent side="top" className="text-[10px] bg-zinc-950 border-white/10 text-white px-2 py-1 shadow-2xl">
                                                    <p>
                                                        <span className="font-bold text-emerald-400">{day.count} sales</span> on {day.date.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                                    </p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-2 text-[9px] text-white/25 pr-2">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-white/5" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-900/40" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-700/60" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-500/80" />
                        <div className="w-[10px] h-[10px] rounded-[2px] bg-emerald-400" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    )
}
