import {create} from 'zustand'
import api from "../services/api";
import type {Resources, Production, ResourceStore, Resource, Army, Territory, Unit, PathStepItem} from '../types';

export const getAuthToken = (): string | null => {
    return localStorage.getItem('access')
}
export const getCurrentWorld = (): number | null => {
    const worldId = localStorage.getItem('world_id');
    return worldId ? parseInt(worldId) : 1;
}

export const useResources = create<ResourceStore>((set, get) => {
    const updateResourcesTime = 2000
    const fetchResources = async () => {
        const worldId = getCurrentWorld()
        if (!worldId) return;
        set({error: false, loading: true});
        try {
            const response = await api.get(`/game/resources/?world_id=${worldId}`);
            const {production, ...resources} = response.data;

            set({production, resources, loading: false});

            const productionReminder: { [key: string]: number } = {};
            for (const resource of Object.keys(resources)) {
                productionReminder[resource] = 0
            }
            setInterval(() => updateResources(productionReminder), updateResourcesTime);
        } catch (err: any) {
            set({error: err.message, loading: false});
        }
    };
    const updateResources = (productionReminder: { [key: string]: number }) => {
        const {resources, production} = get();
        const updatedResources: Resources = {...resources}
        for (const [resource, amount] of Object.entries(updatedResources) as [Resource, number][]) {
            if (!productionReminder[resource]) {
                productionReminder[resource] = 0
            }
            if (!production[resource]) {
                production[resource] = 0
            }
            updatedResources[resource] = amount
                + production[resource] / 3600 * updateResourcesTime / 1000
                + productionReminder[resource]
            productionReminder[resource] = updatedResources[resource] - Math.floor(updatedResources[resource])
            updatedResources[resource] = Math.floor(updatedResources[resource])
        }
        set({resources: updatedResources})
    }
    fetchResources();

    return {
        resources: {},
        production: {},
        setResource: (resource: string, amount: number) =>
            set((state) => ({resources: {...state.resources, [resource]: amount}})),
        setResources: (resources: Resources) => set({resources}),
        setProduction: (production: Production) => set({production}),
        hasEnoughResources: (resourcesCost: Resources) => {
            const {resources} = get();
            return (Object.keys(resourcesCost) as Resource[]).every(
                (key) => (resources[key] ?? 0) >= resourcesCost[key]
            );
        },
        subtractResources: (resources: Resources) => set((state) => {
            const newResources = {...state.resources};
            for (const [resource, amount] of Object.entries(resources) as [Resource, number][]) {
                newResources[resource] = (state.resources[resource] || 0) - amount
            }
            return {resources: newResources};
        }),
        error: false,
    };
});

interface ArmyStore {
    armies: Army[];
    loading: boolean;
    error: boolean | string;
    fetchArmies: () => Promise<void>;
    setArmies: (armies: Army[]) => void;
}

export const useArmies = create<ArmyStore>((set, get) => {
    const updateArmiesTime = 1000; // Update every second
    let lastUpdate = Date.now();

    const getMovementSpeed = (units: Unit[]): number => {
        if (!units || units.length === 0) {
            return 0;
        }
        // Get the minimum movement speed from all units in the army
        return Math.min(...units.map(unit => unit.stats?.movement_speed || 0));
    };

    const updateArmyPositions = () => {
        const now = Date.now();
        const {armies} = get();
        const updatedArmies = armies.map(army => {
            if (!army.is_moving) {
                return army;
            }
            let currentArmy = {...army};
            // Use the last_movement_update from the army object, or initialize if not present
            const lastUpdateTimestamp = currentArmy.last_movement_update || now;
            const elapsed = (now - lastUpdateTimestamp) / 1000; // elapsed in seconds

            if (elapsed <= 0) {
                return army;
            }

            let remainingTime = elapsed;

            while (remainingTime > 0 && currentArmy.is_moving) {
                const movementSpeed = getMovementSpeed(currentArmy.units);
                if (movementSpeed === 0) {
                    currentArmy.is_moving = false;
                    break;
                }
                const speedPerSecond = movementSpeed / 3600; // Assuming movement_speed is distance per hour

                const distanceLeft = 1.0 - currentArmy.movement_progress;
                const timeToFinishSegment = distanceLeft / speedPerSecond;

                if (remainingTime >= timeToFinishSegment) {
                    // Army finishes current segment
                    currentArmy.from_territory = currentArmy.to_territory;
                    currentArmy.movement_progress = 0.0;
                    remainingTime -= timeToFinishSegment;

                    // Assuming path_steps is part of the army object from the backend
                    // And that path_steps is an array of territory IDs or objects with territory_id
                    if (currentArmy.path_steps && currentArmy.path_steps.length > 0) {
                        const nextStep = currentArmy.path_steps.shift(); // Remove the first step
                        if (nextStep) {
                            currentArmy.to_territory = nextStep.territory_id;
                            if (nextStep.target_progress !== undefined && nextStep.target_progress < 1) {
                                currentArmy.movement_progress = nextStep.target_progress;
                                currentArmy.is_moving = false;
                            }
                        } else {
                            currentArmy.is_moving = false; // No more steps
                        }
                    } else {
                        currentArmy.is_moving = false; // No path steps defined
                    }
                } else {
                    // Army moves partially within the current segment
                    currentArmy.movement_progress += remainingTime * speedPerSecond;
                    remainingTime = 0;
                }
            }
            currentArmy.movement_progress = Math.min(currentArmy.movement_progress, 1.0);
            currentArmy.last_movement_update = now; // Update last_movement_update after processing
            return currentArmy;
        });
        set({armies: updatedArmies});
    };

    const fetchArmies = async () => {
        const worldId = getCurrentWorld();
        if (!worldId) return;
        set({error: false, loading: true});
        try {
            const response = await api.get(`/game/armies/?world_id=${worldId}`);
            const fetchedArmies: Army[] = response.data.map((army: any) => ({
                ...army,
                // Initialize last_movement_update if not provided by backend, or convert from string to number
                last_movement_update: army.last_movement_update ? new Date(army.last_movement_update).getTime() : Date.now(),
                path_steps: army.path_steps || [], // Ensure path_steps is an array
            }));
            set({armies: fetchedArmies, loading: false});
            setInterval(updateArmyPositions, updateArmiesTime);
        } catch (err: any) {
            set({error: err.message, loading: false});
        }
    };

    fetchArmies();

    return {
        armies: [],
        loading: false,
        error: false,
        fetchArmies,
        setArmies: (armies: Army[]) => set({armies}),
    };
});




