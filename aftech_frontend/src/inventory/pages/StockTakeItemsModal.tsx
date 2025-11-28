import { useEffect, useState } from "react";
import { fetchWithAuth } from "../../utils/api";

type StockTakeItem = {
    id: number;
    stock_take: number;
    item_type: number;
    item_type_name: string;
    quantity: number;
};

type Props = {
    isOpen: boolean;
    onClose: () => void;
    stockTakeId: number | null;
    stockTakeName?: string;
};

const StockTakeItemsModal = ({
    isOpen,
    onClose,
    stockTakeId,
    stockTakeName
}: Props) => {
    const [stockTakeItems, setStockTakeItems] = useState<StockTakeItem[]>([]);
    const [loading, setLoading] = useState(false);

    const loadStockTakeItems = async (id: number) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(
                `/inventory/stock-take-items/?id=${id}`
            );
            if (response && response.ok) {
                const data: StockTakeItem[] = await response.json();
                setStockTakeItems(data);
            } else {
                console.error("Failed to load Stock Take Items");
                setStockTakeItems([]);
            }
        } catch (error) {
            console.error("Error loading stock take items:", error);
            setStockTakeItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && stockTakeId) {
            loadStockTakeItems(stockTakeId);
        }
    }, [isOpen, stockTakeId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-2/3 max-w-4xl shadow-lg max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {stockTakeName || `ID: ${stockTakeId}`}
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
                        <div className="text-gray-500">Loading stock take items...</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full border border-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-4 py-2 text-left">Item Type</th>
                                    <th className="border px-4 py-2 text-left">Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockTakeItems.length > 0 ? (
                                    stockTakeItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="border px-4 py-2">{item.item_type_name}</td>
                                            <td className="border px-4 py-2">{item.quantity}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={2} className="text-center py-4 text-gray-500">
                                            No items found for this stock take
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StockTakeItemsModal;