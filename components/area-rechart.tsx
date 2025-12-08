import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface HirePoint {
    month: string;
    employees: number;
    interns: number;
}

interface StackedAreaChartProps {
    data: HirePoint[];
}

const CustomTooltip = ({
    active,
    payload,
    label,
}: any) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
        <div className="glass-card p-0.5">
            <div className="tooltip-card px-3 py-2 text-xs">
                <p className="mb-1 text-[10px] text-[var(--chart-text)]">{label}</p>

                {payload.map((item: any) => (
                    <div
                        key={String(item.dataKey)}
                        className="flex items-center justify-between gap-2"
                    >
                        <span className="flex items-center gap-1">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color || "#fff" }}
                            />
                            <span className="text-[11px] text-foreground/80">
                                {item.name ?? item.dataKey}
                            </span>
                        </span>
                        <span className="text-[11px] text-foreground">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StackedAreaChart = ({ data }: StackedAreaChartProps) => {
    return (
        // 🔑 This wrapper controls the size within the card/grid
        <div className="w-full h-[240px] md:h-[260px] lg:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 0,
                        left: 0,
                        bottom: 4,
                    }}
                >
                    <defs>
                        <linearGradient id="employeesGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0d00ffff" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#00a2ffff" stopOpacity={0} />
                        </linearGradient>

                        <linearGradient id="internsGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ee00ffff" stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#ee00ffff" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tickMargin={12}
                        tick={{
                            fill: "var(--chart-text)",
                            fontSize: 14,
                        }}
                    />

                    <YAxis
                        width={50}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={18}
                        tick={{
                            fill: "var(--chart-text)",
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
                        stroke="#0d00ff50"
                        fill="url(#employeesGradient)"
                    />
                    <Area
                        type="monotone"
                        dataKey="interns"
                        name="Interns"
                        stroke="#ee00ff5c"
                        fill="url(#internsGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StackedAreaChart;
