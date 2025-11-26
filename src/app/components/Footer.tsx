export default function Footer() {
    return (
        <footer className="w-full bg-transparent text-fog">
            <div className="mx-auto max-w-6xl p-6 flex flex-col md:flex-row justify-between gap-10">

                {/* Brand */}
                <div>
                    <h2 className="text-xl font-semibold text-[#ff9900]">CRializr</h2>
                    <p className="mt-2 max-w-sm text-sm text-ash">
                        Tools for Dungeon Masters who engineer their encounters.
                    </p>
                </div>

                {/* Quick Links */}
                <div className="space-y-2 text-sm">
                    <a href="/monsters" className="block hover:text-[#45dbaa] transition">
                        Monsters
                    </a>
                    <a href="/scale" className="block hover:text-[#45dbaa] transition">
                        Scaler
                    </a>
                    <a href="/docs" className="block hover:text-[#45dbaa] transition">
                        Docs
                    </a>
                    <a
                        href="https://github.com/your-repo"
                        target="_blank"
                        className="block hover:text-[#45dbaa] transition"
                    >
                        GitHub
                    </a>
                </div>

                {/* Legal */}
                <div className="text-xs text-ash max-w-sm">
                    <p>
                        Built for D&D 2014 + 2024 rulesets.
                        Not affiliated with Wizards of the Coast.
                    </p>
                    <p className="mt-4">© {new Date().getFullYear()} CRializr.</p>
                </div>
            </div>

            {/* Arcane runes strip */}
            <div className="w-full">
                <div className="flex justify-center py-4 text-[#4511bd] text-sm tracking-widest select-none">
                    ✦ ✧ ✦ ✧ ✦
                </div>
            </div>
        </footer>
    );
}
