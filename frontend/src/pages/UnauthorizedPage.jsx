import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
    return (
        <section className="mx-auto max-w-2xl py-20 text-center">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10">
                <p className="text-5xl">🛡️</p>

                <h1 className="mt-6 text-3xl font-bold text-white">
                    Brak dostępu
                </h1>

                <p className="mt-3 text-zinc-400">
                    Nie masz uprawnień do wykonania tej akcji.
                </p>

                <Link
                    to="/legends"
                    className="mt-8 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                    Wróć do legend
                </Link>
            </div>
        </section>
    );
}