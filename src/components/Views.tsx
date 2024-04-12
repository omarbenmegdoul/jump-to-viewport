import { useViewport } from '../viewport/useViewport.ts';
import { ContextWrapper } from './ContextWrapper.tsx';
import { SceneReadyContext } from '../context/SceneReadyContext.ts';

export const Views = () => {
    const { isReady } = SceneReadyContext();
    return <ContextWrapper>{isReady ? <Content /> : 'loading'}</ContextWrapper>;
};

const Content = () => {
    const {
        reset,
        deleteViewport,
        starViewport,
        setDraftViewportName,
        starredViewports,
        draftViewportName,
        jumpTo,
    } = useViewport();
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
                        <button onClick={() => jumpTo(v.id)} className="wide-cell">
                            {v.name}
                        </button>
                        <button
                            onClick={() => deleteViewport(v.id)}
                            aria-label={`Delete ${v.name}`}
                            className="narrow-cell">
                            ❌
                        </button>
                    </li>
                ))}

                    <form className="row"
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
                        <button className="narrow-cell" type="submit">
                            OK
                        </button>
                    </form>
 
            </ul>
        </div>
    );
};
