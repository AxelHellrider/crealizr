export type DocSection = { heading: string; html: string };

/** Renders a docs page's reference sections — flat, dense, documentary. Body HTML may use <p>/<ul>/<ol>/<code>/<strong>/<em>, all styled via .doc-body in globals.css. */
export function DocSections({ sections, note, children }: { sections: DocSection[]; note?: string; children?: React.ReactNode }) {
    return (
        <div className="grid gap-6">
            {sections.map((section, i) => (
                <section key={i} className="border border-gold/20 bg-card/40 p-6">
                    <h2 className="text-lg font-serif uppercase tracking-wide accent-gold">{section.heading}</h2>
                    <div className="doc-body mt-2" dangerouslySetInnerHTML={{ __html: section.html }} />
                    {children && i === sections.length - 1 && children}
                </section>
            ))}
            {note && <p className="text-xs text-muted italic border-t border-gold/10 pt-4">{note}</p>}
        </div>
    );
}
