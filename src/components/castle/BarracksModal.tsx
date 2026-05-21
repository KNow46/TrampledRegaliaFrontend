import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUp} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/api";
import {useResources} from "../../functions/data";
import {
    type BuildingDetails,
    type Army,
    type TroopInfo,
    type RecruitmentItem,
    type Resources,
    RESOURCE_KEYS, type Resource
} from '../../types';

// Helper function to format seconds to HH:MM:SS
const formatSecondsToTime = (totalSeconds: number) => {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
};

interface BarracksModalProps {
    closeModal: () => void;
    buildingName: string;
    buildingDetails: BuildingDetails | null;
    army: Army | null;
    setArmy: React.Dispatch<React.SetStateAction<Army | null>>;
    recruitmentQueue: RecruitmentItem[];
    troopsInfo: TroopInfo;
    fetchRecruitmentInfo: () => void;
}

export const BarracksModal: React.FC<BarracksModalProps> = ({
                                                                closeModal,
                                                                buildingName,
                                                                buildingDetails,
                                                                recruitmentQueue,
                                                                troopsInfo,
                                                                fetchRecruitmentInfo
                                                            }) => {
    const {resources, hasEnoughResources, subtractResources} = useResources();
    const [selectedAmounts, setSelectedAmounts] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        if (buildingDetails) {
            fetchRecruitmentInfo();
        }
    }, [buildingDetails]);


    const recruitTroop = async (troopName: string, quantity: number) => {
        if (quantity <= 0 || !buildingDetails) return;
        try {
            await api.post(`/game/barracks/${buildingDetails.id}/`, {
                unit_type: troopName,
                quantity: quantity
            });
            subtractResources(getTotalCost())
            fetchRecruitmentInfo(); // Refresh data after recruiting
        } catch (e) {
            console.log(e);
        }
    };

    const getTotalCost = () => {
        const totalCost: Resources = Object.fromEntries(
            RESOURCE_KEYS.map(resource => [resource, 0])
        ) as Resources;

        for (const [troopName, selectedAmount] of Object.entries(selectedAmounts) ) {
            if (!troopsInfo[troopName]) continue;
            for (const resource of Object.keys(troopsInfo[troopName].cost) as (keyof Resources)[]) {
                if (!totalCost[resource]) {
                    totalCost[resource] = 0;
                }
                totalCost[resource] += selectedAmount * troopsInfo[troopName].cost[resource];
            }
        }
        return totalCost;
    };

    const ResourceItem: React.FC<{ icon: string, value: number, hasEnough: boolean }> = ({icon, value, hasEnough}) => (
        <div
            className={`flex items-center gap-2 p-2 rounded-lg text-sm ${hasEnough ? 'bg-gray-700' : 'bg-red-900/50 text-red-400'}`}>
            <img src={`/images/${icon}.png`} alt={icon} className="h-5 w-5"/>
            <span className="font-semibold">{value}</span>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div
                className="bg-gray-800 rounded-xl shadow-lg w-full max-w-2xl text-white border border-gray-600 transform transition-all duration-300">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-yellow-400">{buildingName}</h2>
                        <div className="flex items-center gap-2 text-lg">
                            <span>Level {buildingDetails?.level}</span>
                            <FontAwesomeIcon
                                icon={faArrowUp}
                                className="cursor-pointer text-green-400 hover:text-green-300 transition-colors"
                                // onClick={() => setIsUpgradeModalOpen(true)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-white text-4xl leading-none transition-colors"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-yellow-300">Recruit Troops</h3>
                        <div className="space-y-4">
                            {Object.entries(troopsInfo).map(([troopName, stats]) => (
                                <div key={troopName}
                                     className="bg-gray-700 p-4 rounded-lg flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <img src={`/images/troops/${troopName}.png`} alt={troopName}
                                             className="h-16 w-16 border-2 border-gray-600 rounded-md"/>
                                        <div className="font-bold text-lg capitalize">{troopName}</div>
                                    </div>
                                    <div className="flex items-center gap-4 text-center">
                                        <div className="flex flex-col items-center">
                                            <img src={`/images/troops/power.png`} className="h-6 w-6 mb-1" alt="Power"/>
                                            <span className="font-semibold">{stats.power}</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <img src={`/images/troops/shield.png`} className="h-6 w-6 mb-1"
                                                 alt="Defense"/>
                                            <span className="font-semibold">{stats.defense_multiplier}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {Object.entries(stats.cost).map(([key, value]) => (
                                            <ResourceItem key={key} icon={key} value={value as number} hasEnough={true}/>
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="text-black bg-gray-200 rounded-md p-2 w-24 text-center font-semibold"
                                            type="number"
                                            min="0"
                                            step="1"
                                            value={selectedAmounts[troopName] || 0}
                                            onChange={(e) => setSelectedAmounts({
                                                ...selectedAmounts,
                                                [troopName]: Number(e.target.value)
                                            })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-700/50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold mb-3 text-yellow-200">Total Cost</h4>
                        <div className="flex justify-between items-center">
                            <div className="flex gap-3">
                                {Object.entries(getTotalCost()).length > 0 ? Object.entries(getTotalCost()).map(([resource, amount]) => (
                                    <ResourceItem key={resource} icon={resource} value={amount}
                                                  hasEnough={(resources[resource as Resource] || 0) >= amount}/>
                                )) : <p className="text-gray-400">Select troops to see the cost.</p>}
                            </div>
                            <button
                                disabled={!hasEnoughResources(getTotalCost()) || Object.keys(selectedAmounts).length === 0}
                                onClick={async () => {
                                    for (const [troopName, amount] of Object.entries(selectedAmounts)) {
                                        await recruitTroop(troopName, amount);
                                    }
                                    setSelectedAmounts({}); // Reset amounts after recruiting
                                }}
                                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors"
                            >
                                Recruit
                            </button>
                        </div>
                    </div>

                    {recruitmentQueue.length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-yellow-300">Recruitment Queue</h3>
                            <div className="space-y-3">
                                {recruitmentQueue.map((item) => (
                                    <div key={item.order}
                                         className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <img src={`/images/troops/${item.unit_type}.png`} alt={item.unit_type}
                                                 className="h-10 w-10 rounded-md"/>
                                            <span
                                                className="font-semibold capitalize">{item.quantity}x {item.unit_type}</span>
                                        </div>
                                        <div className="font-mono text-lg text-green-400">
                                            {formatSecondsToTime(item.microSecondsLeft / 1000)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};