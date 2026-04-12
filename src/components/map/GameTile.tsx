import HexagonFrame from "./HexGlow";
import React from "react";
import type { Territory, PixelPos, Player } from '../../types';

interface GameTileProps {
    territory: Territory;
    pixelPos: PixelPos;
    hexWidth: number;
    setIsCastleMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedCastleId: React.Dispatch<React.SetStateAction<string | null>>;
    player: Player | null;
    setIsBuildMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setSelectedTerritoryId: React.Dispatch<React.SetStateAction<string | null>>;
    wasLastMouseUpPartOfDrag: boolean;
}

const GameTile: React.FC<GameTileProps> = ({
                                               territory,
                                               pixelPos,
                                               hexWidth,
                                               setIsCastleMenuOpen,
                                               setSelectedCastleId,
                                               player,
                                               setIsBuildMenuOpen,
                                               setSelectedTerritoryId,
                                               wasLastMouseUpPartOfDrag
                                           }) => {

    const getImagePath = (): string => {
        if (territory.castle)
            return "images/territoryWithCastle.png"
        else if (territory.building)
            return `images/${territory.building.type.charAt(0).toLowerCase() + territory.building.type.slice(1)}.png`
        else
            return "images/territoryEmpty.png"
    }
    return (
        <div
            key={territory.id}
            className="absolute"
            style={{
                left: `${pixelPos.x}px`,
                top: `${pixelPos.y}px`,
                width: `${hexWidth}px`,
                height: `${hexWidth * (2 / Math.sqrt(3))}px`,
            }}
        >
            <img
                src={getImagePath()}
                draggable="false"
                alt={territory.id}
                className={`absolute top-0 left-0 select-none`}
                style={{
                    width: `${hexWidth}px`,
                    height: `${hexWidth * (2 / Math.sqrt(3))}px`,
                }}
                onClick={() => {
                    if (wasLastMouseUpPartOfDrag)
                        return
                    if (territory.castle) {
                        setIsCastleMenuOpen(true)
                        setSelectedCastleId(territory.castle.id)
                    }
                }}
            />
            {player && territory.owner === player.id &&
                <HexagonFrame
                    left={0}
                    top={0}
                    width={hexWidth}
                    strokeWidth={30}
                    color={"#14d4ff"}
                />
            }
            {player && territory.owner === player.id && !territory.castle && !territory.building && (
                <div
                    className={`absolute top-0 left-0 select-none`}
                    style={{
                        left: `${hexWidth / 8 * 3}px`,
                        top: `${hexWidth / 7 * 3}px`,
                        width: `${hexWidth / 4}px`,
                        height: `${hexWidth / 4}px`,
                    }}
                    onMouseDown={() => {
                        if (wasLastMouseUpPartOfDrag)
                            return
                        setIsBuildMenuOpen(true);
                        setSelectedTerritoryId(territory.id)
                    }}
                >
                    <img
                        src={"images/buildIcon.png"}
                        draggable="false"
                        alt="Build Icon"
                        className={`opacity-100 hover:opacity-0 absolute`}
                    />
                    <img
                        src={"images/buildIconHovered.png"}
                        draggable="false"
                        alt="Build Icon Hovered"
                        className={`opacity-0 hover:opacity-100 absolute scale-[1.2]`}
                    />
                </div>
            )}
        </div>
    );
}

export default GameTile;
