import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link
                    to="/"
                    className="text-xl font-bold text-violet-500 transition-colors hover:text-violet-400"
                >
                    🏰 Legends
                </Link>

                <nav className="flex items-center gap-6 text-sm font-medium text-zinc-300">
                    <Link
                        to="/"
                        className="transition-colors hover:text-violet-400"
                    >
                        Start
                    </Link>

                    <Link
                        to="/legends"
                        className="transition-colors hover:text-violet-400"
                    >
                        Legendy
                    </Link>

                    <a
                        href="#about"
                        className="transition-colors hover:text-violet-400"
                    >
                        O projekcie
                    </a>

                    <Link
                        to="/login"
                        className="transition-colors hover:text-violet-400"
                    >
                        Zaloguj
                    </Link>

                    <Link
                        to="/register"
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 transition hover:border-violet-500 hover:text-white"
                    >
                        Rejestracja
                    </Link>
                </nav>
            </div>
        </header>
    );
}