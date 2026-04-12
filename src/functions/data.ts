import {create} from 'zustand'
import api from "../services/api";
import type {Resources, Production, ResourceStore, Resource} from '../types';

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



