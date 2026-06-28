import React, {useEffect, useState} from "react";
import api from "../../services/api";
import {useResources, useTerritories} from "../../functions/data";
import type { BuildInfo } from '../../types';

interface ExternalBuildModalProps {
    territoryId: string;
    setIsOpen: (isOpen: boolean) => void;
}

// Helper to format building name for image path
const formatBuildingNameForImage = (name: string): string => {
    if (!name) return '';
    const formatted = name.charAt(0).toLowerCase() + name.slice(1);
    return formatted.replace(/\s+/g, ''); // Remove spaces if any
};

const ExternalBuildModal: React.FC<ExternalBuildModalProps> = ({territoryId, setIsOpen}) => {
    const {resources, hasEnoughResources, subtractResources, refreshResources} = useResources();
    const {fetchTerritories} = useTerritories();
    const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
    const [selectedBuilding, setSelectedBuilding] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchBuildInfo = async () => {
            try {
                const response = await api.get(`/game/buildings/external/info/`);
                const data: BuildInfo = response.data;
                setBuildInfo(data);
                // Set the first building as selected by default
                if (data && Object.keys(data).length > 0) {
                    setSelectedBuilding(Object.keys(data)[0]);
                }
            } catch (error) {
                console.error("Failed to fetch building info:", error);
            }
        };
        fetchBuildInfo();
    }, []);

    if (!buildInfo || !territoryId || Object.keys(buildInfo).length < 1 || !selectedBuilding) {
        return null;
    }

    const selectedBuildingData = buildInfo[selectedBuilding];
    const canAfford = hasEnoughResources(selectedBuildingData.cost);

    const build = async () => {
        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        try {
            await api.post(`/game/buildings/external/build/`, {
                territory: territoryId,
                building_type: selectedBuilding,
            });

            subtractResources(selectedBuildingData.cost);
            await Promise.all([
                fetchTerritories(),
                refreshResources(),
            ]);
            setIsOpen(false)
        } catch (error) {
            console.error("Failed to build external building:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    interface ResourceItemProps {
        icon: string;
        value: number;
        hasEnough: boolean;
    }

    const ResourceItem: React.FC<ResourceItemProps> = ({icon, value, hasEnough}) => (
        <div
            className={`flex items-center gap-2 p-2 rounded-lg ${hasEnough ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <img src={`/images/${icon}.png`} alt={icon} className="h-6 w-6"/>
            <span className="font-semibold">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-20 p-4">
            <div
                className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl text-white border-2 border-gray-700 transform transition-all duration-300 ease-in-out scale-95 hover:scale-100">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-yellow-400">Build on Territory</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-gray-400 hover:text-white text-4xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <div className="flex flex-col md:flex-row p-4 gap-4">
                    {/* Building List */}
                    <div className="w-full md:w-1/3 bg-gray-900 p-3 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold mb-3 text-gray-300">Available Buildings</h3>
                        <div className="space-y-2">
                            {Object.keys(buildInfo).map((buildingName) => (
                                <button
                                    key={buildingName}
                                    onClick={() => setSelectedBuilding(buildingName)}
                                    className={`w-full text-left p-3 rounded-md transition-all duration-200 flex items-center gap-3 ${
                                        selectedBuilding === buildingName
                                            ? 'bg-yellow-500 text-gray-900 font-bold shadow-lg'
                                            : 'bg-gray-700 hover:bg-gray-600 text-white'
                                    }`}
                                >
                                    <img
                                        src={`/images/${formatBuildingNameForImage(buildingName)}.png`}
                                        alt={buildingName}
                                        className="h-8 w-8 rounded-md"
                                    />
                                    {buildingName.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Building Details */}
                    <div className="w-full md:w-2/3 bg-gray-900 p-4 rounded-lg border border-gray-700">
                        <div className="flex flex-col items-center">
                            <img
                                src={`/images/${formatBuildingNameForImage(selectedBuilding)}.png`}
                                alt={`${selectedBuilding} illustration`}
                                className="w-32 h-32 object-contain rounded-lg mb-4 bg-gray-800 p-2 border border-gray-700"
                            />
                            <h3 className="text-2xl font-bold mb-4 text-yellow-300">{selectedBuilding}</h3>
                        </div>

                        {/* Production */}
                        <div className="mb-4">
                            <h4 className="font-semibold text-lg mb-2 text-gray-300">Production (per hour)</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(selectedBuildingData.production).map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2 p-2 rounded-lg bg-gray-800">
                                        <img src={`/images/${key}.png`} alt={key} className="h-6 w-6"/>
                                        <span className="font-medium text-green-400">+{value as number}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Cost */}
                        <div>
                            <h4 className="font-semibold text-lg mb-2 text-gray-300">Cost to Build</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(selectedBuildingData.cost).map(([key, value]) => (
                                    <ResourceItem
                                        key={key}
                                        icon={key}
                                        value={value as number}
                                        hasEnough={resources[key] >= (value as number)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Build Button */}
                <div className="p-4 border-t border-gray-700">
                    <button
                        disabled={!canAfford || isSubmitting}
                        className={`w-full py-3 px-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105
                            ${canAfford && !isSubmitting
                            ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
                            : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={build}
                    >
                        {isSubmitting ? 'Building...' : `Build ${selectedBuilding.replace("_", " ")}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExternalBuildModal;
