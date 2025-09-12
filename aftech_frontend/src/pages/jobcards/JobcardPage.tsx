import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import Select from "react-select";
import { saveAs } from "file-saver"; // Add this import at the top


type JobCard = {
  id: number;
  unique_id: string;
  region_name: string;
  technician_name: string;
  customer_name: string;
  job_type_name: string;
  support_agent_name: string;
  device_imei: string;
  vehicle_reg: string;
  created_at: string;
  accessories: number[];        // IDs
  accessories_name: string[]; 
  tampering?: string;   // ✅ Name

};

type Region = { id: number; name: string };
type Technician = { id: number; name: string };
type Customer = { id: number; name: string };
type JobType = { id: number; name: string };
type SupportAgent = { id: number; name: string };
type Accessory = { id: number; name: string };

const JobCardPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const [jobCards, setJobCards] = useState<JobCard[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [supportAgents, setSupportAgents] = useState<SupportAgent[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false); // Controls the edit modal visibility
  const [jobCardBeingEdited, setJobCardBeingEdited] = useState<JobCard | null>(null); // Stores the job card being edited
  
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedTechnician, setSelectedTechnician] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("");
  const [selectedSupportAgent, setSelectedSupportAgent] = useState("");
  const [deviceImei, setDeviceImei] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);
  const [newlyCreatedId, setNewlyCreatedId] = useState<string | null>(null);

  const [errorMessage, setErrorMessage] = useState("");

  const [typedCustomerName, setTypedCustomerName] = useState("");
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");

  const [tampering, setTampering] = useState("");
  const [tamperingError, setTamperingError] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const customerOptions = customers.map((cust) => ({
    value: cust.id,
    label: cust.name,
  }));

  const openCustomerModal = (name: string) => {
    setNewCustomerName(name);
    setShowCustomerModal(true);
  };

  const handleCreateCustomerFromModal = async () => {
    try {
      const payload = { name: newCustomerName, region: Number(selectedRegion) };
      const response = await fetchWithAuth(
        "http://127.0.0.1:9300/api/jobcards/customers/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!response.ok) throw new Error("Failed to create customer");
      const newCustomer = await response.json();
      setCustomers((prev) => [...prev, newCustomer]);
      setSelectedCustomer(newCustomer.id.toString());
      setShowCustomerModal(false);
    } catch (error) {
      console.error("Error creating customer:", error);
      alert("Failed to create customer. Try again.");
    }
  };


  useEffect(() => {
    const fetchJobCards = async () => {
      try {
        const response = await fetchWithAuth(
          "http://127.0.0.1:9300/api/jobcards/jobcards/"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job cards");
        }
        const data = await response.json();
        const sortedData = data.sort(
          (a: JobCard, b: JobCard) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setJobCards(sortedData);
      } catch (error) {
        console.error("Error fetching job cards:", error);
        setErrorMessage(
          "Failed to load job cards. Please check your connection or login status."
        );
      }
    };

    fetchJobCards();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await fetchWithAuth(
        "http://127.0.0.1:9300/api/jobcards/regions/"
      );
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchTechniciansAndCustomers = async (regionId: string) => {
    try {
      const [techRes, custRes] = await Promise.all([
        fetchWithAuth(
          `http://127.0.0.1:9300/api/jobcards/technicians/?region=${regionId}`
        ),
        fetchWithAuth(
          `http://127.0.0.1:9300/api/jobcards/customers/?region=${regionId}`
        ),
      ]);

      if (techRes.ok) setTechnicians(await techRes.json());
      if (custRes.ok) setCustomers(await custRes.json());
    } catch (error) {
      console.error("Error fetching technicians or customers:", error);
    }
  };

  const fetchJobcardMeta = async () => {
    try {
      const [jtRes, saRes, accRes] = await Promise.all([
        fetchWithAuth("http://127.0.0.1:9300/api/jobcards/job-types/"),
        fetchWithAuth("http://127.0.0.1:9300/api/jobcards/support-agents/"),
        fetchWithAuth("http://127.0.0.1:9300/api/jobcards/accessories/"),
      ]);

      if (jtRes.ok) setJobTypes(await jtRes.json());
      if (saRes.ok) setSupportAgents(await saRes.json());
      if (accRes.ok) setAccessories(await accRes.json());
    } catch (error) {
      console.error("Error fetching jobcard metadata:", error);
    }
  };

  const handleCreateJobCard = async () => {
    if (selectedJobTypeName === "INSPECTION" && !tampering) {
      setTamperingError(true);
      return;
    }

    const payload = {
      region: Number(selectedRegion),
      technician: Number(selectedTechnician),
      customer: Number(selectedCustomer),
      job_type: Number(selectedJobType),
      support_agent: Number(selectedSupportAgent),
      device_imei: deviceImei,
      vehicle_reg: vehicleReg,
      accessories: selectedAccessories.map(Number),
      tampering: selectedJobTypeName === "INSPECTION" ? tampering : null,
    };

    try {
      console.log("Payload being sent:", payload);

      const response = await fetchWithAuth(
        "http://127.0.0.1:9300/api/jobcards/jobcards/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create job card");
      }

      const createdJobCard = await response.json();
      setNewlyCreatedId(createdJobCard.unique_id); // ✅ Set the success message

      // Refresh the jobcards list
      const updated = await fetchWithAuth(
        "http://127.0.0.1:9300/api/jobcards/jobcards/"
      );
      if (updated.ok) {
        setJobCards(await updated.json());
      }

      resetForm(); // ✅ Clear the form
      setShowModal(false);
    } catch (error) {
      console.error("Error creating job card:", error);
      alert("Something went wrong while creating the job card.");
    }
  };

 const handleEditButtonClick = async (card: JobCard) => {
  await fetchRegions();

  // Fetch technicians & customers directly
  const techRes = await fetchWithAuth(
    `http://127.0.0.1:9300/api/jobcards/technicians/?region=${
      regions.find((r) => r.name === card.region_name)?.id || ""
    }`
  );
  const custRes = await fetchWithAuth(
    `http://127.0.0.1:9300/api/jobcards/customers/?region=${
      regions.find((r) => r.name === card.region_name)?.id || ""
    }`
  );

  const techs = techRes.ok ? await techRes.json() : [];
  const custs = custRes.ok ? await custRes.json() : [];

  setTechnicians(techs);
  setCustomers(custs);

  await fetchJobcardMeta();

  setJobCardBeingEdited(card);

  // Populate state variables using freshly fetched data
  const regionId = regions.find((r) => r.name === card.region_name)?.id.toString() || "";
  setSelectedRegion(regionId);
  setSelectedTechnician(
    techs.find((t: Technician) => t.name === card.technician_name)?.id.toString() || ""
  );
  setSelectedCustomer(
    custs.find((c: Customer) => c.name === card.customer_name)?.id.toString() || ""
  );
  setSelectedJobType(
    jobTypes.find((jt) => jt.name === card.job_type_name)?.id.toString() || ""
  );
  setSelectedSupportAgent(
    supportAgents.find((sa) => sa.name === card.support_agent_name)?.id.toString() || ""
  );
  setSelectedAccessories(card.accessories.map(String));
  setDeviceImei(card.device_imei);
  setVehicleReg(card.vehicle_reg);

  setShowEditModal(true);
};


  const handleEditJobCard = async () => {
    if (!jobCardBeingEdited) return;
    
  
    try {
      const payload = {
        region: Number(selectedRegion), // Use region ID
        technician: Number(selectedTechnician), // Use technician ID
        customer: Number(selectedCustomer), // Use customer ID
        job_type: Number(selectedJobType), // Use job type ID
        support_agent: Number(selectedSupportAgent), // Use support agent ID
        device_imei: deviceImei, // IMEI
        vehicle_reg: vehicleReg, // Vehicle registration
        accessories: selectedAccessories.map(Number), // Convert accessory IDs to numbers
        tampering: selectedJobTypeName === "INSPECTION" ? tampering : null, // ✅ add this

      };
      if (
        !selectedRegion ||
        !selectedTechnician ||
        !selectedCustomer ||
        !selectedJobType ||
        !selectedSupportAgent
         ) {
            alert("Please fill in all required fields before saving.");
            return;
        }

  
      const response = await fetchWithAuth(
        `http://127.0.0.1:9300/api/jobcards/jobcards/${jobCardBeingEdited.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to update job card.");
      }
  
      // Refresh the job cards list
      const updated = await fetchWithAuth(
        "http://127.0.0.1:9300/api/jobcards/jobcards/"
      );
      if (updated.ok) {
        setJobCards(await updated.json());
      }
  
      setShowEditModal(false); // Close the modal
    } catch (error) {
      console.error("Error updating job card:", error);
      alert("Something went wrong while updating the job card, Please check if all the fields are correctly filled");
    }
  };

  const resetForm = () => {
    setSelectedRegion("");
    setSelectedTechnician("");
    setSelectedCustomer("");
    setSelectedJobType("");
    setSelectedSupportAgent("");
    setDeviceImei("");
    setVehicleReg("");
    setSelectedAccessories([]);
    setTampering("");
    setTamperingError(false);
    setJobCardBeingEdited(null); 
  };

  const handleOpenModal = () => {
    resetForm();
    fetchRegions();
    fetchJobcardMeta();
    setShowModal(true);
  };

  const handleRegionChange = (value: string) => {
    setSelectedRegion(value);
    setSelectedTechnician("");
    setSelectedCustomer("");
    if (value) {
      fetchTechniciansAndCustomers(value);
    }
  };

  const handleExport = () => {
  // Prepare CSV content
  const csvContent = [
    [
      "JobCard ID",
      "Region",
      "Technician",
      "Customer",
      "Job Type",
      "Accessories",
      "Support Agent",
      "IMEI",
      "Vehicle Reg",
      "Created At",
    ],
    ...filteredJobCards.map((card) => [
      card.unique_id,
      card.region_name,
      card.technician_name,
      card.customer_name,
      card.job_type_name,
      card.accessories_name.join(", "),
      card.support_agent_name,
      card.device_imei,
      card.vehicle_reg,
      new Date(card.created_at).toLocaleString(),
    ]),
     ]
    .map((row) => row.join(",")) // Convert each row to a CSV string
    .join("\n"); // Join all rows with a newline

  // Create a Blob and save the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  saveAs(blob, "filtered_jobcards.csv");
  };

  const selectedJobTypeName = jobTypes.find(
    (jt) => jt.id.toString() === selectedJobType
  )?.name;
  /*
  const totalPages = Math.ceil(jobCards.length / rowsPerPage);
  const paginatedJobCards = jobCards.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
*/

  const filteredJobCards = jobCards.filter((card) => {
  const query = searchQuery.toLowerCase();

  return (
    card.unique_id.toLowerCase().includes(query) ||
    card.region_name.toLowerCase().includes(query) ||
    card.technician_name.toLowerCase().includes(query) ||
    card.customer_name.toLowerCase().includes(query) ||
    card.job_type_name.toLowerCase().includes(query) ||
    card.support_agent_name.toLowerCase().includes(query) ||
    card.device_imei.toLowerCase().includes(query) ||
    card.vehicle_reg.toLowerCase().includes(query) ||
    new Date(card.created_at).toLocaleString().toLowerCase().includes(query)
  );
});

const paginatedJobCards = filteredJobCards.slice(
  (currentPage - 1) * rowsPerPage,
  currentPage * rowsPerPage
);

const totalPages = Math.ceil(filteredJobCards.length / rowsPerPage);



  return (
    <div className="p-6">
    
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All JobCards</h1>
  
          <div className="flex items-center gap-2">
           <input
            type="text"
            placeholder="Search jobcards..."
            value={searchQuery}
            onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // reset page when searching
          }}
        className="border border-gray-300 rounded px-3 py-2 w-64"
        />
      <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          onClick={handleExport}
         >
          Export
        </button>
      <button
        className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63a00]"
        onClick={handleOpenModal}
      >
          Create Jobcard
      </button>
        </div>
      </div>
      

      
      {newlyCreatedId && (
        <div className="mb-4 bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded shadow">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">JobCard created successfully!</p>
              <p>
                ID: <span className="font-mono text-lg">{newlyCreatedId}</span>
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(newlyCreatedId);
                setNewlyCreatedId(null);
              }}
              className="ml-4 bg-[#FF3C00] text-white px-3 py-1 rounded hover:bg-[#e63a00]"
            >
              Copy ID
            </button>
          </div>
        </div>
      )}

      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <div className="bg-white p-6 rounded shadow">
        {jobCards.length === 0 ? (
          <p>No job cards found.</p>
        ) : (
          <>
            <div className="w-full overflow-x-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
                <table className="min-w-[1200px] table-auto text-sm border-collapse border border-gray-300 w-full">
                  <thead>
                    <tr className=" bg-gray-100">
                      <th className="border px-4 py-2">JobCard ID</th>
                      <th className="border px-4 py-2">Region</th>
                      <th className="border px-4 py-2">Technician</th>
                      <th className="border px-4 py-2">Customer</th>
                      <th className="border px-4 py-2">Job Type</th>
                      <th className="border px-4 py-2">Accessories</th>
                      <th className="border px-4 py-2">Support Agent</th>
                      <th className="border px-4 py-2">IMEI</th>
                      <th className="border px-4 py-2">Vehicle Reg</th>
                      <th className="border px-4 py-2">Tampering</th>
                      <th className="border px-4 py-2">Created</th>
                      <th className="border px-4 py-2">Action</th> {/* New column */}

                    </tr>
                  </thead>
                  <tbody>
                    {paginatedJobCards.map((card) => (
                      <tr key={card.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.unique_id}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.region_name}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.technician_name}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.customer_name}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.job_type_name}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.accessories_name && card.accessories_name.length > 0
                            ? card.accessories_name.join(", ")
                            : "None"}
                        </td>
                        
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.support_agent_name}
                        </td>
                        <td className="border px-4 py-2 truncate max-w-[160px]">
                          {card.device_imei}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.vehicle_reg}
                        </td>
                        <td className="border px-4 py-2">
                           {card.job_type_name === "INSPECTION" ? card.tampering || "N/A" : "N/A"}
                        </td> {/* ✅ show tampering only for INSPECTION */}
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {new Date(card.created_at).toLocaleString()}
                        </td>
                        <td className="border px-4 py-2">
                          <button
                            className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-red-600"
                            onClick={() => handleEditButtonClick(card)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {jobCards.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
                {/* Left: Display info & rows per page selector */}
                <div className="flex items-center gap-2 text-sm">
                  <span>
                    Showing {(currentPage - 1) * rowsPerPage + 1}–
                    {Math.min(currentPage * rowsPerPage, jobCards.length)} of{" "}
                    {jobCards.length} jobcards
                  </span>
                  <label htmlFor="rowsPerPage" className="ml-4">
                    Rows per page:
                  </label>
                  <select
                    id="rowsPerPage"
                    value={rowsPerPage}
                    onChange={(e) => {
                      setRowsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1"
                  >
                    {[10, 25, 50, 100].map((count) => (
                      <option key={count} value={count}>
                        {count}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Right: Pagination buttons */}
                <div className="flex items-center gap-2">
                  {/* First */}
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    &laquo; First
                  </button>

                  {/* Prev */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>

                  {/* Condensed Pages with Ellipses */}
                  {(() => {
                    const pages = [];
                    const minPage = Math.max(2, currentPage - 1);
                    const maxPage = Math.min(totalPages - 1, currentPage + 1);

                    pages.push(
                      <button
                        key={1}
                        onClick={() => setCurrentPage(1)}
                        className={`px-3 py-1 border rounded text-sm ${
                          currentPage === 1
                            ? "bg-[#FF3C00] text-white border-[#FF3C00]"
                            : ""
                        }`}
                      >
                        1
                      </button>
                    );

                    if (minPage > 2) {
                      pages.push(
                        <span
                          key="start-ellipsis"
                          className="px-2 text-sm text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    for (let i = minPage; i <= maxPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-1 border rounded text-sm ${
                            currentPage === i
                              ? "bg-[#FF3C00] text-white border-[#FF3C00]"
                              : ""
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }

                    if (maxPage < totalPages - 1) {
                      pages.push(
                        <span
                          key="end-ellipsis"
                          className="px-2 text-sm text-gray-500"
                        >
                          ...
                        </span>
                      );
                    }

                    if (totalPages > 1) {
                      pages.push(
                        <button
                          key={totalPages}
                          onClick={() => setCurrentPage(totalPages)}
                          className={`px-3 py-1 border rounded text-sm ${
                            currentPage === totalPages
                              ? "bg-[#FF3C00] text-white border-[#FF3C00]"
                              : ""
                          }`}
                        >
                          {totalPages}
                        </button>
                      );
                    }

                    return pages;
                  })()}

                  {/* Next */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>

                  {/* Last */}
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Last &raquo;
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Create JobCard</h2>

           



            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>

            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
              disabled={!selectedRegion}
            >
              <option value="">Select Technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>

            <Select
              className="mb-4"
              options={customerOptions}
              value={
                customerOptions.find(
                  (opt) => opt.value === Number(selectedCustomer)
                ) || null
              }
              onChange={(selected) =>
                setSelectedCustomer(selected?.value.toString() || "")
              }
              onInputChange={(input) => setTypedCustomerName(input)}
              isDisabled={!selectedRegion}
              placeholder="Select Customer"
              isSearchable
              noOptionsMessage={() => (
                <div className="flex flex-col items-start gap-2">
                  <span>No customer found.</span>
                  <button
                    className="text-blue-600 underline text-sm"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      openCustomerModal(typedCustomerName);
                    }}
                  >
                    Create new customer
                  </button>
                </div>
              )}
            />

            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedJobType}
              onChange={(e) => {
                setSelectedJobType(e.target.value);
                setTampering("");
                setTamperingError(false);
              }}
            >
              <option value="">Select Job Type</option>
              {jobTypes.map((jt) => (
                <option key={jt.id} value={jt.id}>
                  {jt.name}
                </option>
              ))}
            </select>

            {selectedJobTypeName === "INSPECTION" && (
              <div className="mb-4">
                <label className="block mb-1 font-medium">TAMPERING</label>
                <div className="flex gap-4">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="tampering"
                      value="YES"
                      checked={tampering === "YES"}
                      onChange={() => setTampering("YES")}
                      className="mr-2"
                    />
                    YES
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name="tampering"
                      value="NO"
                      checked={tampering === "NO"}
                      onChange={() => setTampering("NO")}
                      className="mr-2"
                    />
                    NO
                  </label>
                </div>
                {tamperingError && (
                  <p className="text-red-600 text-sm mt-1">
                    Please select an option for tampering.
                  </p>
                )}
              </div>
            )}

            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedSupportAgent}
              onChange={(e) => {
                console.log("Selected support agent:", e.target.value);
                setSelectedSupportAgent(e.target.value);
              }}
            >
              <option value="">Select Support Agent</option>
              {supportAgents.map((sa) => (
                <option key={sa.id} value={sa.id}>
                  {sa.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Device IMEI"
              value={deviceImei}
              onChange={(e) => setDeviceImei(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            <input
              type="text"
              placeholder="Vehicle Registration"
              value={vehicleReg}
              onChange={(e) => setVehicleReg(e.target.value)}
              className="w-full mb-4 p-2 border border-gray-300 rounded"
            />

            <div className="mb-4">
              <label className="block mb-2 font-medium">Accessories</label>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                {accessories.map((acc) => (
                  <label key={acc.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={acc.id}
                      checked={selectedAccessories.includes(acc.id.toString())}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedAccessories((prev) =>
                          prev.includes(value)
                            ? prev.filter((v) => v !== value)
                            : [...prev, value]
                        );
                      }}
                      className="mr-2"
                    />
                    {acc.name}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-[#FF3C00] text-white px-4 py-2 rounded"
                onClick={handleCreateJobCard}
              >
                Generate ID
              </button>
            </div>
          </div>
        </div>
      )}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-sm">
            <h2 className="text-lg font-bold mb-4">Create Customer</h2>
            <input
              type="text"
              value={newCustomerName}
              onChange={(e) => setNewCustomerName(e.target.value)}
              className="w-full mb-3 p-2 border border-gray-300 rounded"
            />
            <select
              value={selectedRegion}
              disabled
              className="w-full mb-4 p-2 border border-gray-300 rounded bg-gray-100 text-gray-600"
            >
              <option>
                {regions.find((r) => r.id.toString() === selectedRegion)?.name}
              </option>
            </select>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-300 px-4 py-2 rounded"
                onClick={() => setShowCustomerModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-[#FF3C00] text-white px-4 py-2 rounded"
                onClick={handleCreateCustomerFromModal}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}


      {showEditModal && jobCardBeingEdited && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Edit JobCard</h2>
      
            {/* Region Dropdown */}
            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value)}
            >
              <option value="">Select Region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
      
            {/* Technician Dropdown */}
            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedTechnician}
              onChange={(e) => setSelectedTechnician(e.target.value)}
            >
              <option value="">Select Technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name}
                </option>
              ))}
            </select>
      
            {/* Customer Dropdown */}
            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedCustomer}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select Customer</option>
              {customers.map((cust) => (
                <option key={cust.id} value={cust.id}>
                  {cust.name}
                </option>
              ))}
            </select>
      
            {/* Job Type Dropdown */}
            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedJobType}
              onChange={(e) => setSelectedJobType(e.target.value)}
            >
              <option value="">Select Job Type</option>
              {jobTypes.map((jt) => (
                <option key={jt.id} value={jt.id}>
                  {jt.name}
                </option>
              ))}
            </select>
            {/* Tampering Section for INSPECTION */}
            {selectedJobTypeName === "INSPECTION" && (
  <div className="mb-4">
    <label className="block mb-1 font-medium">TAMPERING</label>
    <div className="flex gap-4">
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name="tampering"
          value="YES"
          checked={tampering === "YES"}
          onChange={() => setTampering("YES")}
          className="mr-2"
        />
        YES
      </label>
      <label className="inline-flex items-center">
        <input
          type="checkbox"
          name="tampering"
          value="NO"
          checked={tampering === "NO"}
          onChange={() => setTampering("NO")}
          className="mr-2"
        />
        NO
      </label>
    </div>
  </div>
              )}
      
            {/* Accessories Checkbox */}
            <div className="mb-4">
              <label className="block mb-2 font-medium">Accessories</label>
              <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded p-2">
                {accessories.map((acc) => (
                  <label key={acc.id} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={acc.id}
                      checked={selectedAccessories.includes(acc.id.toString())}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedAccessories((prev) =>
                          prev.includes(value)
                            ? prev.filter((v) => v !== value)
                            : [...prev, value]
                        );
                      }}
                      className="mr-2"
                    />
                    {acc.name}
                  </label>
                ))}
              </div>
            </div>
      
            {/* Support Agent Dropdown */}
            <select
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={selectedSupportAgent}
              onChange={(e) => setSelectedSupportAgent(e.target.value)}
            >
              <option value="">Select Support Agent</option>
              {supportAgents.map((sa) => (
                <option key={sa.id} value={sa.id}>
                  {sa.name}
                </option>
              ))}
            </select>
      
            {/* Device IMEI Input */}
             <input
            type="text"
            placeholder="Device IMEI"
            value={deviceImei}
            onChange={(e) => setDeviceImei(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
             />
      
            {/* Vehicle Registration Input */}
            <input
            type="text"
            placeholder="Vehicle Registration"
            value={vehicleReg}
            onChange={(e) => setVehicleReg(e.target.value)}
            className="w-full mb-4 p-2 border border-gray-300 rounded"
             />
      
            {/* Save and Cancel Buttons */}
            <div className="flex justify-end gap-3">
              <button
                className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                onClick={() => {
                resetForm();       // ✅ clear form state
                setShowEditModal(false);
             }}
              >
                Cancel
              </button>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                onClick={handleEditJobCard}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    
  );
};


export default JobCardPage;
