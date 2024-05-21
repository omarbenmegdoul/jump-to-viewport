import { useViewport } from '../viewport/useViewport.ts';
import { ContextWrapper } from './ContextWrapper.tsx';
import { SceneReadyContext } from '../context/SceneReadyContext.ts';
import { useState } from 'react';
import { usePlayerContext } from '../context/PlayerContext.ts';
import { usePartyContext } from '../context/PartyContext.ts';
import { Icon } from './atoms/Icon.tsx';
import { Button } from './atoms/Button.tsx';
import { ControlGroup } from './ControlGroup.tsx';
import { Help } from './Help.tsx';

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
        showAbsentPlayers,
        jumpToPlayerItems,
    } = useViewport();

    const [draftViewportName, setDraftViewportName] = useState<string>('');
    const { players, nonGMPlayers } = usePartyContext();
    const currentUser = usePlayerContext();
    const allPlayers = [currentUser, ...(players ?? [])];
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [showHelp, setShowHelp] = useState<boolean>(false);

    return (
        <div>
            <section className="extension-section">
                <div className="row" key="default">
                    <Button onClick={reset} className="wide-cell" aria-label="Reset viewport">
                        Reset
                    </Button>
                    <Button
                        onClick={jumpToPlayerItems}
                        className="wide-cell"
                        aria-label="Player Images"
                        disabled={!Boolean(nonGMPlayers?.length)}>
                        Player Images
                    </Button>
                    <Button
                        aria-label={showFilters ? 'Hide filters' : 'Show filters'}
                        className={`narrowest-cell ${showFilters ? 'enabled' : ''}`}
                        onClick={() => setShowFilters((prev) => !prev)}>
                        <Icon name="filter_list" size="small" toggled={showFilters} />
                    </Button>
                    <Button
                        aria-label={showHelp ? 'Hide help' : 'Show help'}
                        className={`narrowest-cell ${showHelp ? 'enabled' : ''}`}
                        onClick={() => setShowHelp((prev) => !prev)}>
                        <Icon name="help" size="small" toggled={showHelp} />
                    </Button>
                </div>
                {showFilters && (
                    <div className="filter">
                        <div className="filters-section flex-row">
                            {allPlayers?.map((player) => (
                                <label className="switch" key={player.id}>
                                    <span className="visually-hidden">
                                        Toggle player {player.name}
                                    </span>

                                    <input
                                        type="checkbox"
                                        checked={!filteredPlayerIds.includes(player.id)}
                                        onChange={(ev) => {
                                            filterPlayer(player.id, ev.target.checked);
                                        }}
                                        aria-labelledby={`playerToggleLabel-${player.id}`}
                                    />
                                    <span
                                        id={`playerToggleLabel-${player.id}`}
                                        className="slider round"
                                        style={
                                            !filteredPlayerIds.includes(player.id)
                                                ? {
                                                      backgroundColor: player.color,
                                                      borderColor: player.color,
                                                  }
                                                : { borderColor: player.color }
                                        }></span>
                                </label>
                            ))}
                        </div>
                        <div className="filters-section flex-row">
                            <span>Absent players:</span>
                            <label className="switch">
                                <span className="visually-hidden">Toggle absent players</span>
                                <input
                                    type="checkbox"
                                    checked={showAbsentPlayers}
                                    onChange={(ev) => {
                                        filterAbsent(ev.target.checked);
                                    }}
                                    aria-labelledby="absentToggleLabel"
                                />
                                <span
                                    id="absentToggleLabel"
                                    className="slider round"
                                    style={
                                        showAbsentPlayers
                                            ? {
                                                  backgroundColor: '#111',
                                                  borderColor: '#111',
                                              }
                                            : { borderColor: '#111' }
                                    }></span>
                            </label>
                        </div>
                    </div>
                )}
            </section>
            {showHelp && <Help/>}
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
                        setDraftViewportName('');
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
