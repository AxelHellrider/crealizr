export function Input({ value, onChange, type = "text", placeholder }: { value: string | number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; placeholder?: string }) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="ui-input w-full"
        />
    );
}
