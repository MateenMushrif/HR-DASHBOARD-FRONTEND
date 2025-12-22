// components/ui/chart.tsx
import React from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    type TooltipContentProps,
} from "recharts";

/* -------------------- Types -------------------- */

export interface HirePoint {
    month: string;
    employees: number;
    interns: number;
}

interface StackedAreaChartProps {
    data: HirePoint[];
}

type ValueType = number | string;
type NameType = string;

/* -------------------- Custom Tooltip -------------------- */

function CustomTooltip(
    props: TooltipContentProps<ValueType, NameType>
) {
    const { active, payload, label } = props;

    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="tooltip-card p-3 py-2 text-xs">
            <p className="mb-1 text-[12px] text-[var(--chart-text)]">
                {label}
            </p>

            {payload.map((item, index) => {
                const key = String(item.dataKey ?? item.name ?? index);
                const color = item.color ?? "#fff";
                const displayName = item.name ?? String(item.dataKey ?? "");
                const displayValue = item.value ?? "";

                return (
                    <div
                        key={key}
                        className="flex items-center justify-between gap-2"
                    >
                        <span className="flex items-center gap-1">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: color }}
                            />
                            <span className="text-[11px] text-foreground/80">
                                {displayName}
                            </span>
                        </span>
                        <span className="text-[13px] text-foreground">
                            {displayValue}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

/* -------------------- Stacked Area Chart -------------------- */

const StackedAreaChart: React.FC<StackedAreaChartProps> = ({ data }) => {
    return (
        <div className="w-full h-[240px] md:h-[260px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 20, right: 0, left: 0, bottom: 4 }}
                >
                    <defs>
                        <linearGradient id="employeesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-5)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="var(--chart-5)" stopOpacity={0} />
                        </linearGradient>

                        <linearGradient id="internsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--chart-0)" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="var(--chart-0)" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 14,
                        }}
                    />

                    <YAxis
                        width={50}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={18}
                        tick={{
                            fill: "var(--muted-foreground)",
                            fontSize: 14,
                        }}
                    />

                    <Tooltip
                        content={CustomTooltip}
                        cursor={{
                            stroke: "hsla(0,0%,100%,0.18)",
                            strokeWidth: 1,
                        }}
                    />

                    <Area
                        type="monotone"
                        dataKey="employees"
                        name="Employees"
                        stroke="var(--chart-4)"
                        fill="url(#employeesGradient)"
                        activeDot={{ r: 4 }}
                    />

                    <Area
                        type="monotone"
                        dataKey="interns"
                        name="Interns"
                        stroke="var(--chart-0)"
                        fill="url(#internsGradient)"
                        activeDot={{ r: 4 }}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StackedAreaChart;
