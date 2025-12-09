export function Select({ value, onChange, children, className = "", name, id }: {
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
  name?: string;
  id?: string;
}) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      className={`ui-select w-full ${className}`}
    >
      {children}
    </select>
  );
}
