interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

export function Button({ children, className = "", ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={`inline-flex items-center justify-center ui-button min-h-[44px] sm:min-h-[38px] active:scale-95 touch-manipulation ${className}`}
        >
            {children}
        </button>
    );
}
