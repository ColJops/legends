import { Link } from "react-router-dom";

export default function HeroSection() {
    return (
        <section className="py-20 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-violet-400">
                Aplikacja Legendy
            </p>

            <h1 className="mt-4 text-5xl font-extrabold tracking-tight md:text-7xl">
                Polskie Legendy
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-400">
                Odkrywaj legendy, podania i opowieści z każdego regionu Polski.
                Przeglądaj historie, poznawaj miejsca i dodawaj własne opowieści.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                    to="/legends"
                    className="rounded-xl bg-violet-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-violet-500"
                >
                    Przeglądaj legendy
                </Link>

                <Link
                    to="/register"
                    className="rounded-xl border border-zinc-700 px-8 py-4 text-lg font-semibold text-zinc-300 transition hover:border-violet-500 hover:text-white"
                >
                    Dodaj swoją legendę
                </Link>
            </div>
        </section>
    );
}