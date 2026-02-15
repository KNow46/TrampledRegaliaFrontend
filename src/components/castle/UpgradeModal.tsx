import React from "react";
import {useResources} from "../../functions/data";
import {faArrowUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import api from "../../services/api";

interface BuildingDetails {
    id: number;
    level: number;
    max_level: number;
    upgrade_cost: { [key: string]: number };
    upgrade_time: number;
    type: string;
    stats: { [key: string]: any };
    stats_next_level: { [key: string]: any };
    is_max_level: boolean;
}

interface UpgradeModalProps {
    closeModal: () => void;
    buildingName: string;
    buildingDetails: BuildingDetails;
    setBuildingDetails: (details: BuildingDetails) => void;
}

// Helper to format building name for image path e.g. "Wooden Castle" -> "woodenCastle"
const formatBuildingNameForImage = (name: string): string => {
    if (!name) return '';
    const parts = name.split(' ');
    if (parts.length > 1) {
        return parts[0].toLowerCase() + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
    }
    return name.charAt(0).toLowerCase() + name.slice(1);
};


const UpgradeModal: React.FC<UpgradeModalProps> = ({closeModal, buildingName, buildingDetails, setBuildingDetails}) => {
    const {resources, hasEnoughResources, subtractResources} = useResources();

    const upgradeBuilding = async (cost: { [key: string]: number }) => {
        try {
            const response = await api.post(
                `/game/buildings/upgrade/`,
                {
                    building_id: buildingDetails.id,
                    building_type: buildingDetails.type,
                }
            );
            subtractResources(cost);
            setBuildingDetails({
                ...buildingDetails,
                stats: response.data.stats,
                stats_next_level: response.data.stats_next_level,
                is_max_level: response.data.is_max_level,
                level: buildingDetails.level + 1
            });
        } catch (error) {
            console.error('Error upgrading building:', error);
        }
    };

    const isUpgradeable = buildingDetails.is_max_level === false && buildingDetails.stats_next_level;
    const canAfford = isUpgradeable && hasEnoughResources(buildingDetails.stats_next_level.cost);

    const ResourceItem: React.FC<{ icon: string, value: number, hasEnough: boolean }> = ({icon, value, hasEnough}) => (
        <div
            className={`flex items-center gap-2 p-2 rounded-lg ${hasEnough ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            <img src={`/images/${icon}.png`} alt={icon} className="h-6 w-6"/>
            <span className="font-semibold">{value}</span>
        </div>
    );

    const StatDisplay: React.FC<{ label: string, value: any, nextValue?: any }> = ({label, value, nextValue}) => (
        <div className="bg-gray-800 p-3 rounded-lg flex justify-between items-center">
            <span className="capitalize text-gray-400">{label.replace(/_/g, ' ')}</span>
            <div className="flex items-center gap-2 font-semibold">
                <span className="text-white">{value}</span>
                {nextValue && (
                    <>
                        <span className="text-yellow-400 mx-1">→</span>
                        <span className="text-green-400">{nextValue}</span>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div
                className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md text-white border-2 border-gray-700 transform transition-all duration-300">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-2xl font-bold text-yellow-400">
                        {buildingName} <span className="text-lg text-gray-400">(Lvl {buildingDetails.level})</span>
                    </h2>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white text-4xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                {/* Main Content */}
                <div className="p-6 space-y-6">
                    <div className="flex justify-center">
                        <img
                            src={`/images/${formatBuildingNameForImage(buildingName)}.png`}
                            alt={buildingName}
                            className="w-32 h-32 object-contain rounded-lg bg-gray-800 p-2 border border-gray-700"
                        />
                    </div>

                    {isUpgradeable ? (
                        <>
                            {/* Upgrade Details */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-300">Upgrade to
                                    Level {buildingDetails.level + 1}</h3>
                                <div className="space-y-2">
                                    {Object.entries(buildingDetails.stats)
                                        .filter(([key]) => key !== "cost")
                                        .map(([key, value]) => (
                                            <StatDisplay key={key} label={key} value={value}
                                                         nextValue={buildingDetails.stats_next_level[key]}/>
                                        ))}
                                </div>
                            </div>

                            {/* Cost */}
                            <div>
                                <h3 className="font-semibold text-lg mb-3 text-gray-300">Upgrade Cost</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {Object.entries(buildingDetails.stats_next_level.cost).map(([key, value]) => (
                                        <ResourceItem key={key} icon={key} value={value as number}
                                                      hasEnough={resources[key] >= (value as number)}/>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        // Max Level View
                        <div>
                            <h3 className="font-semibold text-lg mb-3 text-center text-green-400">Max Level
                                Reached</h3>
                            <div className="space-y-2">
                                {Object.entries(buildingDetails.stats)
                                    .filter(([key]) => key !== "cost")
                                    .map(([key, value]) => (
                                        <StatDisplay key={key} label={key} value={value}/>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-800/50 rounded-b-2xl flex gap-4">
                    <button
                        onClick={closeModal}
                        className="w-1/3 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded-lg font-bold transition-colors"
                    >
                        Close
                    </button>
                    {isUpgradeable && (
                        <button
                            disabled={!canAfford}
                            className={`w-2/3 py-3 px-4 rounded-lg text-lg font-bold transition-all duration-300 transform hover:scale-105
                                ${canAfford
                                ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
                                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            }`}
                            onClick={() => upgradeBuilding(buildingDetails.stats_next_level.cost)}
                        >
                            Upgrade
                            <FontAwesomeIcon icon={faArrowUp} className="ml-2"/>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;

