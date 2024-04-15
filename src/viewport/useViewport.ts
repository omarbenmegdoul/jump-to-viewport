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

const filters = (metadata: SceneMetadata | null) => metadata?.[metadataId]?.filters || {};

export const useViewport = () => {
    const { id: currentUserId } = usePlayerContext();
    const defaultSceneMetadata: SceneMetadata = {
        [metadataId]: { starredViewports: [], filters: {} },
    };
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
        const [position, scale] = await Promise.all([
            OBR.viewport.getPosition(),
            OBR.viewport.getScale(),
        ]);
        await OBR.scene.setMetadata({
            [metadataId]: {
                filters: filters(metadata),
                starredViewports: [
                    ...starred(metadata),
                    {
                        id: makeId(),
                        name: viewportName,
                        transform: { position, scale },
                        playerId: currentUserId,
                    },
                ],
            },
        });
    };

    const deleteViewport = async (viewport: StarredPosition) => {
        const filtered = starred(metadata).filter((v) => v.id !== viewport.id);
        await OBR.scene.setMetadata({
            [metadataId]: {
                starredViewports: filtered.length ? filtered : undefined,
                filters: filters(metadata),
            },
        });
    };

    const jumpTo = async ({ id }: StarredPosition) => {
        const transform = starred(metadata).find((v) => v.id === id)?.transform;
        if (!transform) {
            throw new Error(`No viewport with id ${metadataId} exists`);
        }
        await OBR.viewport.animateTo(transform);
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
              absents: show
          },
      };
      await OBR.scene.setMetadata({
          [metadataId]: { starredViewports: starred(metadata), filters: filtersWithUpdate },
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
        filteredPlayerIds,
        showAbsentPlayers:  filters(metadata)?.[currentUserId]?.absents
    };
};
