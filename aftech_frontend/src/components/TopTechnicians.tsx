import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/api";

type Tech = { id: number; name: string; count: number };

const TopTechnicians: React.FC<{
  regionId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}> = ({ regionId, startDate, endDate, limit = 10 }) => {
  const [data, setData] = useState<Tech[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `/jobcards/stats/top-technicians/?limit=${limit}`;
        if (regionId) url += `&region_id=${regionId}`;
        if (startDate) url += `&start_date=${startDate}`;
        if (endDate) url += `&end_date=${endDate}`;

        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error("Failed to load leaderboard");
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Error fetching top technicians:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [regionId, startDate, endDate, limit]);

  const max = data.length ? Math.max(...data.map((d) => d.count)) : 0;

  return (
    <div className="bg-white shadow rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Top Technicians</h3>
        <span className="text-xs text-gray-500">Top {limit}</span>
      </div>

      {loading ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : (
        <ul className="space-y-3">
          {data.map((t, i) => (
            <li key={t.id} className="flex items-center gap-3">
              <div className="w-6 text-xs font-medium">{i + 1}</div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-sm text-gray-600">{t.count}</div>
                </div>
                <div className="h-2 bg-gray-100 rounded mt-1">
                  <div
                    className="h-2 bg-gradient-to-r from-green-400 to-emerald-600 rounded-full shadow-md animate-pulse"
                    style={{ width: `${max ? (t.count / max) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </li>
          ))}
          {data.length === 0 && <li className="text-sm text-gray-500">No data</li>}
        </ul>
      )}
    </div>
  );
};

export default TopTechnicians;