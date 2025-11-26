import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b-white bg-black/80 backdrop-blur-lg">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                {/* Logo */}
                <Link href="/" className="text-xl font-semibold text-[#ff9900]">
                    CRializr
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6 text-fog">
                    <Link className="hover:text-[#45dbaa] transition" href="/monsters">
                        Monsters
                    </Link>
                    <Link className="hover:text-[#45dbaa] transition" href="/scale">
                        Scaler
                    </Link>
                    <Link className="hover:text-[#45dbaa] transition" href="/docs">
                        Docs
                    </Link>

                    <a
                        href="https://github.com/your-repo"
                        target="_blank"
                        className="rounded-md border border-[#45dbaa] px-3 py-1 text-[#45dbaa] hover:bg-[#45dbaa] hover:text-black transition"
                    >
                        GitHub
                    </a>
                </nav>
            </div>
        </header>
    );
}