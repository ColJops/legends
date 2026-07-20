import { Link, NavLink, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        toast.dismiss();
        logout();
        toast.success("Wylogowano pomyślnie.");
        navigate("/");
    };

    const linkClass = ({ isActive }) =>
        isActive
            ? "text-violet-400"
            : "transition-colors hover:text-violet-400";

    return (
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="text-xl font-bold text-violet-500 transition-colors hover:text-violet-400"
                    >
                        🏰 Legends
                    </Link>

                    {isAuthenticated && (
                        <span className="hidden rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-300 md:inline-flex">
                            Witaj,{" "}
                            <span className="ml-1 font-semibold text-white">
                                {user?.username}
                            </span>
                            !

                            {user?.role === "ADMIN" && (
                                <span className="ml-2 rounded-lg bg-amber-500/10 px-2 py-0.5 text-xs font-bold text-amber-300">
                                    ADMIN
                                </span>
                            )}
                        </span>
                    )}
                </div>

                <nav className="flex items-center gap-6 text-sm font-medium text-zinc-300">
                    <NavLink to="/" className={linkClass}>
                        Start
                    </NavLink>

                    <NavLink to="/legends" className={linkClass}>
                        Legendy
                    </NavLink>

                    <a
                        href="#about"
                        className="transition-colors hover:text-violet-400"
                    >
                        O projekcie
                    </a>

                    {isAuthenticated ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 transition hover:border-red-500 hover:text-red-300"
                        >
                            Wyloguj
                        </button>
                    ) : (
                        <>
                            <NavLink to="/login" className={linkClass}>
                                Zaloguj
                            </NavLink>

                            <Link
                                to="/register"
                                className="rounded-xl border border-zinc-700 px-4 py-2 text-zinc-200 transition hover:border-violet-500 hover:text-white"
                            >
                                Rejestracja
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}