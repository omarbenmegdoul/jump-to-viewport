import { useViewport } from '../viewport/useViewport.ts';
import { ContextWrapper } from './ContextWrapper.tsx';
import { SceneReadyContext } from '../context/SceneReadyContext.ts';
import { useState } from 'react';
import { usePlayerContext } from '../context/PlayerContext.ts';

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

    const { id: playerId, role } = usePlayerContext();

    const [draftViewportName, setDraftViewportName] = useState<string>('');

    return (
        <div>
            <ul>
                <li key="default">
                    <button onClick={reset} className="reset" aria-label="Reset viewport">
                        Reset Viewport
                    </button>
                </li>
                {starredViewports.map((v) => (
                    <li className="row" key={v.id}>
                        <button onClick={() => jumpTo(v)} className="wide-cell">
                            {v.name}
                        </button>
                        <button
                            onClick={() => deleteViewport(v)}
                            aria-label={`Delete ${v.name}`}
                            className="narrow-cell"
                            disabled={Boolean(
                                role !== 'GM' && v.playerId && playerId !== v.playerId,
                            )}>
                            ❌
                        </button>
                    </li>
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
