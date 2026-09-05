export function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-[#6b7280]">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${tone === "warning" ? "text-amber-600" : "text-[#1a1d1f]"}`}>{value}</p>
    </div>
  );
}
