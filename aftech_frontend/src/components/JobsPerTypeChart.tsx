import { useEffect, useState } from "react";
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
  "#6366f1",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#a855f7",
];

export default function JobsPerJobTypePie({
  regionId,
  customerId,
  startDate,
  endDate,
}: Props) {
  const [data, setData] = useState<JobTypeData[]>([]);

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

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Jobs by Type</h2>
      <div className="flex flex-col md:flex-row items-start">
        {/* Pie Chart */}
        <div className="w-full md:w-2/3">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend */}
        <div className="w-full md:w-1/3 text-xs pl-4 mt-4 md:mt-0">
          <ul className="space-y-1">
            {data.map((entry, index) => (
              <li key={`legend-${index}`} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                {entry.name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
