import { createContext, useContext } from 'react';
import { Player } from '@owlbear-rodeo/sdk';

export type PartyContextType = {
    players: Player[] | null;
};

export const PartyContext = createContext<PartyContextType | null>(null);

export const usePartyContext = (): PartyContextType => {
    const partyContext = useContext(PartyContext);
    if (partyContext === null) {
        throw new Error('Party not yet set');
    }

    return partyContext;
};
