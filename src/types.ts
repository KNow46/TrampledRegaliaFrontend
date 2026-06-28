export const RESOURCE_KEYS = [
    "clay",
    "gold",
    "wood",
    "stone",
    "food",
] as const;

export type Resource = typeof RESOURCE_KEYS[number];

export interface Unit {
    unit_type: string;
    amount: number;
    stats: {
        movement_speed: number;
        [key: string]: any; // Allow other stats
    };
}

export interface Army {
    id: number;
    is_moving: boolean;
    from_territory: number;
    to_territory: number;
    movement_progress: number;
    units: Unit[];
    path_steps: PathStepItem[];
    last_movement_update: number;
    owner: number; // id
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
    id: number;
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
    refreshResources: () => Promise<void>;
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

export interface PathStepItem {
    territory_id: number;
    target_progress?: number; // Optional, defaults to 1.0 on backend
}

export interface SetPathRequest {
    army_id: number;
    path: PathStepItem[];
}

export interface TerritoryStore {
    territories: Territory[];
    loading: boolean;
    error: boolean | string;
    fetchTerritories: () => Promise<void>;
}
