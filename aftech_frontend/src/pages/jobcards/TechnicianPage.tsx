import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";

type Technician = {
  id: number;
  name: string;
  initials: string;
  region_name: string;
};

type RegionOption = {
  id: number;
  name: string;
};

const TechnicianPage = () => {
  const [groupedTechnicians, setGroupedTechnicians] = useState<{
    [region: string]: Technician[];
  }>({});

  const [regionOptions, setRegionOptions] = useState<RegionOption[]>([]); // Dynamically fetched regions
  const [regionSearch, setRegionSearch] = useState<{
    [region: string]: string;
  }>({});
  const [showModal, setShowModal] = useState(false);
  const [newTechnician, setNewTechnician] = useState({
    name: "",
    initials: "",
    region: "",
  });
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    initials?: string;
    region?: string;
  }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [editingTechnician, setEditingTechnician] = useState<Technician | null>(
    null
  );

  const loadTechnicianDetail = async (id: number) => {
    const response = await fetchWithAuth(
      `http://127.0.0.1:9300/api/jobcards/technicians/${id}/`
    );

    if (response.ok) {
      const data: Technician = await response.json();
      setNewTechnician({
        name: data.name,
        initials: data.initials,
        region: data.region_name,
      });
      setEditingTechnician(data);
      setShowModal(true);
    } else {
      console.error("Failed to load technician details");
    }
  };

  const loadTechnicians = async () => {
    const response = await fetchWithAuth(
      "http://127.0.0.1:9300/api/jobcards/technicians/"
    );

    if (response && response.ok) {
      const data: Technician[] = await response.json();

      const grouped = data.reduce((acc, technician) => {
        const region = technician.region_name;
        if (!acc[region]) acc[region] = [];
        acc[region].push(technician);
        return acc;
      }, {} as { [region: string]: Technician[] });

      setGroupedTechnicians(grouped);
    } else {
      console.error("Failed to load technicians");
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
    loadTechnicians();
    loadRegions(); // Fetch regions on component mount
  }, []);

  const handleCreateTechnician = async () => {
    const errors: { name?: string; initials?: string; region?: string } = {};

    if (!newTechnician.name.trim()) errors.name = "Name is required";
    if (!newTechnician.initials.trim())
      errors.initials = "Initials are required";
    if (!newTechnician.region) errors.region = "Region is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const regionObj = regionOptions.find(
      (r) => r.name === newTechnician.region
    );
    if (!regionObj) return;

    const response = await fetchWithAuth(
      "http://127.0.0.1:9300/api/jobcards/technicians/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTechnician.name,
          initials: newTechnician.initials,
          region: regionObj.id,
        }),
      }
    );

    if (response.ok) {
      setNewTechnician({ name: "", initials: "", region: "" });
      setFormErrors({});
      setShowModal(false);
      setSuccessMessage("Technician created successfully.");
      loadTechnicians();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage("Failed to create technician. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const handleUpdateTechnician = async () => {
    if (!editingTechnician) return;

    const errors: { name?: string; initials?: string; region?: string } = {};

    if (!newTechnician.name.trim()) errors.name = "Name is required";
    if (!newTechnician.initials.trim())
      errors.initials = "Initials are required";
    if (!newTechnician.region) errors.region = "Region is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const regionObj = regionOptions.find(
      (r) => r.name === newTechnician.region
    );
    if (!regionObj) return;

    const response = await fetchWithAuth(
      `http://127.0.0.1:9300/api/jobcards/technicians/${editingTechnician.id}/`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTechnician.name,
          initials: newTechnician.initials,
          region: regionObj.id,
        }),
      }
    );

    if (response.ok) {
      setEditingTechnician(null);
      setNewTechnician({ name: "", initials: "", region: "" });
      setFormErrors({});
      setShowModal(false);
      setSuccessMessage("Technician updated successfully.");
      loadTechnicians();
      setTimeout(() => setSuccessMessage(""), 3000);
    } else {
      setErrorMessage("Failed to update technician.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Technicians Overview</h1>
        <button
          onClick={() => {
            setNewTechnician({ name: "", initials: "", region: "" });
            setShowModal(true);
          }}
          className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63900]"
        >
          Create Technician
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(groupedTechnicians).map(([region, technicians]) => {
          const searchTerm = regionSearch[region]?.toLowerCase() || "";
          const filtered = technicians.filter((t) =>
            t.name.toLowerCase().includes(searchTerm)
          );

          return (
            <div key={region} className="bg-white p-4 rounded shadow">
              <h2 className="text-lg font-semibold text-[#FF3C00] mb-2">
                {region}
              </h2>
              <input
                type="text"
                placeholder={`Search ${region} technicians...`}
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
                {filtered.map((tech) => (
                  <li key={tech.id}>
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => loadTechnicianDetail(tech.id)}
                    >
                      {tech.name}
                    </button>{" "}
                    ({tech.initials})
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingTechnician ? "Update Technician" : "Create Technician"}
            </h2>
            <input
              type="text"
              placeholder="Technician Name"
              value={newTechnician.name}
              onChange={(e) =>
                setNewTechnician((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full mb-1 p-2 border border-gray-300 rounded"
            />
            {formErrors.name && (
              <p className="text-red-600 text-sm mb-2">{formErrors.name}</p>
            )}

            <input
              type="text"
              placeholder="Initials"
              value={newTechnician.initials}
              onChange={(e) =>
                setNewTechnician((prev) => ({
                  ...prev,
                  initials: e.target.value,
                }))
              }
              className="w-full mb-1 p-2 border border-gray-300 rounded"
            />
            {formErrors.initials && (
              <p className="text-red-600 text-sm mb-2">{formErrors.initials}</p>
            )}

            <select
              value={newTechnician.region}
              onChange={(e) =>
                setNewTechnician((prev) => ({
                  ...prev,
                  region: e.target.value,
                }))
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

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#FF3C00] text-white px-4 py-2 rounded"
                onClick={
                  editingTechnician
                    ? handleUpdateTechnician
                    : handleCreateTechnician
                }
              >
                {editingTechnician ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianPage;