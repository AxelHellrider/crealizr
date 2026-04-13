interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
    return (
        <input
            {...props}
            className={`ui-input w-full min-h-[44px] sm:min-h-[38px] transition-all duration-200 ${className || ""}`}
        />
    );
}
