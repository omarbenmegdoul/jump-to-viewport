import { StarredBox, StarredLegacy, ViewportHandler } from 'helper/types';
import { useState } from 'react';
import { Button } from './atoms/Button';
import { Icon } from './atoms/Icon';

type ViewportControlProps = {
    viewport: StarredBox | StarredLegacy;
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
                    <Button
                        aria-label="Cancel"
                        onClick={() => setDeleting(false)}
                        className="narrow-cell owned">
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
