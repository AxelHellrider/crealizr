export function Button({ children, onClick, type = "button" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit" }) {
    return (
        <button
            type={type}
            onClick={onClick}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded transition"
        >
            {children}
        </button>
    );
}
