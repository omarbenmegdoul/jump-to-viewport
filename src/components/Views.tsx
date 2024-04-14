import { useViewport } from '../viewport/useViewport.ts';
import { ContextWrapper } from './ContextWrapper.tsx';
import { SceneReadyContext } from '../context/SceneReadyContext.ts';
import { useState } from 'react';
import { usePlayerContext } from '../context/PlayerContext.ts';
import { usePartyContext } from '../context/PartyContext.ts';
import { StarredPosition } from '../helper/types.ts';
import { Player } from '@owlbear-rodeo/sdk';

export const Views = () => {
    const { isReady } = SceneReadyContext();
    return <ContextWrapper>{isReady ? <Content /> : 'loading'}</ContextWrapper>;
};

const Content = () => {
    const {
        reset,
        deleteViewport,
        starViewport,
        starredViewports,

        jumpTo,
    } = useViewport();

    const [draftViewportName, setDraftViewportName] = useState<string>('');
    const { players } = usePartyContext();
    const currentUser = usePlayerContext();
    const allPlayers = [currentUser, ...(players ?? [])];
    return (
        <div>
            <ul>
                <li key="default">
                    <button onClick={reset} className="reset" aria-label="Reset viewport">
                        Reset Viewport
                    </button>
                </li>

                {allPlayers?.map((player) => (
                    <PlayerControls
                        {...{ player, currentUser, deleteViewport, starredViewports, jumpTo }}
                    />
                ))}
                <form
                    className="row"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await starViewport(draftViewportName);
                    }}>
                    <input
                        aria-label="Viewport Name"
                        placeholder="Enter viewport name"
                        value={draftViewportName}
                        onChange={(ev) => setDraftViewportName(ev.target.value)}
                        className="wide-cell"
                    />
                    <button
                        className="narrow-cell"
                        type="submit"
                        disabled={
                            !draftViewportName ||
                            starredViewports.map(({ name }) => name).includes(draftViewportName)
                        }>
                        OK
                    </button>
                </form>
            </ul>
        </div>
    );
};

type ViewportHandler = (viewport: StarredPosition) => Promise<void>;
type ViewportControlProps = {
    viewport: StarredPosition;
    deleteViewport: ViewportHandler;
    jumpTo: ViewportHandler;
    color: string;
    disableDeletion: boolean;
};
export const ViewportControl: React.FC<ViewportControlProps> = ({
    viewport,
    jumpTo,
    color,
    deleteViewport,
    disableDeletion,
}) => (
    <li className="row" key={viewport.id}>
        <button
            onClick={() => jumpTo(viewport)}
            className="wide-cell owned"
            style={{ border: `2px ${color} solid` }}>
            {viewport.name}
        </button>
        <button
            onClick={() => deleteViewport(viewport)}
            aria-label={`Delete ${viewport.name}`}
            className="narrow-cell"
            disabled={disableDeletion}>
            🗑️
        </button>
    </li>
);

type PlayerControlProps = {
    player: Player;
    starredViewports: StarredPosition[];
    currentUser: Player;
    deleteViewport: ViewportHandler;
    jumpTo: ViewportHandler;
};
export const PlayerControls: React.FC<PlayerControlProps> = ({
    player,
    starredViewports,
    currentUser,
    deleteViewport,
    jumpTo,
}) =>
    starredViewports
        .filter((v) => v?.playerId === player.id)
        .map((viewport) => (
            <ViewportControl
                {...{
                    viewport,
                    deleteViewport,
                    jumpTo,
                    color: player.color,
                    disableDeletion: Boolean(
                        currentUser.role !== 'GM' &&
                            viewport.playerId &&
                            currentUser.id !== viewport.playerId,
                    ),
                }}
            />
        ));
