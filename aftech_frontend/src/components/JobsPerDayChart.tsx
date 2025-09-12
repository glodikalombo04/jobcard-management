// src/components/JobsPerDayChart.tsx
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchWithAuth } from "../utils/api";

type DataPoint = {
  date: string;
  count: number;
};

type Props = {
  regionId: string;
  customerId: string;
  startDate: string;
  endDate: string;
};

export default function JobsPerDayChart({
  regionId,
  customerId,
  startDate,
  endDate,
}: Props) {
  const [data, setData] = useState<DataPoint[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (regionId) params.append("region_id", regionId);
      if (customerId) params.append("customer_id", customerId);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      try {
        const res = await fetchWithAuth(
          `http://127.0.0.1:9300/api/jobcards/stats/jobs-per-day/?${params.toString()}`
        );
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching job data", err);
      }
    };

    fetchData();
  }, [regionId, customerId, startDate, endDate]);

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-xl font-semibold mb-4">Jobs Per Day</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#FF3C00" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
