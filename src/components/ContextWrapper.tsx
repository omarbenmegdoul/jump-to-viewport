import OBR, { Player } from '@owlbear-rodeo/sdk';
import { PlayerContext } from '../context/PlayerContext.ts';
import { PropsWithChildren, useEffect, useState } from 'react';
import { PluginGate } from '../context/PluginGateContext.tsx';
import { PartyContext } from '../context/PartyContext.ts';

export const ContextWrapper = (props: PropsWithChildren) => {
    const [player, setPlayer] = useState<Player | null>(null);
    const [ready, setReady] = useState<boolean>(false);
    const [party, setParty] = useState<Player[] | null>(null);

    useEffect(() => {
        if (OBR.isAvailable) {
            OBR.onReady(async () => {
                setReady(true);
                const [role, id, color, syncView, metadata, connectionId, selection, name] =
                    await Promise.all([
                        OBR.player.getRole(),
                        OBR.player.getId(),
                        OBR.player.getColor(),
                        OBR.player.getSyncView(),
                        OBR.player.getMetadata(),
                        OBR.player.getConnectionId(),
                        OBR.player.getSelection(),
                        OBR.player.getName(),
                    ]);
                setPlayer({ role, id, color, syncView, metadata, connectionId, selection, name });
                setParty(await OBR.party.getPlayers());
            });
        }
    }, []);

    if (ready) {
        return (
            <PluginGate>
                <PlayerContext.Provider value={player}>
                    <PartyContext.Provider
                        value={{
                            players: party,
                            setPlayers: setParty,
                            nonGMPlayers:
                                [player, ...(party || [])].filter((player): player is Player =>
                                    Boolean(player && player.role !== 'GM'),
                                ) || null,
                        }}>
                        {props.children}
                    </PartyContext.Provider>
                </PlayerContext.Provider>
            </PluginGate>
        );
    } else {
        return '...';
    }
};
