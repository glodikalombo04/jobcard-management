import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import Select from "react-select";
import { saveAs } from "file-saver"; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


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
  accessories: number[];     
  accessories_name: string[]; 
  tampering?: string;  

};

type Region = { id: number; name: string };
type Technician = { id: number; name: string };
type Customer = { id: number; name: string };
type JobType = { id: number; name: string };
type SupportAgent = { id: number; name: string };
type Accessory = { id: number; name: string };

const JobCardPage = () => {

    // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false); // Track if all data is loaded
  const [allJobCards, setAllJobCards] = useState<JobCard[]>([]); // Store all fetched data




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


  const [columnFilters, setColumnFilters] = useState({
  unique_id: "",
  region_name: "",
  technician_name: "",
  customer_name: "",
  job_type_name: "",
   accessories: "",
  support_agent_name: "",
  device_imei: "",
  vehicle_reg: "",
  tampering: "",
  created_at: "",});


  // Fetch jobcards with pagination
  useEffect(() => {
    const fetchJobCards = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          `/jobcards/jobcards/?page=${page}&page_size=${pageSize}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch job cards");
        }
        const data = await response.json();
        setJobCards(data.results || []);
        setTotalCount(data.count || 0);
      } catch (error) {
        console.error("Error fetching job cards:", error);
        setErrorMessage(
          "Failed to load job cards. Please check your connection or login status."
        );
      } finally {
        setLoading(false);
      }
    };

    if (!allDataLoaded) {
      fetchJobCards();
    }
  }, [page, pageSize, allDataLoaded]);


  // Fetch ALL jobcards (no pagination)
  const fetchAllJobCards = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("/jobcards/jobcards/?page_size=10000");
      if (!response.ok) {
        throw new Error("Failed to fetch all job cards");
      }
      const data = await response.json();
      setAllJobCards(data.results || []);
      setAllDataLoaded(true);
      setPageSize(25); // Reset to default view
    } catch (error) {
      console.error("Error fetching all job cards:", error);
      toast.error("Failed to load all job cards");
    } finally {
      setLoading(false);
    }
  };



  const handleColumnFilterChange = (col: string, value: string) => {
  setColumnFilters((prev) => ({ ...prev, [col]: value }));
  };



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
        "/jobcards/customers/",
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
      toast.success("Customer created successfully!");
    } catch (error) {
      console.error("Error creating customer:", error);
      toast.error("Failed to create customer. Try again.");
    }
  };


  const fetchRegions = async () => {
    try {
      const response = await fetchWithAuth(
        "/jobcards/regions/"
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
          `/jobcards/technicians/?region=${regionId}`
        ),
        fetchWithAuth(
          `/jobcards/customers/?region=${regionId}`
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
        fetchWithAuth("/jobcards/job-types/"),
        fetchWithAuth("/jobcards/support-agents/"),
        fetchWithAuth("/jobcards/accessories/"),
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
        "/jobcards/jobcards/",
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
      setNewlyCreatedId(createdJobCard.unique_id || (createdJobCard.jobcard && createdJobCard.jobcard.unique_id) || null);
      
      // Refresh: go to page 1 (fast because only 25 items)
      setPage(1);

      resetForm();
      setShowModal(false);

      toast.success("Job card created successfully!");
      
    } catch (error) {
      console.error("Error creating job card:", error);
      toast.error("Please check if all the required fields are correctly filled");
    }
  };


  const handleEditButtonClick = async (card: JobCard) => {
    await fetchRegions();

    const techRes = await fetchWithAuth(
      `/jobcards/technicians/?region=${
        regions.find((r) => r.name === card.region_name)?.id || ""
      }`
    );
    const custRes = await fetchWithAuth(
      `/jobcards/customers/?region=${
        regions.find((r) => r.name === card.region_name)?.id || ""
      }`
    );

    const techs = techRes.ok ? await techRes.json() : [];
    const custs = custRes.ok ? await custRes.json() : [];

    setTechnicians(techs);
    setCustomers(custs);

    await fetchJobcardMeta();

    setJobCardBeingEdited(card);

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
        tampering: selectedJobTypeName === "INSPECTION" ? tampering : null, //add this

      };
      if (
        !selectedRegion ||
        !selectedTechnician ||
        !selectedCustomer ||
        !selectedJobType ||
        !selectedSupportAgent
         ) {
            toast.error("Please fill in all required fields before saving.");
            return;
        }

  
      const response = await fetchWithAuth(
        `/jobcards/jobcards/${jobCardBeingEdited.id}/`,
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

      setPage(1);

      setShowEditModal(false);
      toast.success("Job card updated successfully!");
    } catch (error) {
      console.error("Error updating job card:", error);
      toast.error("Something went wrong while updating the job card. Please check if all the fields are correctly filled");
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



  
  // Apply search + column filters to appropriate dataset
  const getFilteredJobCards = () => {
    const dataSource = allDataLoaded ? allJobCards : jobCards;
    const query = searchQuery.toLowerCase();

    return dataSource.filter((card) => {
      const accFilter = columnFilters.accessories;
      const tamperFilter = columnFilters.tampering;

      // Search across all columns
      const matchesSearch =
        !query ||
        card.unique_id.toLowerCase().includes(query) ||
        card.region_name.toLowerCase().includes(query) ||
        card.technician_name.toLowerCase().includes(query) ||
        card.customer_name.toLowerCase().includes(query) ||
        card.job_type_name.toLowerCase().includes(query) ||
        card.support_agent_name.toLowerCase().includes(query) ||
        card.device_imei.toLowerCase().includes(query) ||
        card.vehicle_reg.toLowerCase().includes(query) ||
        (card.tampering && card.tampering.toLowerCase().includes(query)) ||
        new Date(card.created_at).toLocaleString().toLowerCase().includes(query) ||
        (card.accessories_name &&
          card.accessories_name.some((acc) => acc.toLowerCase().includes(query)));

 
      // Apply column-specific filters
      const matchesColumnFilters =
        card.unique_id.toLowerCase().includes(columnFilters.unique_id.toLowerCase()) &&
        card.region_name.toLowerCase().includes(columnFilters.region_name.toLowerCase()) &&
        card.technician_name.toLowerCase().includes(columnFilters.technician_name.toLowerCase()) &&
        card.customer_name.toLowerCase().includes(columnFilters.customer_name.toLowerCase()) &&
        card.job_type_name.toLowerCase().includes(columnFilters.job_type_name.toLowerCase()) &&
        card.support_agent_name.toLowerCase().includes(columnFilters.support_agent_name.toLowerCase()) &&
        card.device_imei.toLowerCase().includes(columnFilters.device_imei.toLowerCase()) &&
        card.vehicle_reg.toLowerCase().includes(columnFilters.vehicle_reg.toLowerCase()) &&
        (accFilter === "" || (card.accessories_name && card.accessories_name.includes(accFilter))) &&
        (tamperFilter === "" || (card.tampering || "None") === tamperFilter);

      return matchesSearch && matchesColumnFilters;
    });
  };

 const filteredJobCards = getFilteredJobCards();

  const selectedJobTypeName = jobTypes.find(
    (jt) => jt.id.toString() === selectedJobType
  )?.name;

  // Get options from the appropriate dataset
  const dataSource = allDataLoaded ? allJobCards : jobCards;
  const accessoryOptions = Array.from(
    new Set(dataSource.flatMap((card) => card.accessories_name || []))
  );
  const tamperingOptions = Array.from(
    new Set(dataSource.map((card) => card.tampering || "None"))
  );

  const handleExport = () => {
    if (filteredJobCards.length === 0) {
      toast.error("No data to export");
      return;
    }
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
        "Tampering",
        "Created At",
      ],
      ...filteredJobCards.map((card) => [
        card.unique_id,
        card.region_name,
        card.technician_name,
        card.customer_name,
        card.job_type_name,
        card.accessories_name.join("; "),
        card.support_agent_name,
        card.device_imei,
        card.vehicle_reg,
        card.job_type_name === "INSPECTION" ? card.tampering || "N/A" : "N/A",
        new Date(card.created_at).toLocaleString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `filtered_jobcards_${new Date().getTime()}.csv`);
    toast.success("data exportedsuccessfully");
  };

  const handleReturnToPagination = () => {
    setAllDataLoaded(false);
    setPage(1);
    setSearchQuery("");
    setColumnFilters({
      unique_id: "",
      region_name: "",
      technician_name: "",
      customer_name: "",
      job_type_name: "",
      accessories: "",
      support_agent_name: "",
      device_imei: "",
      vehicle_reg: "",
      tampering: "",
      created_at: "",
    });
  };

  
  const totalPages = allDataLoaded ? 1 : Math.ceil(totalCount / pageSize);


 
   return (
    <div className="p-6">
   <ToastContainer   position="top-right"
  autoClose={4000}
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  rtl={false}
  pauseOnFocusLoss
  draggable
  pauseOnHover
  theme="light" /> 
  
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">All JobCards</h1>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search all columns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      
      {/* Data mode indicator */}
      <div className="mb-4 flex items-center gap-2">
        {allDataLoaded ? (
          <>
            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded">
              Viewing ALL {filteredJobCards.length} records, you may export filtered data based on your search and column filters.
            </span>
            <button
              className="text-sm bg-gray-300 px-2 py-1 rounded hover:bg-red-600"
              onClick={handleReturnToPagination}
            >
              Back to Pagination
            </button>
          </>
        ) : (
          <button
            className="text-sm bg-[#FF3C00] text-white px-3 py-1 rounded hover:bg-green-500"
            onClick={fetchAllJobCards}
          >
            Load All Data
          </button>
        )}
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
              className="ml-4 bg-[#ff3c00] text-white px-3 py-1 rounded hover:bg-[#e63a00]"
            >
              Copy ID
            </button>
          </div>
        </div>
      )}

      {errorMessage && <p className="text-red-600 mb-4">{errorMessage}</p>}

      <div className="bg-white p-6 rounded shadow">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading jobcards...</span>
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-hidden">
              <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
                <table className="min-w-[1200px] table-auto text-sm border-collapse border border-gray-300 w-full">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className=" bg-gray-100">
                      <th className="border px-4 py-2" >JobCard ID</th>
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
                     <tr className="bg-gray-100 text-xs">
                      <th>
                        <input
                          value={columnFilters.unique_id}
                          onChange={(e) => handleColumnFilterChange("unique_id", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                      <th>
                        <input
                          value={columnFilters.region_name}
                          onChange={(e) => handleColumnFilterChange("region_name", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                      <th>
                        <input
                          value={columnFilters.technician_name}
                          onChange={(e) => handleColumnFilterChange("technician_name", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                      <th>
                        <input
                          value={columnFilters.customer_name}
                          onChange={(e) => handleColumnFilterChange("customer_name", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                      <th>
                        <input
                          value={columnFilters.job_type_name}
                          onChange={(e) => handleColumnFilterChange("job_type_name", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                       <th>
                        <select
                          value={columnFilters.accessories}
                          onChange={(e) => handleColumnFilterChange("accessories", e.target.value)}
                          className="w-full border p-1 rounded"
                        >
                          <option value="">All</option>
                          {accessoryOptions.map((acc) => (
                            <option key={acc} value={acc}>
                              {acc}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th>
                        <input
                          value={columnFilters.support_agent_name}
                          onChange={(e) => handleColumnFilterChange("support_agent_name", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                        <th>
                        <input
                          value={columnFilters.device_imei}
                          onChange={(e) => handleColumnFilterChange("device_imei", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                      <th>
                        <input
                          value={columnFilters.vehicle_reg}
                          onChange={(e) => handleColumnFilterChange("vehicle_reg", e.target.value)}
                          className="w-full border p-1 rounded"
                          placeholder="search"
                        />
                      </th>
                       <th>
                        <select
                          value={columnFilters.tampering}
                          onChange={(e) => handleColumnFilterChange("tampering", e.target.value)}
                          className="w-full border p-1 rounded"
                        >
                          <option value="">All</option>
                          {tamperingOptions.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </th>
                      <th></th>
                      <th></th>
                    </tr>
                  </thead>
                  {/* tbody: show either rows or a single "no data" row while keeping header */}
                  {filteredJobCards.length === 0 ? (
                    <tbody>
                      <tr>
                        <td colSpan={12} className="text-center py-8 text-gray-600">
                          No job cards found.
                        </td>
                      </tr>
                    </tbody>
                  ) : (
                   <tbody>
                    {filteredJobCards.map((card) => (
                      <tr key={card.id} className="hover:bg-blue-50 transition-all duration-300 hover:shadow-md cursor-pointer transform hover:scale-[1.01]">
                        <td className="border px-4 py-2 whitespace-nowrap">{card.unique_id}</td>
                        <td className="border px-4 py-2 whitespace-nowrap">{card.region_name}</td>
                        <td className="border px-4 py-2 whitespace-nowrap">{card.technician_name}</td>
                        <td className="border px-4 py-2 whitespace-nowrap">{card.customer_name}</td>
                        <td className="border px-4 py-2 whitespace-nowrap">{card.job_type_name}</td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {card.accessories_name && card.accessories_name.length > 0
                            ? card.accessories_name.join(", ")
                            : "None"}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">{card.support_agent_name}</td>
                        <td className="border px-4 py-2 truncate max-w-[160px]">{card.device_imei}</td>
                        <td className="border px-4 py-2 whitespace-nowrap">{card.vehicle_reg}</td>
                        <td className="border px-4 py-2">
                          {card.job_type_name === "INSPECTION" ? card.tampering || "N/A" : "N/A"}
                        </td>
                        <td className="border px-4 py-2 whitespace-nowrap">
                          {new Date(card.created_at).toLocaleString()}
                        </td>
                        <td className="border px-4 py-2">
                          <button
                            className="bg-yellow-400 text-white px-3 py-1 rounded hover:bg-red-500"
                            onClick={() => handleEditButtonClick(card)}
                          >
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  )}
                </table>
              </div>
            </div>
      {/* Pagination Controls - only show if not viewing all */}
      {!allDataLoaded && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span>
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, totalCount)} of {totalCount} jobcards
            </span>
            <label htmlFor="pageSize" className="ml-4">
              Rows per page:
            </label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
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

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              &laquo; First
            </button>

            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              Previous
            </button>

            <span className="text-sm font-medium px-3">
              Page {page} of {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
            >
              Next
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-gray-100"
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
                resetForm();       // clear form state
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
