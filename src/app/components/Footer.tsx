import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full">
            <div className="page-wrap glass-panel mt-8 flex flex-col md:flex-row justify-between gap-10">

                {/* Brand */}
                <div>
                    <h2 className="text-xl font-semibold accent-orange">CRealizr</h2>
                    <p className="mt-2 max-w-sm text-sm text-zinc-400">
                        Various tools for Dungeons & Dragons 2014 & 2024.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-2 text-sm">
                    <Link href="/scale" className="block ui-link transition">
                        CR Scaler
                    </Link>
                    <Link href="/balance" className="block ui-link transition">
                        Combat Balancer
                    </Link>
                    <Link href="/items" className="block ui-link transition">
                        Item Creator
                    </Link>
                    <a
                        href="https://github.com/your-repo"
                        target="_blank"
                        className="block ui-link transition"
                    >
                        GitHub
                    </a>
                </div>

                {/* Legal */}
                <div className="text-xs text-zinc-500 max-w-sm">
                    <p>
                        Built for D&D 2014 + 2024 rulesets.
                        Not affiliated with Wizards of the Coast.
                    </p>
                    <p className="mt-4">© {new Date().getFullYear()} CRializr.</p>
                </div>
            </div>

            {/* Arcane runes strip */}
            <div className="w-full">
                <div className="flex justify-center py-4 accent-purple text-sm tracking-widest select-none">
                    ✦ ✧ ✦ ✧ ✦
                </div>
            </div>
        </footer>
    );
}
