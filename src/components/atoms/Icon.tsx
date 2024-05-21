export type IconProps = { name: string; size?: 'small'; toggled?: boolean };

export const Icon: React.FC<IconProps> = ({ name, size, toggled }) => {
    return (
        <span className={`material-symbols-outlined ${size || ''} ${toggled ? 'toggled' : ''}`}>
            {name}
        </span>
    );
};
