"use client";

import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, YAxis, Cell } from "recharts";

export function DeliveryChart({ data }: { data: { name: string, deliveries: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#71717a' }}
                    dy={5}
                />
                <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9, fill: '#71717a' }}
                    tickCount={4}
                />
                <Tooltip
                    cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    contentStyle={{
                        backgroundColor: '#18181b',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff'
                    }}
                    itemStyle={{ color: '#c084fc' }}
                />
                <Bar dataKey="deliveries" radius={[4, 4, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.deliveries > 0 ? "#8b5cf6" : "rgba(139, 92, 246, 0.2)"} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
