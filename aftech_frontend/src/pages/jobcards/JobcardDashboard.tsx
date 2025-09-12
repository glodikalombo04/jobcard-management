import { useState, useEffect } from "react";
import JobsPerDayChart from "../../components/JobsPerDayChart";
import JobsPerJobTypePie from "../../components/JobsPerTypeChart";
import TotalJobCardStat from "../../components/TotalJobCardStat";
import { fetchWithAuth } from "../../utils/api";
import DateRangeFilter from "../../components/DateRangeFilter";

type Region = {
  id: number;
  name: string;
};

type Customer = {
  id: number;
  name: string;
};

const JobcardDashboard = () => {
  const [regionId, setRegionId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [regions, setRegions] = useState<Region[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const fetchRegions = async () => {
      const res = await fetchWithAuth(
        "http://127.0.0.1:9300/api/jobcards/regions-with-jobcards/"
      );
      const data = await res.json();
      setRegions(data);
    };

    fetchRegions().catch((err) => console.error("Failed to load regions", err));
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      const url = new URL(
        "http://127.0.0.1:9300/api/jobcards/customers-with-jobcards/"
      );
      if (regionId) url.searchParams.append("region_id", regionId);

      const res = await fetchWithAuth(url.toString());
      const data = await res.json();
      setCustomers(data);
    };

    fetchCustomers().catch((err) =>
      console.error("Failed to load customers", err)
    );
  }, [regionId]);

  useEffect(() => {
    setCustomerId(""); // Clear customer filter when region changes
  }, [regionId]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        Welcome to the Jobcard Dashboard
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 flex-wrap">
        <div className="flex flex-col md:flex-row gap-4 flex-wrap">
          <select
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>
                {region.name}
              </option>
            ))}
          </select>
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">All Customers</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
          {/* Filters on the left */}
          <div className="block text-sm font-medium">
            <DateRangeFilter
              onChange={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
            />
          </div>
          {/*{" "}
          <p className="text-sm text-gray-500">
            Showing jobs from <strong>{startDate}</strong> to{" "}
            <strong>{endDate}</strong>
          </p>{" "}
          */}
        </div>
        {/* Stat box on the right */}
        <TotalJobCardStat
          regionId={regionId}
          customerId={customerId}
          startDate={startDate}
          endDate={endDate}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JobsPerDayChart
          regionId={regionId}
          customerId={customerId}
          startDate={startDate}
          endDate={endDate}
        />
        <JobsPerJobTypePie
          regionId={regionId}
          customerId={customerId}
          startDate={startDate}
          endDate={endDate}
        />
      </div>
    </div>
  );
};

export default JobcardDashboard;
