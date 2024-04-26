import { useViewport } from '../viewport/useViewport.ts';
import { ContextWrapper } from './ContextWrapper.tsx';
import { SceneReadyContext } from '../context/SceneReadyContext.ts';
import { useState } from 'react';
import { usePlayerContext } from '../context/PlayerContext.ts';
import { usePartyContext } from '../context/PartyContext.ts';
import { StarredPosition } from '../helper/types.ts';
import { Player } from '@owlbear-rodeo/sdk';
import { Icon } from './atoms/Icon.tsx';
import { Button } from './atoms/Button.tsx';

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
        filteredPlayerIds,
        jumpTo,
        filterPlayer,
        filterAbsent,
        showAbsentPlayers
    } = useViewport();

    const [draftViewportName, setDraftViewportName] = useState<string>('');
    const { players } = usePartyContext();
    const currentUser = usePlayerContext();
    const allPlayers = [currentUser, ...(players ?? [])];
    const [showFilters, setShowFilters] = useState<boolean>(false);
    return (
        <div>
            <section className="extension-section">
                <div className="row" key="default">
                    <Button onClick={reset} className="wide-cell" aria-label="Reset viewport">
                        Reset Viewport
                    </Button>
                    <Button aria-label={showFilters ? "Hide filters" : "Show filters"} className="narrow-cell" onClick={() => setShowFilters((prev) => !prev)}>
                        <Icon name="filter_list" />
                    </Button>
                </div>
                {showFilters && (
                    <div className="filter"><div className="filters-section flex-row">
              {allPlayers?.map((player) => (
                <label className="switch" key={player.id}>
                  <span className="visually-hidden">Toggle player {player.name}</span>

                  <input
                    type="checkbox"
                    checked={!filteredPlayerIds.includes(player.id)}
                    onChange={(ev) => {
                      filterPlayer(player.id, ev.target.checked);
                    } }
                    aria-labelledby={`playerToggleLabel-${player.id}`} />
                  <span id={`playerToggleLabel-${player.id}`}
                    className="slider round"
                    style={!filteredPlayerIds.includes(player.id)
                      ? {
                        backgroundColor: player.color,
                        borderColor: player.color,
                      }
                      : { borderColor: player.color }}></span>
                </label>
              ))}</div><div className="filters-section flex-row">
                <span>Absent players:</span>
                <label className="switch">
                  <span className="visually-hidden">Toggle absent players</span>
                  <input
                    type="checkbox"
                    checked={showAbsentPlayers}
                    onChange={(ev) => {
                      filterAbsent(ev.target.checked);
                    } }
                    aria-labelledby="absentToggleLabel" />
                  <span id="absentToggleLabel"
                    className="slider round"
                    style={showAbsentPlayers
                      ? {
                        backgroundColor: "#111",
                        borderColor: "#111",
                      }
                      : { borderColor: "#111" }}></span>
                </label>
              </div></div>
                )}
            </section>
            <ul className="extension-section">
                {allPlayers
                    ?.filter(({ id }) => !filteredPlayerIds.includes(id))
                    .map((player) => (
                        <ControlGroup
                            {...{
                                currentUser,
                                deleteViewport,
                                color: player.color,
                                viewports: starredViewports.filter((v) => v.playerId === player.id),
                                jumpTo,
                                key: player.id,
                            }}
                        />
                    ))}
                <ControlGroup
                    {...{
                        currentUser,
                        deleteViewport,
                        viewports: starredViewports.filter(
                            (v) =>
                                !v?.playerId ||
                                !allPlayers.map(({ id }) => id).includes(v?.playerId),
                        ),
                        jumpTo,
                    }}
                />
            </ul>
            <section className="extension-section">
                <form
                    className="row"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        await starViewport(draftViewportName);
                        setDraftViewportName("");
                    }}>
                    <input
                        aria-label="Viewport Name"
                        placeholder="Enter viewport name"
                        value={draftViewportName}
                        onChange={(ev) => setDraftViewportName(ev.target.value)}
                        className="wide-cell"
                    />
                    <Button
                      aria-label="Save this viewport"
                        className="narrow-cell"
                        type="submit"
                        disabled={
                            !draftViewportName ||
                            starredViewports.map(({ name }) => name).includes(draftViewportName)
                        }>
                        OK
                    </Button>
                </form>
            </section>
        </div>
    );
};

type ViewportHandler = (viewport: StarredPosition) => Promise<void>;
type ViewportControlProps = {
    viewport: StarredPosition;
    deleteViewport: ViewportHandler;
    jumpTo: ViewportHandler;
    color?: string;
    disableDeletion: boolean;
};
export const ViewportControl: React.FC<ViewportControlProps> = ({
    viewport,
    jumpTo,
    color,
    deleteViewport,
    disableDeletion,
}) => {
    const [deleting, setDeleting] = useState<boolean>(false);
    return (
        <li className="row" key={viewport.id}>
            {deleting ? (
                <>
                    <Button aria-label="Cancel" onClick={() => setDeleting(false)} className="narrow-cell owned">
                        Cancel
                    </Button>
                    <Button
                        onClick={() => deleteViewport(viewport)}
                        aria-label={`Delete ${viewport.name}`}
                        className="wide-cell owned pulse-border"
                        disabled={disableDeletion}>
                        Delete {viewport.name}
                    </Button>
                </>
            ) : (
                <>
                    <Button
                    aria-label={`Go to viewport: ${viewport.name}`}
                        onClick={() => jumpTo(viewport)}
                        className="wide-cell owned"
                        style={{ borderColor: color }}>
                        {viewport.name}
                    </Button>
                    <Button
                        onClick={() => setDeleting(true)}
                        aria-label={`Delete ${viewport.name}`}
                        className="narrow-cell"
                        disabled={disableDeletion}>
                        <Icon name="delete" />
                    </Button>
                </>
            )}
        </li>
    );
};

type PlayerControlProps = {
    color?: string;
    viewports: StarredPosition[];
    currentUser: Player;
    deleteViewport: ViewportHandler;
    jumpTo: ViewportHandler;
};
export const ControlGroup: React.FC<PlayerControlProps> = ({
    viewports,
    color,
    currentUser,
    deleteViewport,
    jumpTo,
}) =>
    viewports.map((viewport) => (
        <ViewportControl
            {...{
                key: viewport.id,
                viewport,
                deleteViewport,
                jumpTo,
                color,
                disableDeletion: Boolean(
                    currentUser.role !== 'GM' &&
                        viewport.playerId &&
                        currentUser.id !== viewport.playerId,
                ),
            }}
        />
    ));
