import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import StockTakeItemsModal from "./StockTakeItemsModal";
import CreateStockTakeModal from "./CreateStockTakeModal";

type StockTakes = {
    id: number;
    user: number;
    location: number;
    created_at: string;
    display_name: string;
};

type UserProfile = {
    id: number;
    user: number;
    role: string;
    role_display: string;
    region: number;
    warehouse: number;
};

const StockTakePage = () => {
    const [stockTakes, setStockTakes] = useState<StockTakes[]>([]);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [showItemsModal, setShowItemsModal] = useState(false);
    const [selectedStockTakeId, setSelectedStockTakeId] = useState<number | null>(null);
    const [selectedStockTakeName, setSelectedStockTakeName] = useState<string>("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const loadUserProfile = async (): Promise<UserProfile | null> => {
        try {
            const response = await fetchWithAuth("/core/user-profile/me/");
            if (response && response.ok) {
                const profile: UserProfile = await response.json();
                setUserProfile(profile);
                return profile;
            } else {
                setErrorMessage("Failed to load user profile");
                return null;
            }
        } catch (error) {
            setErrorMessage(`Error loading user profile: ${error}`);
            return null;
        }
    };

    const loadStockTakes = async (userProfile: UserProfile | null) => {
        setLoading(true);
        try {
            let apiUrl = "/inventory/stock-take-overview";

            if (userProfile?.role === "regional_manager") {
                apiUrl += `?user=${userProfile.user}`;
            }

            const response = await fetchWithAuth(apiUrl);
            if (response && response.ok) {
                const data: StockTakes[] = await response.json();
                setStockTakes(data);
            }
        } catch (error) {
            setErrorMessage(`"Error loading stock takes:", error`);
        } finally {
            setLoading(false);
        }
    };

    const loadData = async () => {
        const profile = await loadUserProfile();
        await loadStockTakes(profile);
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleViewClick = (stockTake: StockTakes) => {
        setSelectedStockTakeId(stockTake.id);
        setSelectedStockTakeName(stockTake.display_name);
        setShowItemsModal(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Stock Take</h1>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63900]"
                >
                    New Stock Take
                </button>
            </div>

            {errorMessage && <p className="mb-4 bg-red-100 text-red-800 px-4 py-2 rounded shadow">{errorMessage}</p>}


            <div className="bg-white p-4 rounded shadow">

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Loading stock takes...</div>
                    </div>
                ) : (
                    <table className="min-w-full border border-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border px-4 py-2 text-left">Historical Stock Takes</th>
                                <th className="border px-4 py-2 text-left">Summary</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockTakes.length > 0 ? (
                                stockTakes.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">
                                            {item.display_name}
                                        </td>
                                        <td className="border px-4 py-2">
                                            <button
                                                onClick={() => handleViewClick(item)}
                                                className="text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={2} className="text-center py-4 text-gray-500">
                                        {userProfile?.role === 'regional_manager'
                                            ? 'No historical stock takes found for your user.'
                                            : 'No stock takes found.'
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <StockTakeItemsModal
                isOpen={showItemsModal}
                onClose={() => setShowItemsModal(false)}
                stockTakeId={selectedStockTakeId}
                stockTakeName={selectedStockTakeName}
            />

            <CreateStockTakeModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => loadData()}
            />
        </div>
    );
};

export default StockTakePage;
