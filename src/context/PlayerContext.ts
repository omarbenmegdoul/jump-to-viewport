import { createContext, useContext } from 'react';
import { Player } from '@owlbear-rodeo/sdk';

export const PlayerContext = createContext<Player | null>(null);

export const usePlayerContext = (): Player => {
    const playerContext = useContext(PlayerContext);
    if (playerContext === null) {
        throw new Error('Player not yet set');
    }

    return playerContext;
};
