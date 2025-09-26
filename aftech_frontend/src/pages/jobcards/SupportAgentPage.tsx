import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import SupportAgentModal from "./CreateAgentModal"; // make sure path is correct

type SupportAgent = {
  id: number;
  name: string;
};

const SupportAgentPage = () => {
  const [supportAgents, setSupportAgents] = useState<SupportAgent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedAgent, setSelectedAgent] = useState<SupportAgent | null>(null);

  const loadSupportAgent = async () => {
    const response = await fetchWithAuth(
      "/jobcards/support-agents"
    );
    if (response && response.ok) {
      const data: SupportAgent[] = await response.json();
      setSupportAgents(data);
    } else {
      console.error("Failed to load Support Agents");
    }
  };

  useEffect(() => {
    loadSupportAgent();
  }, []);

  const handleModalSubmit = async (name: string) => {
    if (modalMode === "create") {
      const response = await fetchWithAuth(
        "/jobcards/support-agents/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );
      if (response.ok) {
        const newAgent = await response.json();
        setSupportAgents((prev) => [...prev, newAgent]);
      } else {
        console.error("Failed to create support agent");
      }
    } else if (modalMode === "edit" && selectedAgent) {
      const response = await fetchWithAuth(
        `/jobcards/support-agents/${selectedAgent.id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        }
      );
      if (response.ok) {
        const updated = await response.json();
        setSupportAgents((prev) =>
          prev.map((a) => (a.id === updated.id ? updated : a))
        );
      } else {
        console.error("Failed to update support agent");
      }
    }

    setShowModal(false);
    setSelectedAgent(null);
  };

  const handleCreateClick = () => {
    setModalMode("create");
    setSelectedAgent(null);
    setShowModal(true);
  };

  const handleEditClick = (agent: SupportAgent) => {
    setModalMode("edit");
    setSelectedAgent(agent);
    setShowModal(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold mb-4">Support Agents</h1>
        <button
          onClick={handleCreateClick}
          className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63900]"
        >
          Create Support Agent
        </button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <ul className="list-disc pl-6">
          {supportAgents.map((agent) => (
            <li key={agent.id}>
              <button
                className="text-blue-600 hover:underline"
                onClick={() => handleEditClick(agent)}
              >
                {agent.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <SupportAgentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        mode={modalMode}
        initialName={selectedAgent?.name}
      />
    </div>
  );
};

export default SupportAgentPage;
