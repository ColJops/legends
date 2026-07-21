import { NavLink, Outlet } from "react-router-dom";

const navigationItems = [
    {
        to: "/admin/dashboard",
        label: "Dashboard",
    },
    {
        to: "/admin/legends",
        label: "Legendy",
    },
    {
        to: "/admin/users",
        label: "Użytkownicy",
    },
    {
        to: "/admin/media",
        label: "Pliki i obrazy",
    },
    {
        to: "/admin/audit-logs",
        label: "Dziennik działań",
    },
];

function getNavLinkClass({ isActive }) {
    const baseClasses =
        "block rounded-lg px-4 py-3 text-sm font-medium transition-colors";

    if (isActive) {
        return `${baseClasses} bg-amber-500 text-zinc-950`;
    }

    return `${baseClasses} text-zinc-300 hover:bg-zinc-800 hover:text-white`;
}

export default function AdminLayout() {
    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 lg:grid lg:grid-cols-[260px_1fr]">
            <aside className="border-b border-zinc-800 bg-zinc-900 lg:min-h-screen lg:border-b-0 lg:border-r">
                <div className="border-b border-zinc-800 px-6 py-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">
                        Legends
                    </p>

                    <h1 className="mt-2 text-xl font-bold">
                        Panel administratora
                    </h1>
                </div>

                <nav
                    className="
                        flex gap-2 overflow-x-auto p-4
                        lg:flex-col lg:overflow-visible
                    "
                    aria-label="Nawigacja administratora"
                >
                    {navigationItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={getNavLinkClass}
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="hidden border-t border-zinc-800 p-4 lg:block">
                    <NavLink
                        to="/"
                        className="
                            block rounded-lg border border-zinc-700 px-4 py-3
                            text-center text-sm font-medium text-zinc-300
                            transition-colors hover:border-amber-500
                            hover:text-amber-400
                        "
                    >
                        Powrót do aplikacji
                    </NavLink>
                </div>
            </aside>

            <section className="min-w-0">
                <header className="border-b border-zinc-800 bg-zinc-900/80 px-6 py-5">
                    <div className="mx-auto flex max-w-7xl items-center justify-between">
                        <div>
                            <p className="text-sm text-zinc-400">
                                Zarządzanie aplikacją
                            </p>

                            <h2 className="text-lg font-semibold text-white">
                                Admin & Content Management
                            </h2>
                        </div>

                        <NavLink
                            to="/"
                            className="
                                rounded-lg border border-zinc-700 px-4 py-2
                                text-sm text-zinc-300 transition-colors
                                hover:border-amber-500 hover:text-amber-400
                                lg:hidden
                            "
                        >
                            Wyjdź
                        </NavLink>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </section>
        </div>
    );
}