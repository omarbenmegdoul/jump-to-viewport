import OBR from "@owlbear-rodeo/sdk";
import { PlayerContext, PlayerContextType } from "../context/PlayerContext.ts";
import { PropsWithChildren, useEffect, useState } from "react";
import { PluginGate } from "../context/PluginGateContext.tsx";

export const ContextWrapper = (props: PropsWithChildren) => {
    const [role, setRole] = useState<string | null>(null);
    const [playerId, setPlayerId] = useState<string | null>(null);
    const [ready, setReady] = useState<boolean>(false);

    useEffect(() => {
        if (OBR.isAvailable) {
            OBR.onReady(async () => {
                setReady(true);
                setRole(await OBR.player.getRole());
                setPlayerId(OBR.player.id);
            });
        }
    }, []);

    const playerContext: PlayerContextType = { role: role, id: playerId };

    if (ready) {
        return (
            <PluginGate>
                <PlayerContext.Provider value={playerContext}>{props.children}</PlayerContext.Provider>
            </PluginGate>
        );
    } else {
        return "...";
    }
};
