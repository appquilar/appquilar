import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { useIsMobile } from "@/hooks/use-mobile";

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
    const isMobile = useIsMobile();

    return (
        <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={data}
                    margin={{ top: 10, right: 20, left: 8, bottom: 10 }}
                    className="px-2 sm:px-4"
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="day"
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        interval={isMobile ? 3 : 1}
                    />
                    <YAxis
                        tickLine={false}
                        axisLine={false}
                        tick={{ fontSize: isMobile ? 10 : 12 }}
                        width={36}
                    />
                    <Tooltip
                        formatter={(value: number) => [value.toLocaleString("es-ES"), label]}
                    />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name={label}
                        stroke={color}
                        strokeWidth={2.25}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0, fill: color }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default EngagementLineChart;

