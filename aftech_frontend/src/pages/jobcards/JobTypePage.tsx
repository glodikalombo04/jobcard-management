import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import JobTypeModal from "./JobTypeModal";

type JobType = {
  id: number;
  name: string;
};

const JobTypePage = () => {
  const [jobTypes, setJobTypes] = useState<JobType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedJobType, setSelectedJobType] = useState<JobType | null>(null);

  const loadJobTypes = async () => {
    const response = await fetchWithAuth(
      "/jobcards/job-types/"
    );
    if (response && response.ok) {
      const data: JobType[] = await response.json();
      setJobTypes(data);
    } else {
      console.error("Failed to load job types");
    }
  };

  useEffect(() => {
    loadJobTypes();
  }, []);

  const handleSubmit = async (name: string) => {
    if (modalMode === "create") {
      const response = await fetchWithAuth(
        "/jobcards/job-types/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );
      if (response.ok) {
        const newType = await response.json();
        setJobTypes((prev) => [...prev, newType]);
      } else {
        console.error("Failed to create job type");
      }
    } else if (modalMode === "edit" && selectedJobType) {
      const response = await fetchWithAuth(
        `/jobcards/job-types/${selectedJobType.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );
      if (response.ok) {
        const updated = await response.json();
        setJobTypes((prev) =>
          prev.map((jt) => (jt.id === updated.id ? updated : jt))
        );
      } else {
        console.error("Failed to update job type");
      }
    }

    setShowModal(false);
    setSelectedJobType(null);
  };

  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedJobType(null);
    setShowModal(true);
  };

  const handleEditClick = (type: JobType) => {
    setModalMode("edit");
    setSelectedJobType(type);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Job Types</h1>
        <button
          onClick={handleCreateClick}
          className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63900]"
        >
          Create Job Type
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <ul className="list-disc pl-6">
          {jobTypes.map((type) => (
            <li key={type.id}>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleEditClick(type)}
              >
                {type.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <JobTypeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleSubmit}
        mode={modalMode}
        initialName={selectedJobType?.name}
      />
    </div>
  );
};

export default JobTypePage;
