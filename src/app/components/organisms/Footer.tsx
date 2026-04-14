import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full mt-24">
            <div className="w-full bg-card/30 border-t border-gold/20 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12 px-8 py-20">
                    {/* Brand */}
                    <div className="space-y-6">
                        <div className="inline-block px-4 py-1 border border-gold/30 bg-gold/5 rounded-sm">
                            <h2 className="text-2xl font-serif accent-gold uppercase tracking-[0.2em]">CRealizr</h2>
                        </div>
                        <p className="max-w-sm text-sm text-muted font-light leading-relaxed">
                            High-precision tabletop utilities for Dungeons & Dragons Game Masters. 
                            Built for reliability, speed, and accuracy at the table.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 border-b border-gold/10 pb-2">Utilities</h3>
                            <nav className="flex flex-col gap-2 text-sm font-semibold tracking-widest">
                                <Link href="/scale" className="ui-link transition uppercase hover:text-gold">Scaler</Link>
                                <Link href="/balance" className="ui-link transition uppercase hover:text-gold">Balancer</Link>
                                <Link href="/encounters-en-route" className="ui-link transition uppercase hover:text-gold">En Route</Link>
                                <Link href="/items" className="ui-link transition uppercase hover:text-gold">Forge</Link>
                            </nav>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 border-b border-gold/10 pb-2">Project</h3>
                            <nav className="flex flex-col gap-2 text-sm font-semibold tracking-widest">
                                <a href="https://github.com/AxelHellrider" target="_blank" rel="noreferrer" className="ui-link transition uppercase hover:text-gold">GitHub</a>
                                <Link href="/docs" className="ui-link transition uppercase hover:text-gold">Docs</Link>
                            </nav>
                        </div>
                    </div>

                    {/* Legal/Ruleset */}
                    <div className="max-w-xs space-y-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold/60 border-b border-gold/10 pb-2">Verification</h3>
                        <p className="text-xs text-muted leading-relaxed">
                            Validated for 2014 & 2024 SRD rulesets.
                            Independent development; not affiliated with Wizards of the Coast.
                        </p>
                        <p className="font-serif accent-gold opacity-60 uppercase tracking-widest text-[10px] pt-4">© {new Date().getFullYear()} — All Rights Reserved.</p>
                    </div>
                </div>
            </div>

            {/* Decorative strip */}
            <div className="w-full border-t border-gold/10 bg-card/10">
                <div className="flex justify-center py-8 accent-gold text-lg tracking-[1.5em] select-none opacity-10">
                    ✦ ✧ ✦ ✧ ✦
                </div>
            </div>
        </footer>
    );
}
