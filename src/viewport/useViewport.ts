import { useEffect, useState } from 'react';
import OBR, { Vector2, Math2, isImage } from '@owlbear-rodeo/sdk';
import {
    SceneMetadata,
    StarredBox,
    StarredLegacy,
    isStarredBox,
    isStarredLegacy,
    metadataId,
    validMetadata,
} from '../helper/types';
import { usePlayerContext } from '../context/PlayerContext';
import { usePartyContext } from '../context/PartyContext';

const makeId = () => {
    return crypto.randomUUID();
};
const reset = async () => {
    await OBR.viewport.reset();
};

const starred = (metadata: SceneMetadata | null) =>
    metadata && metadata[metadataId].starredViewports ? metadata[metadataId].starredViewports : [];

const filters = (metadata: SceneMetadata | null) => metadata?.[metadataId]?.filters || {};

const getViewportBounds = async () => {
    const [height, width, min] = await Promise.all([
        OBR.viewport.getHeight(),
        OBR.viewport.getWidth(),
        OBR.viewport.inverseTransformPoint({ x: 0, y: 0 }),
    ]);
    // get world coordinates for top-left of viewpoint
    const max = await OBR.viewport.inverseTransformPoint({ x: width, y: height });

    return { min, max };
};

const jumpToLegacy = async ({ transform }: StarredLegacy) => {
    await OBR.viewport.animateTo(transform);
};

const jumpToBoundingBox = async ({ boundingCorners }: Pick<StarredBox, 'boundingCorners'>) => {
    const { min, max } = boundingCorners;
    const bbox = Math2.boundingBox([min, max]);
    await OBR.viewport.animateToBounds(bbox);
};

const constructStarredBox = ({
    id,
    viewportName,
    min,
    max,
    currentUserId,
}: {
    id?: string;
    viewportName: string;
    min: Vector2;
    max: Vector2;
    currentUserId: string;
}): StarredBox => ({
    id: id ?? makeId(),
    name: viewportName,
    boundingCorners: { min, max },
    playerId: currentUserId,
});

const getPlayerImages = async (nonGMids: string[]) => {
    return (await OBR.scene.items.getItems((item) => nonGMids.includes(item.createdUserId))).filter(
        isImage,
    );
};

export const useViewport = () => {
    const currentUser = usePlayerContext();
    const { id: currentUserId } = currentUser;
    const { players, nonGMPlayers } = usePartyContext();
    const defaultSceneMetadata: SceneMetadata = {
        [metadataId]: { starredViewports: [], filters: {} },
    };
    const [metadata, setMetadata] = useState<SceneMetadata>(defaultSceneMetadata);
    useEffect(() => {
        const fetchMetadata = async () => {
            const sceneMetadata = await OBR.scene.getMetadata();
            if (validMetadata(sceneMetadata)) {
                setMetadata(sceneMetadata);
                return;
            }
            // todo handle
            console.log('Metadata was invalid');
        };
        fetchMetadata();
    }, []);
    useEffect(() => {
        return OBR.scene.onMetadataChange((m) => {
            const obrMetadata = m as unknown as SceneMetadata;
            // metadata is locked to default in this useEffect
            // so use callback in setMetadata
            if (!currentUserId) {
                return;
            }
            setMetadata((prev) => {
                if (JSON.stringify(obrMetadata[metadataId]) !== JSON.stringify(prev[metadataId])) {
                    return starred(obrMetadata).length || Object.keys(filters(obrMetadata)).length
                        ? obrMetadata
                        : defaultSceneMetadata;
                }
                return prev;
            });
        });
    }, []);

    const starViewport = async (viewportName: string) => {
        const { min, max } = await getViewportBounds();

        await OBR.scene.setMetadata({
            [metadataId]: {
                filters: filters(metadata),
                starredViewports: [
                    ...starred(metadata),
                    constructStarredBox({ currentUserId, viewportName, min, max }),
                ],
            },
        });
    };
    const deleteViewport = async (viewport: StarredLegacy | StarredBox) => {
        const filtered = starred(metadata).filter((v) => v.id !== viewport.id);
        await OBR.scene.setMetadata({
            [metadataId]: {
                starredViewports: filtered.length ? filtered : undefined,
                filters: filters(metadata),
            },
        });
    };

    const jumpTo = async ({ id }: StarredLegacy | StarredBox) => {
        const star = starred(metadata).find((v) => v.id === id);
        if (!star) {
            throw new Error(`Jumping Error: No viewport with id ${id} exists`);
        }
        if (isStarredBox(star)) {
            await jumpToBoundingBox(star);
        }

        if (isStarredLegacy(star)) {
            await jumpToLegacy(star);
            await overwriteViewport({ id });
        }
    };

    const filterPlayer = async (filteredPlayerId: string, show: boolean) => {
        const filtersWithUpdate = {
            ...filters(metadata),
            [currentUserId]: {
                ...filters(metadata)[currentUserId],
                players: {
                    ...(filters(metadata)[currentUserId]?.players || {}),
                    [filteredPlayerId]: show,
                },
            },
        };

        await OBR.scene.setMetadata({
            [metadataId]: { starredViewports: starred(metadata), filters: filtersWithUpdate },
        });
    };

    const filterAbsent = async (show: boolean) => {
        const filtersWithUpdate = {
            ...filters(metadata),
            [currentUserId]: {
                ...filters(metadata)[currentUserId],
                absents: show,
            },
        };
        await OBR.scene.setMetadata({
            [metadataId]: { starredViewports: starred(metadata), filters: filtersWithUpdate },
        });
    };

    const overwriteViewport = async ({ id: idToBeOverwritten }: { id: string }) => {
        const existingViewports = starred(metadata);
        const viewportToBeDeleted = existingViewports.find(({ id }) => id === idToBeOverwritten);
        if (!viewportToBeDeleted) {
            throw new Error(
                `Overwrite Viewport Error: No viewport with id ${idToBeOverwritten} exists`,
            );
        }
        const { min, max } = await getViewportBounds();
        await OBR.scene.setMetadata({
            [metadataId]: {
                filters: filters(metadata),
                starredViewports: [
                    ...starred(metadata).filter(({ id }) => id !== idToBeOverwritten),
                    constructStarredBox({
                        viewportName: viewportToBeDeleted.name,
                        min,
                        max,
                        currentUserId,
                        id: idToBeOverwritten,
                    }),
                ],
            },
        });
    };
    const nonGMids = nonGMPlayers?.map(({ id }) => id) || [];

    const jumpToPlayerItems = async () => {
        const items = await getPlayerImages(nonGMids);

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        items.forEach((item) => {
            const halfWidth = (item.image.width * item.scale.x) / 2;
            const halfHeight = (item.image.height * item.scale.y) / 2;

            const leftEdge = item.position.x - halfWidth;
            const rightEdge = item.position.x + halfWidth;
            const topEdge = item.position.y - halfHeight;
            const bottomEdge = item.position.y + halfHeight;

            if (leftEdge < minX) {
                minX = leftEdge;
            }
            if (topEdge < minY) {
                minY = topEdge;
            }
            if (rightEdge > maxX) {
                maxX = rightEdge;
            }
            if (bottomEdge > maxY) {
                maxY = bottomEdge;
            }
        });

        await jumpToBoundingBox({
            boundingCorners: { max: { x: maxX, y: maxY }, min: { x: minX, y: minY } },
        });
    };

    // type problem here? should not need ?? {}
    const filteredPlayerIds = Object.entries(filters(metadata)[currentUserId]?.players ?? {})
        .filter(([_, v]) => !v)
        .map(([k]) => k);

    return {
        starredViewports: starred(metadata),
        starViewport,
        deleteViewport,
        reset,
        jumpTo,
        filterPlayer,
        filterAbsent,
        jumpToPlayerItems,
        filteredPlayerIds,
        showAbsentPlayers: filters(metadata)?.[currentUserId]?.absents,
    };
};
