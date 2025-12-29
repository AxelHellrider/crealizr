export function Button({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="inline-flex ui-button"
        >
            {children}
        </button>
    );
}
