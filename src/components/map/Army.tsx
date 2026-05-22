import React from 'react';
import type { Territory } from '../../types';

interface ArmyProps {
    fromTerritoryId: number;
    toTerritoryId: number;
    movementProgress: number;
    hexWidth: number;
    bannerImage: string;
    territories: Territory[];
    hexToPixel: (q: number, r: number, size: number) => { x: number; y: number };
    openSelectionMode: () => void;
    setSelectedArmyId: () => void;
    handleClick: () => void;
}

export const Army: React.FC<ArmyProps> = ({
    fromTerritoryId,
    toTerritoryId,
    movementProgress,
    hexWidth,
    bannerImage,
    territories,
    hexToPixel,
    handleClick
}) => {
    const fromTerritory = territories.find(t => t.id === fromTerritoryId);
    const toTerritory = territories.find(t => t.id === toTerritoryId);

    if (!fromTerritory || !toTerritory) {
        return null; // Don't render if territories are not found
    }

    const fromPixel = hexToPixel(fromTerritory.q, fromTerritory.r, hexWidth);
    const toPixel = hexToPixel(toTerritory.q, toTerritory.r, hexWidth);

    const emblemWidth = hexWidth / 7
    const emblemHeight = hexWidth / 7
    // Interpolate position
    const currentPixelX = fromPixel.x + (toPixel.x - fromPixel.x) * movementProgress + hexWidth / 2 - emblemWidth / 2;
    const currentPixelY = fromPixel.y + (toPixel.y - fromPixel.y) * movementProgress + hexWidth / Math.sqrt(3) - emblemHeight / 2;

    return (
        <img
            src={bannerImage}
            alt="Army"
            className="absolute"
            onClick={handleClick}
            style={{
                left: `${currentPixelX}px`,
                top: `${currentPixelY}px`,
                width: `${emblemWidth}px`, // Adjust size as needed
                height: `${emblemHeight}px`, // Adjust size as needed
                // transform: 'translate(-50%, -50%)', // Center the image on the calculated point
                zIndex: 10 // Ensure armies are above territories
            }}
        />
    );
};