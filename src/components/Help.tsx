import { Icon } from './atoms/Icon';

export const Help = () => (
    <>
        {' '}
        <div>
            Support: <a style={{color: "#4AE"}} target="_blank" href="https://ko-fi.com/omarbenmegdoul">https://ko-fi.com/omarbenmegdoul</a>
        </div>
        <ul className="help">
            <li>Use the "Reset View" button to move your viewport back to the scene default.</li>
            <li>
                Use the "Player Images" button to move to the location of player-owned images
                (typically their character tokens).
            </li>
            <li>
                Save the current viewport by typing a name in the input field and pressing OK. You
                and other players can now return to it anytime.
            </li>
            <li>
                Viewports are colored according to the player who created them. Use the{' '}
                <Icon name="filter_list" /> button to hide other players' saved viewports.
            </li>
            <li>
                Use the <Icon name="delete" /> button to delete a viewport you saved.
            </li>
        </ul>
    </>
);
