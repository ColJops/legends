import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { register, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/legends", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError("");

        try {
            await register(form);
            toast.success("Konto zostało utworzone. Możesz się zalogować.");
            navigate("/login");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Nie udało się utworzyć konta.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-md py-16">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white">Rejestracja</h1>

                <p className="mt-2 text-sm text-zinc-400">
                    Utwórz konto, aby dodawać własne legendy.
                </p>

                {error && (
                    <div className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Nazwa użytkownika"
                        required
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                    />

                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                    />

                    <input
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Hasło"
                        required
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading ? "Tworzenie konta..." : "Zarejestruj"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-zinc-400">
                    Masz już konto?{" "}
                    <Link to="/login" className="text-indigo-300 hover:text-indigo-200">
                        Zaloguj się
                    </Link>
                </p>
            </div>
        </section>
    );
}