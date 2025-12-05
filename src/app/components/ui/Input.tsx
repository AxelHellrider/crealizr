export function Input({ value, onChange, type = "text", placeholder }: { value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="bg-zinc-800 border border-zinc-600 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
    );
}
