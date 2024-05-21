import { createContext, useContext, useEffect } from 'react';
import OBR, { Player } from '@owlbear-rodeo/sdk';

export type PartyContextType = {
    players: Player[] | null;
    setPlayers: (p: Player[]) => void;
    nonGMPlayers: Player[] | null;
};

export const PartyContext = createContext<PartyContextType | null>(null);

export const usePartyContext = (): PartyContextType => {
    const partyContext = useContext(PartyContext);
    if (partyContext === null) {
        throw new Error('Party not yet set');
    }
    useEffect(() => {
        return OBR.party.onChange((party) => partyContext.setPlayers(party));
    });

    return partyContext;
};
