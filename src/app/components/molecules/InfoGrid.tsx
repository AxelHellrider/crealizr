import { Card } from "@/app/components/atoms/Card";

type InfoItem = {
    label: string;
    description: string;
};

export function InfoGrid({ items }: { items: InfoItem[] }) {
    return (
        <Card className="p-6 border-gold/10">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 text-sm">
                {items.map((item) => (
                    <div key={item.label}>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{item.label}</div>
                        <p className="text-muted mt-2">{item.description}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}
