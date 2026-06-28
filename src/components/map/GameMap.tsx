import React, {useState, useEffect, useRef} from 'react';
import api from '../../services/api';
import {getCurrentWorld, useArmies} from "../../functions/data"; // Import useArmies
import CastleMenu from "./CastleMenu";
import GameTile from "./GameTile";
import ExternalBuildModal from "./ExternalBuildModal";
import {wasMouseUpPartOfDrag} from "../../functions/utils";
import type {Territory, Player, PathStepItem, SetPathRequest, Unit} from '../../types';
import { Army } from './Army';
import armyImage from '../../../public/images/armyBlue.png';
import enemyArmyImage from '../../../public/images/armyRed.png';
import {PathSelection} from "./PathSelection.tsx";

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
    const [selectedUnitsAmount, setSelectedUnitsAmount] = useState<Unit[]>([]);
    const [maxSelectedUnitsAmount, setMaxSelectedUnitsAmount] = useState<Unit[]>([]);


    // New state for army movement
    const [pathSelectionMode, setPathSelectionMode] = useState<boolean>(false);
    const [selectedArmyId, setSelectedArmyId] = useState<number | null>(null);
    const [currentPath, setCurrentPath] = useState<PathStepItem[]>([]);
    // Use useArmies hook
    const {armies, loading: armiesLoading, error: armiesError, fetchArmies} = useArmies();

    // Fetch territories and player from the backend
    useEffect(() => {
        const fetchTerritories = async () => {
            try {
                const response = await api.get(`/game/territories/?world_id=${worldId}`);
                setTerritories(response.data);
            } catch (error) {
                console.error('Error fetching territories:', error);
            }
        };
        const fetchPlayer = async () => {
            try {
                const response = await api.get(`/game/player/?world_id=${worldId}`);
                setPlayer(response.data);
            } catch (error) {
                console.error('Error fetching player:', error);
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

    const handleConfirmPath = async () => {
        if (selectedArmyId === null || currentPath.length === 0) {
            console.error("No army selected or path is empty.");
            return;
        }

        const requestBody: SetPathRequest = {
            army_id: selectedArmyId,
            army_units: selectedUnitsAmount,
            path: currentPath,
        };

        try {
            await api.post("/game/armies/path-step/", requestBody);
            console.log("Army path set successfully!");
            // Optionally, refetch territories or update army state
        } catch (error) {
            console.error("Error setting army path:", error);
        } finally {
            setPathSelectionMode(false);
            setSelectedArmyId(null);
            fetchArmies();
            setCurrentPath([]);
        }
    };

    const handleCancelPath = () => {
        setPathSelectionMode(false);
        setSelectedArmyId(null);
        setCurrentPath([]);
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
                            // New props for army movement
                            pathSelectionMode={pathSelectionMode}
                            currentPath={currentPath}
                            setCurrentPath={setCurrentPath}
                            selectedArmyId={selectedArmyId}
                        />)
                    })
                    }
                    {armies.map((army: Army) => (
                        <Army
                            key={army.id}
                            fromTerritoryId={army.from_territory}
                            toTerritoryId={army.to_territory}
                            movementProgress={army.movement_progress}
                            hexWidth={hexWidth}
                            bannerImage={player && army.owner == player.id ? armyImage : enemyArmyImage}
                            territories={territories}
                            hexToPixel={hexToPixel}
                            openSelectionMode={() => setPathSelectionMode(true)}
                            setSelectedArmyId={() => setSelectedArmyId(army.id)}
                            handleClick={() => {
                                setPathSelectionMode(true)
                                setSelectedArmyId(army.id)
                                setSelectedUnitsAmount(army.units)
                                setMaxSelectedUnitsAmount(structuredClone(army.units))
                            }}
                        />
                    ))}

                </div>
            </div>
            {isCastleMenuOpen && selectedCastleId &&
                <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
                    <CastleMenu
                        setIsOpen={setIsCastleMenuOpen}
                        selectedCastleId={selectedCastleId}
                        setPathSelectionMode={setPathSelectionMode} // Pass setter to CastleMenu
                        setSelectedArmyId={setSelectedArmyId} // Pass setter to CastleMenu
                    />
                </div>
            }
            {isBuildMenuOpen && selectedTerritoryId &&
                <ExternalBuildModal
                    territoryId={selectedTerritoryId}
                    setIsOpen={setIsBuildMenuOpen}
                />
            }

            {pathSelectionMode &&
                <PathSelection
                    handleCancelPath={handleCancelPath}
                    handleConfirmPath={handleConfirmPath}
                    selectedArmyId={selectedArmyId}
                    currentPath={currentPath}
                    selectedUnitsAmount={selectedUnitsAmount}
                    setSelectedUnitsAmount={setSelectedUnitsAmount}
                    maxSelectedUnitsAmount={maxSelectedUnitsAmount}
                />}
        </div>
    );
};

export default GameMap;

