export const Button: React.FC<
    React.PropsWithChildren<
        React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
    >
> = ({ children, ...buttonAttributes }) => {
    return (
        <button {...buttonAttributes}>
            <span className="ellipsis">{children}</span>
        </button>
    );
};
