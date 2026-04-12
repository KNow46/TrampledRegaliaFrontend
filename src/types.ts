export const RESOURCE_KEYS = [
    "clay",
    "gold",
    "wood",
    "stone",
    "food",
] as const;

export type Resource = typeof RESOURCE_KEYS[number];

export interface Army {
    [key: string]: number;
}

export interface BuildingDetails {
    id: number;
    level: number;
    max_level: number;
    upgrade_cost: { [key: string]: number };
    upgrade_time: number;
    type: string;
    stats: { [key: string]: any };
    stats_next_level: { [key: string]: any };
    is_max_level: boolean;
}

export interface TroopInfo {
    [key: string]: {
        recruitment_time: number;
        cost: Resources;
        power: number;
        defense_multiplier: number;
    };
}

export interface RecruitmentItem {
    order: number;
    unit_type: string;
    quantity: number;
    time_left: string;
    microSecondsLeft: number;
}

export interface BuildInfoItem {
    cost: Resources;
    production: Resources;
}

export interface BuildInfo {
    [key: string]: BuildInfoItem;
}

export interface Castle {
    id: string;
    name: string;
    buildings: BuildingDetails[];
    army: Army | null;
}

export interface Territory {
    id: string;
    q: number;
    r: number;
    castle: Castle | null;
    owner: string | null;
    building: { type: string } | null;
}

export interface Player {
    id: string;
    // Add other player properties if available
}

export interface PixelPos {
    x: number;
    y: number;
}

export type Resources = Record<Resource, number>;

export type Production = Record<Resource, number>;

export interface ResourceStore {
    resources: Resources;
    production: Production;
    error: boolean | string;
    loading?: boolean;
    setResource: (resource: string, amount: number) => void;
    setResources: (resources: Resources) => void;
    setProduction: (production: Production) => void;
    hasEnoughResources: (resourcesCost: Resources) => boolean;
    subtractResources: (resources: Resources) => void;
}

export interface Building {
    xFromCenterNotScaled: number;
    yFromCenterNotScaled: number;
    width: number;
    height: number;
    details: BuildingDetails | null;
}

export interface Buildings {
    [key: string]: Building;
}


