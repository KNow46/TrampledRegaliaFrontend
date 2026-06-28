import {create} from 'zustand'
import api from "../services/api";
import type {Resources, Production, ResourceStore, Resource, Army, Unit, TerritoryStore} from '../types';

let resourceUpdateIntervalId: ReturnType<typeof setInterval> | null = null;

export const getAuthToken = (): string | null => {
    return localStorage.getItem('access')
}
export const getCurrentWorld = (): number | null => {
    const worldId = localStorage.getItem('world_id');
    return worldId ? parseInt(worldId) : 1;
}

export const useResources = create<ResourceStore>((set, get) => {
    const updateResourcesTime = 2000
    let productionReminder: { [key: string]: number } = {};

    const updateResources = () => {
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

    const fetchResources = async () => {
        const worldId = getCurrentWorld()
        if (!worldId) return;
        set({error: false, loading: true});
        try {
            const response = await api.get(`/game/resources/?world_id=${worldId}`);
            const {production, ...resources} = response.data;

            set({production, resources, loading: false});

            productionReminder = {};
            for (const resource of Object.keys(resources)) {
                productionReminder[resource] = 0
            }

            if (!resourceUpdateIntervalId) {
                resourceUpdateIntervalId = setInterval(updateResources, updateResourcesTime);
            }
        } catch (err: any) {
            set({error: err.message, loading: false});
        }
    };

    fetchResources();

    return {
        resources: {},
        production: {},
        setResource: (resource: string, amount: number) =>
            set((state) => ({resources: {...state.resources, [resource]: amount}})),
        setResources: (resources: Resources) => set({resources}),
        setProduction: (production: Production) => set({production}),
        refreshResources: fetchResources,
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

// ---------- Territories store ----------
// Defined before useArmies so armies can trigger a territory refresh after fetching.

export const useTerritories = create<TerritoryStore>((set) => {
    const fetchTerritories = async () => {
        const worldId = getCurrentWorld();
        if (!worldId) return;
        set({loading: true, error: false});
        try {
            const response = await api.get(`/game/territories/?world_id=${worldId}`);
            set({territories: response.data, loading: false});
        } catch (err: any) {
            set({error: err.message, loading: false});
        }
    };

    fetchTerritories();

    return {
        territories: [],
        loading: false,
        error: false,
        fetchTerritories,
    };
});

// ---------- Armies store ----------

interface ArmyStore {
    armies: Army[];
    loading: boolean;
    error: boolean | string;
    fetchArmies: () => Promise<void>;
    setArmies: (armies: Army[]) => void;
}

// Module-level interval IDs to prevent duplicate intervals across fetchArmies calls.
let localUpdateIntervalId: ReturnType<typeof setInterval> | null = null;
let backendRefreshIntervalId: ReturnType<typeof setInterval> | null = null;

/** How often to re-sync army state with the backend (ms).
 *  Each backend fetch triggers refresh_position() on the server, which resolves combat and conquest. */
const BACKEND_REFRESH_MS = 15_000;

export const useArmies = create<ArmyStore>((set, get) => {
    const getMovementSpeed = (units: Unit[]): number => {
        if (!units || units.length === 0) return 0;
        return Math.min(...units.map(unit => unit.stats?.movement_speed || 0));
    };

    const updateArmyPositions = () => {
        const now = Date.now();
        const {armies} = get();
        let needsBackendRefresh = false;

        const updatedArmies: Army[] = armies.map(army => {
            if (!army.is_moving) return army;

            let currentArmy = {...army, path_steps: [...army.path_steps]};
            const lastUpdateTimestamp = currentArmy.last_movement_update || now;
            const elapsed = (now - lastUpdateTimestamp) / 1000; // seconds

            if (elapsed <= 0) return army;

            let remainingTime = elapsed;

            while (remainingTime > 0 && currentArmy.is_moving) {
                const movementSpeed = getMovementSpeed(currentArmy.units);
                if (movementSpeed === 0) {
                    currentArmy.is_moving = false;
                    needsBackendRefresh = true;
                    break;
                }
                const speedPerSecond = movementSpeed / 3600;
                const distanceLeft = 1.0 - currentArmy.movement_progress;
                const timeToFinishSegment = distanceLeft / speedPerSecond;

                if (remainingTime >= timeToFinishSegment) {
                    // Army finishes this movement segment → arrives at to_territory
                    currentArmy.from_territory = currentArmy.to_territory;
                    currentArmy.movement_progress = 0.0;
                    remainingTime -= timeToFinishSegment;

                    if (currentArmy.path_steps.length > 0) {
                        const nextStep = currentArmy.path_steps.shift()!;
                        currentArmy.to_territory = nextStep.territory_id;
                        if (nextStep.target_progress !== undefined && nextStep.target_progress < 1) {
                            currentArmy.movement_progress = nextStep.target_progress;
                            currentArmy.is_moving = false;
                            // Army stopped at an intermediate point — sync with backend
                            needsBackendRefresh = true;
                        }
                    } else {
                        // No more steps — army reached its final destination
                        currentArmy.is_moving = false;
                        // Backend needs to resolve any combat / conquest at this territory
                        needsBackendRefresh = true;
                    }
                } else {
                    currentArmy.movement_progress += remainingTime * speedPerSecond;
                    remainingTime = 0;
                }
            }

            currentArmy.movement_progress = Math.min(currentArmy.movement_progress, 1.0);
            currentArmy.last_movement_update = now;
            return currentArmy;
        });

        set({armies: updatedArmies});

        if (needsBackendRefresh) {
            // Small delay to ensure the backend has processed the movement tick
            setTimeout(() => fetchArmies(), 600);
        }
    };

    const fetchArmies = async () => {
        const worldId = getCurrentWorld();
        if (!worldId) return;
        set({error: false, loading: true});
        try {
            const response = await api.get(`/game/armies/?world_id=${worldId}`);
            const fetchedArmies: Army[] = response.data.map((army: any) => ({
                ...army,
                last_movement_update: army.last_movement_update
                    ? new Date(army.last_movement_update).getTime()
                    : Date.now(),
                path_steps: army.path_steps || [],
            }));
            set({armies: fetchedArmies, loading: false});

            // After every backend fetch the server has resolved combat and potential conquests,
            // so we also refresh territories to reflect ownership changes.
            useTerritories.getState().fetchTerritories();

            // Start local position update interval exactly once.
            if (!localUpdateIntervalId) {
                localUpdateIntervalId = setInterval(updateArmyPositions, 1000);
            }

            // Start periodic backend re-sync interval exactly once.
            if (!backendRefreshIntervalId) {
                backendRefreshIntervalId = setInterval(fetchArmies, BACKEND_REFRESH_MS);
            }
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
