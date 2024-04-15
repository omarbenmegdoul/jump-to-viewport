export type IconProps = { name: string };

export const Icon: React.FC<IconProps> = ({ name }) => {
    return <span className={`material-symbols-outlined`}>{name}</span>;
};
