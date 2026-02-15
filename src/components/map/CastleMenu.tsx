import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark, faHome} from '@fortawesome/free-solid-svg-icons';

interface CastleMenuProps {
    setIsOpen: (isOpen: boolean) => void;
    selectedCastleId: string | null;
}

const CastleMenu: React.FC<CastleMenuProps> = ({setIsOpen, selectedCastleId}) => {
    const handleNavigate = () => {
        if (selectedCastleId) {
            window.location.href = `/castle?id=${selectedCastleId}`;
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
