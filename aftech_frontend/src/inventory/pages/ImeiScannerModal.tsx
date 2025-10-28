import { useState, useEffect } from "react";

type Props = {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (imeiNumbers: string[]) => void;
    itemTypeName: string;
    existingImeis?: string[];
};

const ImeiScannerModal = ({
    isOpen,
    onClose,
    onSubmit,
    itemTypeName,
    existingImeis = []
}: Props) => {
    const [imeiInput, setImeiInput] = useState<string>("");
    const [imeiList, setImeiList] = useState<string[]>(existingImeis);
    const [error, setError] = useState<string>("");

    // Update imeiList when existingImeis prop changes
    useEffect(() => {
        setImeiList(existingImeis);
    }, [existingImeis]);

    const handleAddImei = () => {
        const trimmedImei = imeiInput.trim();

        if (!trimmedImei) {
            setError("Please enter an IMEI number");
            return;
        }

        // Validate IMEI length - must be exactly 15 characters
        if (trimmedImei.length !== 15) {
            setError("IMEI must be 15 characters long");
            return;
        }

        // Check for duplicates within current list
        if (imeiList.includes(trimmedImei)) {
            setError("This IMEI has already been scanned");
            return;
        }

        // Add IMEI to list
        setImeiList(prev => [...prev, trimmedImei]);
        setImeiInput("");
        setError("");
    };

    const handleRemoveImei = (index: number) => {
        setImeiList(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        // Allow submitting empty list (0 devices) - this allows users to reset item counts
        onSubmit(imeiList);
        // Reset state
        setImeiList([]);
        setImeiInput("");
        setError("");
        onClose();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddImei();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                        Scan Devices - {itemTypeName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                        ×
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Device IMEI
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={imeiInput}
                                onChange={(e) => setImeiInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter or scan IMEI"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded"
                                autoFocus
                            />
                            <button
                                onClick={handleAddImei}
                                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                            

                            >
                                Add
                            </button>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Scanned Devices: {imeiList.length}
                        </label>
                        <div className="bg-gray-50 border rounded p-2 max-h-40 overflow-y-auto">
                            {imeiList.length > 0 ? (
                                <div className="space-y-1">
                                    {imeiList.map((imei, index) => (
                                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded">
                                            <span className="font-mono text-sm">{imei}</span>
                                            <button
                                                onClick={() => handleRemoveImei(index)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm text-center py-4">
                                    No devices scanned yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded bg-[#FF3C00] text-white hover:bg-[#e63900]"
                    >
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImeiScannerModal;