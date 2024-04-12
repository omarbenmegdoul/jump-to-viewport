import { useEffect, useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { SceneMetadata, id, validMetadata } from '../helper/types';

const makeId = () => {
    return Date.now();
};
const reset = async () => {
    await OBR.viewport.reset();
};

const starred = (metadata: SceneMetadata | null) =>
    metadata && metadata[id].starredViewports ? metadata[id].starredViewports : [];

export const useViewport = () => {
    const [draftViewportName, setDraftViewportName] = useState<string>('');
    const [metadata, setMetadata] = useState<SceneMetadata | null>(null);
    useEffect(() => {
        const fetchMetadata = async () => {
            const metaData = await OBR.scene.getMetadata();

            if (validMetadata(metaData)) {
                setMetadata(metaData);
            }
        };
        fetchMetadata();
    }, []);

    useEffect(() => {
        return OBR.scene.onMetadataChange((m) => {
            if (!validMetadata(m)) {
                throw new Error('Received invalid scene metadata from OBR.');
            }

            if (JSON.stringify(starred(m)) !== JSON.stringify(starred(metadata))) {
                setMetadata(m);
            }
        });
    }, []);

    const starViewport = async (viewportName: string) => {
        const [position, scale] = await Promise.all([
            OBR.viewport.getPosition(),
            OBR.viewport.getScale(),
        ]);
        await OBR.scene.setMetadata({
            [id]: {
                starredViewports: [
                    ...starred(metadata),
                    { id: makeId(), name: viewportName, transform: { position, scale } },
                ],
            },
        });
        setDraftViewportName('');
    };

    const deleteViewport = async (viewportId: number) => {
        const filtered = starred(metadata).filter((v) => v.id !== viewportId);
        await OBR.scene.setMetadata({
            [id]: { starredViewports: filtered.length ? null : filtered },
        });
    };

    const jumpTo = async (viewportId: number) => {
        const transform = starred(metadata).find((v) => v.id === viewportId)?.transform;
        if (!transform) {
            throw new Error(`No viewport with id ${id} exists`);
        }
        await OBR.viewport.animateTo(transform);
    };
    return {
        starredViewports: starred(metadata),
        draftViewportName,
        setDraftViewportName,
        starViewport,
        deleteViewport,
        reset,
        jumpTo,
    };
};
