import { Vector2, ViewportTransform } from '@owlbear-rodeo/sdk';

export const metadataId = 'com.omarbenmegdoul.jumpToViewport3/metadata';
export interface SceneMetadata {
    [metadataId]: {
        starredViewports: StarredPosition[] | undefined;
        filters: Record<string, UserFilter>;
    };
}

export type UserFilter = {
    players: Record<string, boolean>;
    absents: boolean;
};

export type StarredPosition = {
    id: string;
    name: string;
    transform: ViewportTransform;
    playerId?: string;
};

export function validMetadata(value: unknown): value is SceneMetadata {
    if (typeof value !== 'object' || value === null) return false;
    return metadataId in value && isViewportMetadata(value[metadataId]);
    // doesn't check filters
}

// Type guard for UserFilter
function isUserFilter(obj: unknown): obj is UserFilter {
    if (!isRecord(obj)) return false;
    const hasAbsents = 'absents' in obj && typeof obj.absents === 'boolean';
    const hasPlayers = 'players' in obj && isRecord(obj.players);
    if (!hasAbsents || !hasPlayers) return false;
    if (isRecord(obj.players)) {
        for (const key in obj.players) {
            if (typeof obj.players[key] !== 'boolean') {
                return false;
            }
        }
    }
    return true;
}

// Type guard for the filters key in SceneMetadata
// unused :(
export function isValidFiltersKey(obj: unknown): obj is Record<string, UserFilter> {
    if (!isRecord(obj)) return false;
    for (const key in obj) {
        if (!isUserFilter(obj[key])) {
            return false;
        }
    }
    return true;
}

export function isViewportMetadata(value: unknown): value is SceneMetadata[typeof metadataId] {
    return hasStarredViewport(value) && isArrayofStarredPositions(value.starredViewports);
}

export const isObject = (value: unknown): value is object => {
    return typeof value === 'object' && value !== null;
};

export const isRecord = (value: unknown): value is Record<string, unknown> => {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        !(value instanceof Date) &&
        !(value instanceof RegExp)
    );
};

export const hasStarredViewport = (
    value: unknown,
): value is Record<'starredViewports', unknown> => {
    return isObject(value) && 'starredViewports' in value;
};

export const canSalvageViewportMetadata = (
    value: unknown,
): value is Record<'starredViewports', undefined | unknown[]> => {
    return (
        hasStarredViewport(value) &&
        (Array.isArray(value.starredViewports) || value.starredViewports === undefined)
    );
};

function isVector2(value: unknown): value is Vector2 {
    return (
        isObject(value) &&
        'x' in value &&
        typeof value.x === 'number' &&
        'y' in value &&
        typeof value.y === 'number'
    );
}

function isViewportTransform(value: unknown): value is ViewportTransform {
    return (
        isObject(value) &&
        'position' in value &&
        isVector2(value.position) &&
        'scale' in value &&
        typeof value.scale === 'number'
    );
}

export function isStarredPosition(value: unknown): value is StarredPosition {
    return (
        isObject(value) &&
        'id' in value &&
        typeof value.id === 'string' &&
        'name' in value &&
        typeof value.name === 'string' &&
        'transform' in value &&
        isViewportTransform(value.transform)
    );
}

function isArrayofStarredPositions(value: unknown): value is StarredPosition[] {
    return value === undefined || (Array.isArray(value) && value.every(isStarredPosition));
}
