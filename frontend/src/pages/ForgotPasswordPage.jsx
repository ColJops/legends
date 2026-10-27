import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../services/authApi";

const GENERIC_SUCCESS =
    "Jeżeli konto istnieje i może zresetować hasło, wyślemy instrukcję na podany adres.";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage("");
        setError("");

        try {
            await requestPasswordReset(email.trim());
            setMessage(GENERIC_SUCCESS);
        } catch (requestError) {
            setError(
                requestError?.response?.data?.message
                    || "Nie udało się wysłać prośby. Spróbuj ponownie później."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-md py-16">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white">Reset hasła</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Podaj adres e-mail przypisany do konta. Wyślemy instrukcję resetowania hasła.
                </p>

                {message && (
                    <div role="status" className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                        {message}
                    </div>
                )}
                {error && (
                    <div role="alert" className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <label className="block text-sm text-zinc-300" htmlFor="reset-email">
                        Adres e-mail
                    </label>
                    <input
                        id="reset-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Wysyłanie..." : "Wyślij instrukcję"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-zinc-400">
                    Pamiętasz hasło?{" "}
                    <Link to="/login" className="text-indigo-300 hover:text-indigo-200">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </section>
    );
}
