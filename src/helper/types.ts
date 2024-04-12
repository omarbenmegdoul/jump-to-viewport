import { Vector2, ViewportTransform } from '@owlbear-rodeo/sdk';

export const id = 'com.omarbenmegdoul.jumpToViewport/metadata';
export interface SceneMetadata {
    [id]: {
        starredViewports: StarredPosition[] | null;
    };
}

export type StarredPosition = {
    id: number;
    name: string;
    transform: ViewportTransform;
};

export function validMetadata(value: unknown): value is SceneMetadata {
    if (typeof value !== 'object' || value === null) return false;
    return id in value && isSceneMetadata(value[id]);
}

export function isSceneMetadata(
    value: unknown,
): value is SceneMetadata['com.omarbenmegdoul.jumpToViewport/metadata'] {
    return (
        typeof value === 'object' &&
        value !== null &&
        'starredViewports' in value &&
        isArrayofStarredPositions(value.starredViewports)
    );
}

function isVector2(value: unknown): value is Vector2 {
    return (
        typeof value === 'object' &&
        value !== null &&
        'x' in value &&
        typeof value.x === 'number' &&
        'y' in value &&
        typeof value.y === 'number'
    );
}

function isViewportTransform(value: unknown): value is ViewportTransform {
    return (
        typeof value === 'object' &&
        value !== null &&
        'position' in value &&
        isVector2(value.position) &&
        'scale' in value &&
        typeof value.scale === 'number'
    );
}

function isStarredPosition(value: unknown): value is StarredPosition {
    return (
        typeof value === 'object' &&
        value !== null &&
        'id' in value &&
        typeof value.id === 'number' &&
        'name' in value &&
        typeof value.name === 'string' &&
        'transform' in value &&
        isViewportTransform(value.transform)
    );
}

function isArrayofStarredPositions(value: unknown): value is StarredPosition[] {
    return value === null || (Array.isArray(value) && value.every(isStarredPosition));
}
