import { Link } from "react-router-dom";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="mt-24 border-t border-zinc-800 bg-zinc-950">
            <div className="mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                    <div>
                        <Link
                            to="/"
                            className="text-xl font-bold text-violet-500 transition-colors hover:text-violet-400"
                        >
                            🏰 Legends
                        </Link>

                        <p className="mt-3 max-w-md text-sm leading-6 text-zinc-400">
                            Aplikacja do odkrywania, dodawania i zachowywania
                            polskich legend, podań oraz lokalnych opowieści.
                        </p>
                    </div>

                    <nav className="flex flex-wrap gap-5 text-sm text-zinc-400">
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

                        <a
                            href="https://github.com/ColJops/legends"
                            target="_blank"
                            rel="noreferrer"
                            className="transition-colors hover:text-violet-400"
                        >
                            GitHub
                        </a>
                    </nav>
                </div>

                <div className="mt-8 flex flex-col gap-3 border-t border-zinc-800 pt-6 text-sm text-zinc-500 md:flex-row md:items-center md:justify-between">
                    <p>
                        © {currentYear} Legends. Wszystkie prawa zastrzeżone.
                    </p>

                    <p>
                        Built with React, Spring Boot, MySQL and Flyway.
                    </p>
                </div>
            </div>
        </footer>
    );
}