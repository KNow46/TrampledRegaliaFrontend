import React, {useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark, faHome, faRunning} from '@fortawesome/free-solid-svg-icons';
import api from "../../services/api"; // Import api service

interface CastleMenuProps {
    setIsOpen: (isOpen: boolean) => void;
    selectedCastleId: string | null;
    setPathSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedArmyId: React.Dispatch<React.SetStateAction<number | null>>;
}

const CastleMenu: React.FC<CastleMenuProps> = ({
                                                   setIsOpen,
                                                   selectedCastleId,
                                                   setPathSelectionMode,
                                                   setSelectedArmyId
                                               }) => {
    const [armyId, setArmyId] = useState<number | null>(null);

    useEffect(() => {
        const fetchArmyId = async () => {
            if (selectedCastleId) {
                try {
                    const response = await api.get(`/game/castles/${selectedCastleId}/army/`);
                    // Assuming the response data has an 'id' field for the army
                    setArmyId(response.data.id);
                } catch (error) {
                    console.error("Error fetching army for castle:", error);
                    setArmyId(null);
                }
            }
        };
        fetchArmyId();
    }, [selectedCastleId]);

    const handleNavigate = () => {
        if (selectedCastleId) {
            window.location.href = `/castle?id=${selectedCastleId}`;
        }
    };

    const handleMoveArmy = () => {
        if (armyId !== null) {
            setPathSelectionMode(true);
            setSelectedArmyId(armyId);
            setIsOpen(false); // Close the castle menu
        } else {
            console.warn("No army found for this castle to move.");
        }
    };

    return (
        // Using 'absolute' which is the correct Tailwind class. The parent component should have 'relative'.
        <div
            className="absolute z-30 flex items-center gap-1.5 p-1.5 bg-gray-900/80 backdrop-blur-sm rounded-full border border-gray-700 shadow-lg">

            {/* Go to Castle Button */}
            <button
                onClick={handleNavigate}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-yellow-500 rounded-full transition-all duration-200 group"
                title="Enter Castle"
            >
                <FontAwesomeIcon
                    icon={faHome}
                    className="text-white text-xl transition-colors duration-200 group-hover:text-gray-900"
                />
            </button>

            {/* Separator */}
            <div className="w-px h-8 bg-gray-600"></div>

            {/* Move Army Button (conditionally rendered) */}
            {armyId !== null && (
                <>
                    <button
                        onClick={handleMoveArmy}
                        className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-blue-500 rounded-full transition-all duration-200 group"
                        title="Move Army"
                    >
                        <FontAwesomeIcon
                            icon={faRunning}
                            className="text-white text-xl transition-colors duration-200 group-hover:text-gray-900"
                        />
                    </button>
                    {/* Separator */}
                    <div className="w-px h-8 bg-gray-600"></div>
                </>
            )}

            {/* Close Button */}
            <button
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-gray-700 hover:bg-red-600 rounded-full transition-colors duration-200"
                title="Close"
            >
                <FontAwesomeIcon icon={faXmark} className="text-white text-xl"/>
            </button>

        </div>
    )
}

export default CastleMenu;
