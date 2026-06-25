import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                <Link
                    to="/"
                    className="text-xl font-bold text-violet-500"
                >
                    Polish Legends
                </Link>

                <nav className="flex gap-6 text-sm font-medium">

                    <Link
                        to="/"
                        className="hover:text-violet-400 transition-colors"
                    >
                        Home
                    </Link>

                    <Link
                        to="/legends"
                        className="hover:text-violet-400 transition-colors"
                    >
                        Legendy
                    </Link>

                    <Link
                        to="/login"
                        className="hover:text-violet-400 transition-colors"
                    >
                        Login
                    </Link>

                    <Link
                        to="/register"
                        className="hover:text-violet-400 transition-colors"
                    >
                        Register
                    </Link>

                </nav>

            </div>
        </header>
    );
}