import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getAdminDashboard } from "../../api/adminDashboardApi.js";
import { getApiErrorMessage } from "../../utils/apiError.js";
import {
    getCategoryLabel,
    getRegionLabel,
} from "../../data/legendOptions.js";

export default function AdminDashboardPage() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadDashboard = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAdminDashboard();
            setDashboard(data);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Nie udało się pobrać danych dashboardu."
                )
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadDashboard();
    }, [loadDashboard]);

    if (loading) {
        return <DashboardLoading />;
    }

    if (error) {
        return (
            <section className="rounded-xl border border-red-500/30 bg-red-950/20 p-6">
                <p className="text-sm font-semibold text-red-300">
                    Nie udało się załadować dashboardu
                </p>

                <p className="mt-2 text-sm text-red-200/70">
                    {error}
                </p>

                <button
                    type="button"
                    onClick={() => void loadDashboard()}
                    className="
                        mt-5 rounded-lg bg-red-500 px-4 py-2
                        text-sm font-semibold text-white
                        transition-colors hover:bg-red-400
                    "
                >
                    Spróbuj ponownie
                </button>
            </section>
        );
    }

    const dashboardCards = [
        {
            title: "Wszystkie legendy",
            value: dashboard?.legendsCount ?? 0,
            description: "Łączna liczba legend w systemie",
        },
        {
            title: "Użytkownicy",
            value: dashboard?.usersCount ?? 0,
            description: "Liczba zarejestrowanych kont",
        },
        {
            title: "Nowe w ostatnich 7 dniach",
            value: dashboard?.legendsLast7DaysCount ?? 0,
            description: "Legendy dodane w ciągu ostatniego tygodnia",
        },
        {
            title: "Nowe w ostatnich 30 dniach",
            value: dashboard?.legendsLast30DaysCount ?? 0,
            description: "Legendy dodane w ciągu ostatniego miesiąca",
        },
    ];

    return (
        <div className="space-y-8">
            <section>
                <p className="text-sm font-medium text-amber-500">
                    Panel główny
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white">
                    Dashboard administratora
                </h1>

                <p className="mt-3 max-w-3xl text-zinc-400">
                    Przegląd najważniejszych informacji dotyczących legend,
                    użytkowników i aktywności w aplikacji.
                </p>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {dashboardCards.map((card) => (
                    <article
                        key={card.title}
                        className="
                            rounded-xl border border-zinc-800 bg-zinc-900
                            p-5 shadow-lg shadow-black/10
                        "
                    >
                        <p className="text-sm font-medium text-zinc-400">
                            {card.title}
                        </p>

                        <p className="mt-4 text-4xl font-bold text-white">
                            {card.value}
                        </p>

                        <p className="mt-3 text-sm leading-6 text-zinc-500">
                            {card.description}
                        </p>
                    </article>
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <RecentLegends
                    legends={dashboard?.recentLegends ?? []}
                />

                <RecentUsers
                    users={dashboard?.recentUsers ?? []}
                />
            </section>
        </div>
    );
}

function RecentLegends({ legends }) {
    return (
        <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">
                    Ostatnio dodane legendy
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Pięć najnowszych treści w aplikacji
                </p>
            </div>

            {legends.length === 0 ? (
                <EmptyList message="Nie dodano jeszcze żadnych legend." />
            ) : (
                <ul className="divide-y divide-zinc-800">
                    {legends.map((legend) => (
                        <li
                            key={legend.id}
                            className="px-6 py-4 transition-colors hover:bg-zinc-800/40"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <Link
                                        to={`/legends?legendId=${legend.id}`}
                                        className="
                                            font-semibold text-white
                                            transition-colors hover:text-amber-400
                                        "
                                    >
                                        {legend.title}
                                    </Link>

                                    <p className="mt-1 text-sm text-zinc-500">
                                        Autor:{" "}
                                        {legend.authorUsername ||
                                            "Nieznany użytkownik"}
                                    </p>
                                </div>

                                <span className="shrink-0 text-xs text-zinc-600">
                                    #{legend.id}
                                </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-300">
                                    {getCategoryLabel(legend.category)}
                                </span>

                                <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs text-amber-300">
                                    {getRegionLabel(legend.region)}
                                </span>

                                <span className="text-xs text-zinc-600">
                                    {formatDate(legend.createdAt)}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </article>
    );
}

function RecentUsers({ users }) {
    return (
        <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <div className="border-b border-zinc-800 px-6 py-5">
                <h2 className="text-lg font-semibold text-white">
                    Ostatnio zarejestrowani użytkownicy
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                    Pięć najnowszych kont
                </p>
            </div>

            {users.length === 0 ? (
                <EmptyList message="Brak zarejestrowanych użytkowników." />
            ) : (
                <ul className="divide-y divide-zinc-800">
                    {users.map((user) => (
                        <li
                            key={user.id}
                            className="px-6 py-4 transition-colors hover:bg-zinc-800/40"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="font-semibold text-white">
                                        {user.username}
                                    </p>

                                    <p className="mt-1 truncate text-sm text-zinc-500">
                                        {user.email}
                                    </p>
                                </div>

                                <RoleBadge role={user.role} />
                            </div>

                            <p className="mt-3 text-xs text-zinc-600">
                                Rejestracja: {formatDate(user.createdAt)}
                            </p>
                        </li>
                    ))}
                </ul>
            )}
        </article>
    );
}

function RoleBadge({ role }) {
    const isAdmin = role === "ADMIN";

    return (
        <span
            className={`
                shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold
                ${
                isAdmin
                    ? "bg-amber-500/15 text-amber-300"
                    : "bg-indigo-500/15 text-indigo-300"
            }
            `}
        >
            {isAdmin ? "Administrator" : "Użytkownik"}
        </span>
    );
}

function EmptyList({ message }) {
    return (
        <div className="px-6 py-10 text-center text-sm text-zinc-500">
            {message}
        </div>
    );
}

function DashboardLoading() {
    return (
        <div className="space-y-8">
            <section>
                <div className="h-4 w-28 animate-pulse rounded bg-zinc-800" />
                <div className="mt-4 h-9 w-72 max-w-full animate-pulse rounded bg-zinc-800" />
                <div className="mt-4 h-4 w-full max-w-xl animate-pulse rounded bg-zinc-800" />
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                    <div
                        key={item}
                        className="h-40 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900"
                    />
                ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
                <div className="h-80 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
                <div className="h-80 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900" />
            </section>
        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "Brak daty";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Nieprawidłowa data";
    }

    return new Intl.DateTimeFormat("pl-PL", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}