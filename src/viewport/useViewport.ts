import { useEffect, useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { SceneMetadata, StarredPosition, metadataId, validMetadata } from '../helper/types';
import { usePlayerContext } from '../context/PlayerContext';

const makeId = () => {
    return crypto.randomUUID();
};
const reset = async () => {
    await OBR.viewport.reset();
};

const starred = (metadata: SceneMetadata | null) =>
    metadata && metadata[metadataId].starredViewports ? metadata[metadataId].starredViewports : [];

export const useViewport = () => {
    const { id: playerId } = usePlayerContext();
    const defaultSceneMetadata = { [metadataId]: { starredViewports: [] } };
    const [metadata, setMetadata] = useState<SceneMetadata>(defaultSceneMetadata);
    useEffect(() => {
        const fetchMetadata = async () => {
            const sceneMetadata = await OBR.scene.getMetadata();
            if (validMetadata(sceneMetadata)) {
                setMetadata(sceneMetadata);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        return OBR.scene.onMetadataChange((m) => {
            const obrMetadata = m as unknown as SceneMetadata;

            // metadata is locked to default in this useEffect
            setMetadata((prev) => {
                if (JSON.stringify(starred(obrMetadata)) !== JSON.stringify(starred(prev))) {
                    return starred(obrMetadata).length ? obrMetadata : defaultSceneMetadata;
                }
                return prev;
            });
        });
    }, []);

    const starViewport = async (viewportName: string) => {
        const [position, scale] = await Promise.all([
            OBR.viewport.getPosition(),
            OBR.viewport.getScale(),
        ]);
        await OBR.scene.setMetadata({
            [metadataId]: {
                starredViewports: [
                    ...starred(metadata),
                    { id: makeId(), name: viewportName, transform: { position, scale }, playerId },
                ],
            },
        });
    };

    const deleteViewport = async (viewport: StarredPosition) => {
        const filtered = starred(metadata).filter((v) => v.id !== viewport.id);
        await OBR.scene.setMetadata({
            [metadataId]: { starredViewports: filtered.length ? filtered : undefined },
        });
    };

    const jumpTo = async ({ id }: StarredPosition) => {
        const transform = starred(metadata).find((v) => v.id === id)?.transform;
        if (!transform) {
            throw new Error(`No viewport with id ${metadataId} exists`);
        }
        await OBR.viewport.animateTo(transform);
    };
    return {
        starredViewports: starred(metadata),
        starViewport,
        deleteViewport,
        reset,
        jumpTo,
    };
};
