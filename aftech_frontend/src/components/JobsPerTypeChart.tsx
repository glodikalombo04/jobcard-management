import { useEffect, useMemo, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { fetchWithAuth } from "../utils/api"; // adjust path if needed

type JobTypeData = {
  name: string;
  value: number;
};

type Props = {
  regionId: string;
  customerId: string;
  startDate: string;
  endDate: string;
};


const COLORS = [
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#8b5cf6", // violet
  "#f97316", // orange
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#ec4899", // pink
];

export default function JobsPerJobTypePie({
  regionId,
  customerId,
  startDate,
  endDate,
}: Props) {
  const [data, setData] = useState<JobTypeData[]>([]);
  const total = useMemo(
    () => data.reduce((sum, d) => sum + (d.value || 0), 0),
    [data]
  );

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (regionId) params.append("region_id", regionId);
      if (customerId) params.append("customer_id", customerId);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      try {
        const res = await fetchWithAuth(
          `/jobcards/stats/jobs-per-type/?${params.toString()}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch job type data", err);
      }
    };

    fetchData();
  }, [regionId, customerId, startDate, endDate]);

  const renderLabel = (entry: any) => {
    const pct = total ? ((entry.value / total) * 100).toFixed(0) : "0";
    return `${pct}%`;
  };

  return (
    <div className="p-4 bg-white shadow-lg rounded-lg border border-gray-100">
      <h2 className="text-xl font-semibold mb-4">Jobs by Type</h2>
      <div className="flex flex-col md:flex-row items-start">
        <div className="w-full md:w-2/3 relative">
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={130}
                paddingAngle={10}
                label={renderLabel}
                labelLine={false}
                isAnimationActive={true}
                animationDuration={900}
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: any, name: any) => [
                  value,
                  `${name}`,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-xs text-gray-500">Total Jobs</div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="w-full md:w-1/3 pl-4 mt-4 md:mt-0">
          <ul className="space-y-3">
            {data.map((entry, index) => {
              return (
                <li
                  key={`legend-${index}`}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-block w-4 h-4 rounded-md shadow-sm"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {entry.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{entry.value}</span>
                  </div>
                </li>
              );
            })}
            {data.length === 0 && (
              <li className="text-sm text-gray-500">No data available</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
