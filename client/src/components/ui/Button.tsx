interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    variant?: 'primary' | 'secondary';
    className?: string;
}

const Button: React.FC<ButtonProps> = ({
    onClick,
    children,
    variant = 'primary',
    className = ''
}) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors';
    const variantClasses = variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : 'bg-gray-300 text-gray-800 hover:bg-gray-400';

    return (
        <button
            onClick={onClick}
            className={`${baseClasses} ${variantClasses} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
