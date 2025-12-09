import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 w-full">
            <div className="page-wrap glass-panel flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <Link href="/" className="text-xl font-semibold accent-orange">
                    CRializr
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-6 text-sm">
                    <Link className="ui-link transition" href="/scale">
                        CR Scaler
                    </Link>
                    <Link className="ui-link transition" href="/balance">
                        Combat Balancer
                    </Link>
                    <Link className="ui-link transition" href="/items">
                        Item Creator
                    </Link>

                    <a href="https://github.com/your-repo" target="_blank" className="ui-button">
                        GitHub
                    </a>
                </nav>
            </div>
        </header>
    );
}