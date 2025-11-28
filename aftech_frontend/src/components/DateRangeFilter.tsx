import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type Props = {
  onChange: (range: { startDate: string; endDate: string }) => void;
};

export default function DateRangeFilter({ onChange }: Props) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const formatDate = (date: Date | null) =>
    date ? date.toISOString().split("T")[0] : "";

  useEffect(() => {
    onChange({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
  }, [startDate, endDate]);

  return (
    <div className="flex gap-4 flex-wrap items-end">
      {/* Start Date */}
      <div>
        <label className="block text-sm font-medium">Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select start date"
          className="border rounded px-2 py-1"
        />
      </div>

      {/* End Date */}
      <div>
        <label className="block text-sm font-medium">End Date</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          dateFormat="yyyy-MM-dd"
          placeholderText="Select end date"
          className="border rounded px-2 py-1"
        />
      </div>
    </div>
  );
}
