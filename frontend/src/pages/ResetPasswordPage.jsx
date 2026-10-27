import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { resetPassword } from "../services/authApi";

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token") || "";
    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(
        token ? "" : "Link resetowania hasła jest nieprawidłowy lub nie zawiera tokena."
    );

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (form.password !== form.confirmPassword) {
            setError("Podane hasła nie są takie same.");
            return;
        }

        setLoading(true);
        try {
            await resetPassword({ token, newPassword: form.password });
            toast.success("Hasło zostało zmienione. Możesz się zalogować.");
            navigate("/login", { replace: true });
        } catch (requestError) {
            const message = requestError?.response?.data?.message
                || "Nie udało się zmienić hasła. Poproś o nowy link resetujący.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-md py-16">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white">Ustaw nowe hasło</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Wybierz nowe hasło do swojego konta.
                </p>

                {error && (
                    <div role="alert" className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                {token && (
                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <label className="block text-sm text-zinc-300" htmlFor="new-password">
                            Nowe hasło
                        </label>
                        <input
                            id="new-password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                            required
                            value={form.password}
                            onChange={(event) => setForm((current) => ({
                                ...current,
                                password: event.target.value,
                            }))}
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />
                        <label className="block text-sm text-zinc-300" htmlFor="confirm-password">
                            Powtórz nowe hasło
                        </label>
                        <input
                            id="confirm-password"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            minLength={8}
                            maxLength={100}
                            required
                            value={form.confirmPassword}
                            onChange={(event) => setForm((current) => ({
                                ...current,
                                confirmPassword: event.target.value,
                            }))}
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Zapisywanie..." : "Zmień hasło"}
                        </button>
                    </form>
                )}

                <p className="mt-6 text-sm text-zinc-400">
                    <Link to="/forgot-password" className="text-indigo-300 hover:text-indigo-200">
                        Poproś o nowy link resetujący
                    </Link>
                </p>
            </div>
        </section>
    );
}
