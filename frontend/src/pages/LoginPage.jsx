import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/legends", { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const location = useLocation();

    const [form, setForm] = useState({
        username: "",
        password: "",
    });



    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const redirectTo = location.state?.from?.pathname || "/legends";

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
            await login(form);
            toast.success("Zalogowano pomyślnie.");
            navigate(redirectTo, { replace: true });
        } catch (error) {
            const message =
                error?.response?.data?.message || "Nie udało się zalogować.";

            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-md py-16">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-xl">
                <h1 className="text-3xl font-bold text-white">Logowanie</h1>

                <p className="mt-2 text-sm text-zinc-400">
                    Zaloguj się, aby dodawać i edytować legendy.
                </p>

                {location.state?.from && (
                    <div className="mt-6 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200">
                        Zaloguj się, aby kontynuować.
                    </div>
                )}

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
                        {loading ? "Logowanie..." : "Zaloguj"}
                    </button>
                </form>

                <p className="mt-6 text-sm text-zinc-400">
                    Nie masz konta?{" "}
                    <Link to="/register" className="text-indigo-300 hover:text-indigo-200">
                        Zarejestruj się
                    </Link>
                </p>
            </div>
        </section>
    );
}