import { useEffect, useState } from "react";
import { fetchWithAuth } from "../utils/api";

type Props = {
  regionId: string;
  customerId: string;
  startDate: string;
  endDate: string;
};

export default function TotalJobCardStat({
  regionId,
  customerId,
  startDate,
  endDate,
}: Props) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const params = new URLSearchParams();
      if (regionId) params.append("region_id", regionId);
      if (customerId) params.append("customer_id", customerId);
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);

      try {
        const res = await fetchWithAuth(
          `http://127.0.0.1:9300/api/jobcards/total-jobcards/?${params.toString()}`
        );
        const data = await res.json();
        setCount(data.count);
      } catch (err) {
        console.error("Error fetching total jobcards", err);
      }
    };

    fetchData();
  }, [regionId, customerId, startDate, endDate]);

  return (
    <div className="bg-white shadow rounded p-4 w-full md:w-auto">
      <p className="text-sm text-gray-500">Total Job Cards</p>
      <p className="text-3xl font-bold text-gray-800">
        {count !== null ? count : "—"}
      </p>
    </div>
  );
}
