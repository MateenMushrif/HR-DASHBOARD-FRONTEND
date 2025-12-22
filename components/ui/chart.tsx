"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
    [k in string]: {
        label?: React.ReactNode
        icon?: React.ComponentType
    } & (
        | { color?: string; theme?: never }
        | { color?: never; theme: Record<keyof typeof THEMES, string> }
    )
}

type ChartContextProps = {
    config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
    const context = React.useContext(ChartContext)
    if (!context) {
        throw new Error("useChart must be used within a <ChartContainer />")
    }
    return context
}

/* -------------------- Chart Container -------------------- */

const ChartContainer = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<"div"> & {
        config: ChartConfig
        children: React.ComponentProps<
            typeof RechartsPrimitive.ResponsiveContainer
        >["children"]
    }
>(({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId()
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

    return (
        <ChartContext.Provider value={{ config }}>
            <div
                data-chart={chartId}
                ref={ref}
                className={cn(
                    "flex aspect-video justify-center text-xs [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none",
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        </ChartContext.Provider>
    )
})
ChartContainer.displayName = "Chart"

/* -------------------- Chart Style -------------------- */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
    const colorConfig = Object.entries(config).filter(
        ([, cfg]) => cfg.theme || cfg.color
    )

    if (!colorConfig.length) return null

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                                .map(([key, itemConfig]) => {
                                    const color =
                                        itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
                                        itemConfig.color
                                    return color ? `  --color-${key}: ${color};` : ""
                                })
                                .join("\n")}
}
`
                    )
                    .join("\n"),
            }}
        />
    )
}

/* -------------------- Tooltip -------------------- */

const ChartTooltip = RechartsPrimitive.Tooltip

type ChartTooltipContentProps = {
    hideLabel?: boolean
}

function ChartTooltipContent(
    props: ChartTooltipContentProps & unknown
) {
    // ✅ Hook MUST be called unconditionally
    const { config } = useChart()
    const { hideLabel } = props


    if (typeof props !== "object" || props === null) return null

    const p = props as {
        active?: boolean
        payload?: unknown
        label?: unknown
        className?: string
    }

    if (!p.active || !Array.isArray(p.payload) || p.payload.length === 0) {
        return null
    }

    const payload = p.payload

    return (
        <div
            className={cn(
                "tooltip-card grid min-w-[8rem] gap-1.5 px-3 py-2 text-xs shadow-xl",
                p.className
            )}
        >
            {!hideLabel && typeof p.label === "string" && (
                <div className="font-medium">
                    {config[p.label]?.label ?? p.label}
                </div>
            )}

            <div className="grid gap-1.5">
                {payload.map((item: unknown, index: number) => {
                    if (typeof item !== "object" || item === null) return null

                    const entry = item as {
                        name?: React.ReactNode
                        value?: number | string
                        color?: string
                        dataKey?: string
                    }

                    const key = entry.dataKey ?? index

                    return (
                        <div
                            key={String(key)}
                            className="flex items-center justify-between gap-2"
                        >
                            <span className="flex items-center gap-1">
                                <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <span>{entry.name}</span>
                            </span>
                            {entry.value !== undefined && (
                                <span className="font-mono">
                                    {Number(entry.value).toLocaleString()}
                                </span>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

/* -------------------- Legend -------------------- */

const ChartLegend = RechartsPrimitive.Legend

function ChartLegendContent(props: unknown) {
    // ✅ Hook MUST be called unconditionally
    const { config } = useChart()

    if (typeof props !== "object" || props === null) return null

    const p = props as {
        payload?: unknown
        verticalAlign?: "top" | "bottom"
        className?: string
    }

    if (!Array.isArray(p.payload) || p.payload.length === 0) return null

    return (
        <div
            className={cn(
                "flex items-center justify-center gap-4",
                p.verticalAlign === "top" ? "pb-3" : "pt-3",
                p.className
            )}
        >
            {p.payload.map((item: unknown, index: number) => {
                if (typeof item !== "object" || item === null) return null

                const entry = item as {
                    dataKey?: string
                    color?: string
                }

                const key = entry.dataKey ?? index
                const itemConfig = config[key as keyof typeof config]

                return (
                    <div
                        key={String(key)}
                        className="flex items-center gap-1.5"
                    >
                        {itemConfig?.icon ? (
                            <itemConfig.icon />
                        ) : (
                            <div
                                className="h-2 w-2 rounded-[2px]"
                                style={{ backgroundColor: entry.color }}
                            />
                        )}
                        {itemConfig?.label}
                    </div>
                )
            })}
        </div>
    )
}

/* -------------------- Exports -------------------- */

export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
}
