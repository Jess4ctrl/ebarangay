export default function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-gray-500">{title}</span>
        <span className={`text-2xl ${color}`}>{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-xs text-gray-400">{subtitle}</div>
    </div>
  );
}