import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";

type Customer = {
  id: number;
  name: string;
  region_name: string;
};

type RegionOption = {
  id: number;
  name: string;
};

const CustomersPage = () => {
  const [groupedCustomers, setGroupedCustomers] = useState<{
    [region: string]: Customer[];
  }>({});

  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]); // Dynamically fetched regions
  const [expandedRegions, setExpandedRegions] = useState<string[]>([]);
  const [regionSearch, setRegionSearch] = useState<{
    [region: string]: string;
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", region: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    region?: string;
  }>({});

  const loadCustomers = async () => {
    const response = await fetchWithAuth(
      "http://127.0.0.1:9300/api/jobcards/customers/"
    );
    if (response && response.ok) {
      const data: Customer[] = await response.json();
      const grouped = data.reduce((acc, customer) => {
        const region = customer.region_name;
        if (!acc[region]) acc[region] = [];
        acc[region].push(customer);
        return acc;
      }, {} as { [region: string]: Customer[] });
      setGroupedCustomers(grouped);
    } else {
      console.error("Failed to load customers");
    }
  };

  const loadRegions = async () => {
    const response = await fetchWithAuth(
      "http://127.0.0.1:9300/api/jobcards/regions/"
    );
    if (response.ok) {
      const data: RegionOption[] = await response.json();
      setRegionOptions(data); // Set the dynamically fetched regions
    } else {
      console.error("Failed to load regions");
    }
  };

  useEffect(() => {
    loadCustomers();
    loadRegions(); // Fetch regions on component mount
  }, []);

  const toggleRegion = (region: string) => {
    setExpandedRegions((prev) =>
      prev.includes(region)
        ? prev.filter((r) => r !== region)
        : [...prev, region]
    );
  };

  const handleCreateCustomer = async () => {
    const errors: { name?: string; region?: string } = {};

    if (!newCustomer.name.trim()) {
      errors.name = "Customer name is required";
    }

    if (!newCustomer.region) {
      errors.region = "Please select a region";
    }

    setFormErrors(errors);

    // Stop here if errors exist
    if (Object.keys(errors).length > 0) return;

    const regionObj = regionOptions.find((r) => r.name === newCustomer.region);
    if (!regionObj) return;

    const response = await fetchWithAuth(
      "http://127.0.0.1:9300/api/jobcards/customers/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newCustomer.name, region: regionObj.id }),
      }
    );

    if (response.ok) {
      setNewCustomer({ name: "", region: "" });
      setFormErrors({});
      setShowModal(false);
      setSuccessMessage(
        `Customer "${newCustomer.name}" was created in "${newCustomer.region}".`
      );
      loadCustomers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage("Failed to create customer. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const regionPairs = () => {
    const regions = Object.keys(groupedCustomers);
    const pairs: string[][] = [];
    for (let i = 0; i < regions.length; i += 2) {
      pairs.push(regions.slice(i, i + 2));
    }
    return pairs;
  };

  return (
    <div className="p-6">
      {/* Top bar with title and global button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers Overview</h1>
        <button
          onClick={() => {
            setNewCustomer({ name: "", region: "" });
            setShowModal(true);
          }}
          className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63900]"
        >
          Create Customer
        </button>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-100 text-green-800 px-4 py-2 rounded shadow">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow">
          {errorMessage}
        </div>
      )}

      {/* Customer boxes grouped by region */}
      {regionPairs().map((pair, i) => (
        <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {pair.map((region) => {
            const customers = groupedCustomers[region] || [];
            const isExpanded = expandedRegions.includes(region);
            const searchTerm = regionSearch[region]?.toLowerCase() || "";
            const filtered = customers.filter((c) =>
              c.name.toLowerCase().includes(searchTerm)
            );
            const displayed = isExpanded ? filtered : filtered.slice(0, 15);

            return (
              <div
                key={region}
                className="bg-white p-4 rounded shadow relative"
              >
                <h2 className="text-lg font-semibold text-[#FF3C00] mb-2">
                  {region}
                </h2>

                <input
                  type="text"
                  placeholder={`Search ${region} customers...`}
                  className="mb-4 p-2 border border-gray-300 rounded w-full max-w-sm"
                  value={regionSearch[region] || ""}
                  onChange={(e) =>
                    setRegionSearch((prev) => ({
                      ...prev,
                      [region]: e.target.value,
                    }))
                  }
                />

                <ul className="list-disc ml-5 space-y-1">
                  {displayed.map((cust) => (
                    <li key={cust.id}>{cust.name}</li>
                  ))}
                </ul>

                {filtered.length > 15 && (
                  <button
                    onClick={() => toggleRegion(region)}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {/* Modal for creating a new customer */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Create Customer</h2>
            <input
              type="text"
              placeholder="Customer Name"
              value={newCustomer.name}
              onChange={(e) =>
                setNewCustomer((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full mb-1 p-2 border border-gray-300 rounded"
            />
            {formErrors.name && (
              <p className="text-red-600 text-sm mb-2">{formErrors.name}</p>
            )}
            <select
              value={newCustomer.region}
              onChange={(e) =>
                setNewCustomer((prev) => ({ ...prev, region: e.target.value }))
              }
              className="w-full mb-1 p-2 border border-gray-300 rounded"
            >
              <option value="">Select Region</option>
              {regionOptions.map((region) => (
                <option key={region.id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>
            {formErrors.region && (
              <p className="text-red-600 text-sm mb-2">{formErrors.region}</p>
            )}

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#FF3C00] text-white px-4 py-2 rounded"
                onClick={handleCreateCustomer}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;