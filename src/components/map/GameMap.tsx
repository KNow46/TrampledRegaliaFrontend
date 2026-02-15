import React, {useState, useEffect, useRef} from 'react';
import api from '../../services/api';
import {getCurrentWorld} from "../../functions/data";
import CastleMenu from "./CastleMenu";
import GameTile from "./GameTile";
import ExternalBuildModal from "./ExternalBuildModal";
import {wasMouseUpPartOfDrag} from "../../functions/utils";

interface Territory {
    id: string;
    q: number;
    r: number;
    castle: { id: string } | null;
    owner: string | null;
    building: { type: string } | null;
}

interface Player {
    id: string;
    // Add other player properties if available
}

interface GameMapProps {
    hexWidth: number;
}

// Helper function to convert axial hex coordinates to pixel coordinates
// This is a simplified conversion for a square grid representation.
const hexToPixel = (q: number, r: number, size: number) => {
    const x = size * q - (r % 2 === 1 ? size / 2 : 0)
    const y = size * r * 3 / 4 * (2 / Math.sqrt(3)) - size / 2
    return {x, y};
};

const GameMap: React.FC<GameMapProps> = ({hexWidth}) => {
    const [territories, setTerritories] = useState<Territory[]>([]);
    const [position, setPosition] = useState({x: 0, y: 0});
    const [wasLastMouseUpPartOfDrag, setWasLastMouseUpPartOfDrag] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({x: 0, y: 0});
    const [isCastleMenuOpen, setIsCastleMenuOpen] = useState(false);
    const [selectedCastleId, setSelectedCastleId] = useState<string | null>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapWindowWidth = window.innerWidth
    const mapWindowHeight = window.innerHeight
    const worldId = getCurrentWorld()
    const [player, setPlayer] = useState<Player | null>(null);
    const [previosHexWidth, setPreviosHexWidth] = useState(hexWidth);
    const [isBuildMenuOpen, setIsBuildMenuOpen] = useState(false);
    const [selectedTerritoryId, setSelectedTerritoryId] = useState<string | null>(null);
    const mapWidth = 5000
    const mapHeight = 5000
    const downEventRef = useRef<MouseEvent | null>(null);

    // Fetch castles from the backend
    useEffect(() => {
        const fetchTerritories = async () => {
            try {
                const response = await api.get(`/game/territories/?world_id=${worldId}`);
                setTerritories(response.data);
            } catch (error) {
                console.error('Error fetching castles:', error);
            }
        };
        const fetchPlayer = async () => {
            try {
                const response = await api.get(`/game/player/?world_id=${worldId}`);
                setPlayer(response.data);
            } catch (error) {
                console.error('Error fetching castles:', error);
            }
        }
        fetchTerritories();
        fetchPlayer();
    }, [worldId]);

    useEffect(() => {
        const centerX = mapWindowWidth / 2 - position.x;
        const centerY = mapWindowHeight / 2 - position.y;

        const scale = hexWidth / previosHexWidth;

        const newX = mapWindowWidth / 2 - centerX * scale;
        const newY = mapWindowHeight / 2 - centerY * scale;

        setPosition({x: newX, y: newY});
        setPreviosHexWidth(hexWidth);
    }, [hexWidth, previosHexWidth, mapWindowWidth, mapWindowHeight, position.x, position.y]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setIsDragging(true);
        setStartPos({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
        if (mapRef.current) {
            mapRef.current.style.cursor = 'grabbing';
        }
        downEventRef.current = e.nativeEvent;
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (downEventRef.current && wasMouseUpPartOfDrag(downEventRef.current, e.nativeEvent)) {
            setWasLastMouseUpPartOfDrag(true);
            setIsCastleMenuOpen(false)
        } else {
            setWasLastMouseUpPartOfDrag(false);
        }
        setIsDragging(false);
        if (mapRef.current) {
            mapRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
        if (mapRef.current) {
            mapRef.current.style.cursor = 'grab';
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!isDragging) return;
        e.preventDefault();

        let newX = e.clientX - startPos.x < 0 ? e.clientX - startPos.x : 0;
        let newY = e.clientY - startPos.y < 0 ? e.clientY - startPos.y : 0;
        if (-newX + mapWindowWidth > mapWidth) {
            newX = -(mapWidth - mapWindowWidth);

        }
        if (-newY + mapWindowHeight > mapHeight) {
            newY = -(mapHeight - mapWindowHeight);
        }
        setPosition({x: newX, y: newY});
    };
    return (
        <div>
            <div
                className={`bg-blue-800 overflow-hidden cursor-grab mx-auto`}
                style={{
                    width: `${mapWindowWidth}px`,
                    height: `${mapWindowHeight}px`
                }}
                ref={mapRef}
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* The draggable map area */}
                <div
                    className={`relative bg-green-700`}
                    style={{
                        transform: `translate(${position.x}px, ${position.y}px)`,
                        width: `${mapWidth}px`,
                        height: `${mapHeight}px`
                    }}
                >
                    {/* Render castles on the map */}
                    {territories.map(territory => {
                        const pixelPos = hexToPixel(territory.q, territory.r, hexWidth);
                        return (<GameTile
                            key={territory.id}
                            territory={territory}
                            pixelPos={pixelPos}
                            hexWidth={hexWidth}
                            setIsCastleMenuOpen={setIsCastleMenuOpen}
                            setSelectedCastleId={setSelectedCastleId}
                            player={player}
                            wasLastMouseUpPartOfDrag={wasLastMouseUpPartOfDrag}
                            setIsBuildMenuOpen={setIsBuildMenuOpen}
                            setSelectedTerritoryId={setSelectedTerritoryId}
                        />)
                    })
                    }

                </div>
            </div>
            {isCastleMenuOpen && selectedCastleId &&
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <CastleMenu setIsOpen={setIsCastleMenuOpen} selectedCastleId={selectedCastleId}/>
                </div>
            }
            {isBuildMenuOpen && selectedTerritoryId &&
                <ExternalBuildModal
                    territoryId={selectedTerritoryId}
                    setIsOpen={setIsBuildMenuOpen}
                />
            }
        </div>
    );
};

export default GameMap;

