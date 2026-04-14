import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { type ChartDataPoint } from '../../../services/adminService';

interface Props {
    data: ChartDataPoint[];
}

const RevenueChart: React.FC<Props> = ({ data }) => {
    const colors = ['#0891B2', '#22D3EE', '#059669', '#10B981', '#0891B2', '#059669'];

    return (
        <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value: string) => value?.slice(5)}
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748B' }}
                    />
                    <Tooltip
                        labelFormatter={(label) => `Date: ${label}`}
                        formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                        contentStyle={{
                            borderRadius: '1rem',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                            fontSize: '10px',
                            fontWeight: 900,
                            textTransform: 'uppercase'
                        }}
                        cursor={{ fill: '#F1F5F9' }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} opacity={0.8} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RevenueChart;
