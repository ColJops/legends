import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import LegendCard from "../components/LegendCard";
import LoadingScreen from "../components/LoadingScreen";
import api from "../services/api";
import { getAccountSettings } from "../services/authApi";

export default function UserProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [recentLegends, setRecentLegends] = useState([]);
    const [legendCount, setLegendCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        Promise.all([
            getAccountSettings(),
            api.get("/legends/mine", {
                params: {
                    page: 0,
                    size: 3,
                    sortBy: "createdAt",
                    direction: "desc",
                },
            }),
        ])
            .then(([account, legendsResponse]) => {
                if (!active) return;
                setProfile(account);
                setRecentLegends(legendsResponse.data.content || []);
                setLegendCount(legendsResponse.data.totalElements || 0);
            })
            .catch(() => {
                if (active) setError("Nie udało się pobrać danych profilu.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, []);

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <section className="mx-auto max-w-4xl py-12">
                <div role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6 text-red-300">
                    {error}
                </div>
            </section>
        );
    }

    const joinedAt = profile?.createdAt
        ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" })
            .format(new Date(profile.createdAt))
        : "—";
    const initials = (profile?.username || "U").slice(0, 1).toUpperCase();

    return (
        <section className="mx-auto max-w-6xl space-y-8 py-6">
            <header className="flex flex-wrap items-center gap-5 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <div
                    aria-hidden="true"
                    className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-500/15 text-3xl font-bold text-indigo-300"
                >
                    {initials}
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                        Profil użytkownika
                    </p>
                    <h1 className="mt-2 break-words text-3xl font-bold text-white">
                        {profile?.username}
                    </h1>
                    <p className="mt-1 text-sm text-zinc-400">Członek od {joinedAt}</p>
                </div>
                <Link
                    to="/account/settings"
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-indigo-500 hover:text-white"
                >
                    Ustawienia konta
                </Link>
            </header>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Moja aktywność</h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            Twoje opowieści i wkład w kolekcję legend.
                        </p>
                    </div>
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-5 py-3">
                        <p className="text-2xl font-bold text-indigo-300">{legendCount}</p>
                        <p className="text-xs text-zinc-400">dodanych opowieści</p>
                    </div>
                </div>

                {recentLegends.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 text-sm text-zinc-400">
                        {user?.role === "ADMIN"
                            ? "Nie masz jeszcze własnych opowieści. Możesz dodać pierwszą w panelu administratora."
                            : "Nie masz jeszcze własnych opowieści. Możesz dodać pierwszą w sekcji Moje legendy."}
                    </div>
                ) : (
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {recentLegends.map((legend) => (
                            <LegendCard key={legend.id} legend={legend} />
                        ))}
                    </div>
                )}

                <Link
                    to={user?.role === "ADMIN" ? "/admin/legends" : "/my-legends"}
                    className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                    {user?.role === "ADMIN" ? "Otwórz panel legend" : "Zarządzaj moimi legendami"}
                </Link>
            </section>
        </section>
    );
}
