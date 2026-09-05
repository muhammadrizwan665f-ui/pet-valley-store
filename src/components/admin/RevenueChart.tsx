"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export function RevenueChart({ data }: { data: { date: string; value: number }[] }) {
  if (data.length === 0) {
    return <p className="text-sm text-[#6b7280]">No paid orders in this range yet.</p>;
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid stroke="#f0f2f4" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(v: number) => `$${v.toFixed(2)}`} />
        <Line type="monotone" dataKey="value" stroke="#6f8a5c" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
