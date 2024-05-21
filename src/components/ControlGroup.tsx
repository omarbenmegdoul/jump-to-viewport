import { Player } from '@owlbear-rodeo/sdk';
import { StarredBox, StarredLegacy, ViewportHandler } from 'helper/types';
import { ViewportControl } from './ViewportControl';

type PlayerControlProps = {
    color?: string;
    viewports: Array<StarredBox | StarredLegacy>;
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
