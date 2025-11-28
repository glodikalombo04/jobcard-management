// ...existing code...
import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";
import ImeiScannerModal from "./ImeiScannerModal";

type ItemType = {
    id: number;
    name: string;
    requires_serial: boolean;
    is_bulk: boolean;
};

type UserProfile = {
    id: number;
    user: number;
    role: string;
    role_display: string;
    region: number;
    warehouse: number;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

const CreateStockTakeModal = ({
    isOpen,
    onClose,
    onSuccess,
}: Props) => {
    const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
    const [stockCounts, setStockCounts] = useState<Record<number, number>>({});
    const [deviceImeis, setDeviceImeis] = useState<Record<number, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [showImeiModal, setShowImeiModal] = useState(false);
    const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);

    // used to show small UI when hovering a row (fixes "hoveredItemId" yellow underline)
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);

    const loadItemTypes = async () => {
        setLoading(true);
        try {
            const response = await fetchWithAuth("/inventory/itemtypes/");
            if (response && response.ok) {
                const data: ItemType[] = await response.json();
                setItemTypes(data);
                // Initialize stock counts and IMEI arrays to 0/empty for each item type
                const initialCounts: Record<number, number> = {};
                const initialImeis: Record<number, string[]> = {};
                data.forEach(item => {
                    initialCounts[item.id] = 0;
                    initialImeis[item.id] = [];
                });
                setStockCounts(initialCounts);
                setDeviceImeis(initialImeis);
            } else {
                console.error("Failed to load Item Types");
            }
        } catch (error) {
            console.error("Error loading item types:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadItemTypes();
        }
    }, [isOpen]);

    const handleQuantityChange = (itemTypeId: number, quantity: string) => {
        const numQuantity = parseInt(quantity) || 0;
        setStockCounts(prev => ({
            ...prev,
            [itemTypeId]: numQuantity
        }));
    };

    const handleImeiScanClick = (itemType: ItemType) => {
        setSelectedItemType(itemType);
        setShowImeiModal(true);
    };

    const handleImeiSubmit = (imeiNumbers: string[]) => {
        if (selectedItemType) {
            // Check for duplicates across all device types
            const allExistingImeis = Object.values(deviceImeis).flat();
            const duplicates = imeiNumbers.filter(imei => allExistingImeis.includes(imei));

            if (duplicates.length > 0) {
                alert(`Duplicate IMEI(s) found: ${duplicates.join(', ')}. These devices have already been scanned for other item types.`);
                return;
            }

            // Update IMEI list and set quantity to match IMEI count
            setDeviceImeis(prev => ({
                ...prev,
                [selectedItemType.id]: imeiNumbers
            }));

            setStockCounts(prev => ({
                ...prev,
                [selectedItemType.id]: imeiNumbers.length
            }));

            console.log(`IMEIs for ${selectedItemType.name}:`, imeiNumbers);
        }
        setShowImeiModal(false);
        setSelectedItemType(null);
    };

    const handleSubmit = async () => {
        setSubmitting(true);

        try {
            // Step 1: Get user profile information
            console.log("Step 1: Getting user profile...");
            const userProfileResponse = await fetchWithAuth("/core/user-profile/me/");

            if (!userProfileResponse || !userProfileResponse.ok) {
                console.error("Failed to get user profile");
                alert("Failed to get user profile. Please try again.");
                return;
            }

            const userProfile: UserProfile = await userProfileResponse.json();
            console.log("User Profile:", userProfile);

            // Step 2: Create stock take overview
            console.log("Step 2: Creating stock take overview...");
            const stockTakeData = {
                user: userProfile.user,
                location: userProfile.warehouse
            };

            const stockTakeResponse = await fetchWithAuth("/inventory/stock-take-overview/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stockTakeData)
            });

            if (!stockTakeResponse || !stockTakeResponse.ok) {
                console.error("Failed to create stock take");
                alert("Failed to create stock take. Please try again.");
                return;
            }

            const createdStockTake = await stockTakeResponse.json();
            console.log("Created Stock Take:", createdStockTake);

            // Step 3: Create stock take items (only for items with quantity > 0)
            const stockItemsToCreate = Object.entries(stockCounts)
                .filter(([_, quantity]) => quantity > 0)
                .map(([itemTypeId, quantity]) => ({
                    stock_take: createdStockTake.id,
                    item_type: parseInt(itemTypeId),
                    quantity: quantity
                }));

            console.log("Step 3: Creating stock take items...", stockItemsToCreate);

            // Create all stock take items and collect their IDs for serial number creation
            const createdStockTakeItems: Array<{ id: number, item_type: number }> = [];

            for (const stockItem of stockItemsToCreate) {
                const itemResponse = await fetchWithAuth("/inventory/stock-take-items/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(stockItem)
                });

                if (!itemResponse || !itemResponse.ok) {
                    console.error("Failed to create stock take item:", stockItem);
                    // Continue with other items even if one fails
                } else {
                    const createdItem = await itemResponse.json();
                    console.log("Created Stock Take Item:", createdItem);
                    createdStockTakeItems.push({
                        id: createdItem.id,
                        item_type: stockItem.item_type
                    });
                }
            }

            // Step 4: Create serial numbers for items that require serials
            console.log("Step 4: Creating serial numbers for scanned devices...");

            for (const stockTakeItem of createdStockTakeItems) {
                const itemTypeId = stockTakeItem.item_type;
                const imeiList = deviceImeis[itemTypeId];

                if (imeiList && imeiList.length > 0) {
                    console.log(`Creating ${imeiList.length} serial records for stock take item ${stockTakeItem.id}`);

                    // Create serial number records for each IMEI
                    for (const imei of imeiList) {
                        const serialData = {
                            stock_take_item: stockTakeItem.id,
                            serial_number: imei
                        };

                        const serialResponse = await fetchWithAuth("/inventory/stock-take-items-serials/", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(serialData)
                        });

                        if (!serialResponse || !serialResponse.ok) {
                            console.error("Failed to create serial number:", serialData);
                            // Continue with other serials even if one fails
                        } else {
                            const createdSerial = await serialResponse.json();
                            console.log("Created Serial Number:", createdSerial);
                        }
                    }
                }
            }

            console.log("Stock take submission completed successfully!");
            alert("Stock take submitted successfully!");

            // Close modal and reset
            onSuccess?.();
            onClose();

        } catch (error) {
            console.error("Error during stock take submission:", error);
            alert("An error occurred while submitting the stock take. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-2/3 max-w-4xl shadow-lg max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        New Stock Take Form
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-gray-500">Loading item types...</div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {(() => {
                            const serialItems = itemTypes.filter(item => item.requires_serial);
                            const bulkItems = itemTypes.filter(item => !item.requires_serial);

                            return (
                                <>
                                    {/* Serial Items Section */}
                                    {serialItems.length > 0 && (
                                        <div>
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    Devices
                                                </h3>
                                                <p className="text-sm text-red-600 mt-1">
                                                    Each device serial number needs to be scanned.
                                                </p>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border border-gray-200">
                                                    <thead className="bg-blue-50">
                                                        <tr>
                                                            <th className="border px-4 py-2 text-left">Item Name</th>
                                                            <th className="border px-4 py-2 text-left">Quantity in Stock</th>
                                                            <th className="border px-4 py-2 text-left">Click to Scan</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {serialItems.map((itemType) => (
                                                            <tr key={itemType.id} className="hover:bg-gray-50">
                                                                <td className="border px-4 py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {itemType.name}
                                                                    </div>
                                                                </td>
                                                                <td
                                                                    className="border px-4 py-2 relative"
                                                                    onMouseEnter={() => setHoveredItemId(itemType.id)}
                                                                    onMouseLeave={() => setHoveredItemId(null)}
                                                                >
                                                                    <div className="relative">
                                                                        <input
                                                                            type="text"
                                                                            value={stockCounts[itemType.id] || 0}
                                                                            disabled={true}
                                                                            className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-100 cursor-not-allowed text-center font-semibold"
                                                                        />

                                                                        {/* show scanned count badge when hovering the row */}
                                                                        {hoveredItemId === itemType.id && (
                                                                            <div className="absolute right-2 top-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                                                                                {deviceImeis[itemType.id]?.length || 0} scanned
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    <button
                                                                        onClick={() => handleImeiScanClick(itemType)}
                                                                        className="bg-[#FF3C00] text-white px-4 py-2 rounded hover:bg-[#e63900] flex items-center gap-2"
                                                                    >
                                                                        {deviceImeis[itemType.id]?.length > 0 ? 'View Devices' : 'Scan Devices'}
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Bulk Items Section */}
                                    {bulkItems.length > 0 && (
                                        <div>
                                            <div className="mb-4">
                                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                                    Accessories
                                                </h3>
                                                <p className="text-sm text-grey-600 mt-1">Fill in the quantity currently in stock.</p>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <table className="min-w-full border border-gray-200">
                                                    <thead className="bg-green-50">
                                                        <tr>
                                                            <th className="border px-4 py-2 text-left">Item Name</th>
                                                            <th className="border px-4 py-2 text-left">Quantity in Stock</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {bulkItems.map((itemType) => (
                                                            <tr key={itemType.id} className="hover:bg-gray-50">
                                                                <td className="border px-4 py-2">
                                                                    <div className="flex items-center gap-2">
                                                                        {itemType.name}
                                                                    </div>
                                                                </td>
                                                                <td className="border px-4 py-2">
                                                                    <input
                                                                        type="text"
                                                                        inputMode="numeric"
                                                                        pattern="[0-9]*"
                                                                        placeholder="0"
                                                                        value={stockCounts[itemType.id] === 0 ? "" : stockCounts[itemType.id] || ""}
                                                                        onChange={(e) => handleQuantityChange(itemType.id, e.target.value)}
                                                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:border-green-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                    />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Empty State */}
                                    {itemTypes.length === 0 && (
                                        <div className="text-center py-8 text-gray-500">
                                            No item types found
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-[#FF3C00] text-white hover:bg-[#e63900] disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading || submitting}
                    >
                        {submitting ? "Submitting..." : "Submit Stock Take"}
                    </button>
                </div>

                <ImeiScannerModal
                    isOpen={showImeiModal}
                    onClose={() => setShowImeiModal(false)}
                    onSubmit={handleImeiSubmit}
                    itemTypeName={selectedItemType?.name || ""}
                    existingImeis={selectedItemType ? deviceImeis[selectedItemType.id] || [] : []}
                />
            </div>
        </div>
    );
};

export default CreateStockTakeModal;
