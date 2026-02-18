import { useId } from "react";
import { Area, Line, LineChart, ResponsiveContainer, Tooltip } from "recharts";

export interface EngagementLineChartPoint {
    day: string;
    value: number;
}

interface EngagementLineChartProps {
    data: EngagementLineChartPoint[];
    color: string;
    label: string;
}

const EngagementLineChart = ({ data, color, label }: EngagementLineChartProps) => {
    const gradientId = useId();

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                    className="px-2 sm:px-6"
                >
                    <defs>
                        <linearGradient id={`${gradientId}-line`} x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                            <stop offset="60%" stopColor={color} stopOpacity={0.95} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.65} />
                        </linearGradient>
                        <linearGradient id={`${gradientId}-area`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity={0.2} />
                            <stop offset="100%" stopColor={color} stopOpacity={0.01} />
                        </linearGradient>
                    </defs>
                    <Tooltip
                        cursor={{ stroke: color, strokeOpacity: 0.15 }}
                        contentStyle={{
                            borderRadius: "1rem",
                            border: "1px solid rgba(148, 163, 184, 0.2)",
                            background: "rgba(255, 255, 255, 0.82)",
                            backdropFilter: "blur(8px)",
                            color: "#0F172A",
                        }}
                        labelStyle={{ color: "rgba(15, 23, 42, 0.6)" }}
                        formatter={(value: number) => [value.toLocaleString("es-ES"), label]}
                    />
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill={`url(#${gradientId}-area)`}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name={label}
                        stroke={`url(#${gradientId}-line)`}
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EngagementLineChart;
