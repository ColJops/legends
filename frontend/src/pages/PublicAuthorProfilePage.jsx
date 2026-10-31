import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import LegendCard from "../components/LegendCard";
import LoadingScreen from "../components/LoadingScreen";
import { getPublicUserProfile } from "../services/authApi";
import { getApiErrorMessage } from "../utils/apiError";

export default function PublicAuthorProfilePage() {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        setError("");

        getPublicUserProfile(username)
            .then((data) => {
                if (active) setProfile(data);
            })
            .catch((requestError) => {
                if (active) {
                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Nie udało się pobrać profilu użytkownika."
                        )
                    );
                }
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [username]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error || !profile) {
        return (
            <section className="mx-auto max-w-3xl py-16 text-center">
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-10">
                    <h1 className="text-2xl font-bold text-white">
                        Nie znaleziono profilu
                    </h1>
                    <p className="mt-3 text-sm text-zinc-400">
                        {error || "Wskazany użytkownik nie istnieje."}
                    </p>
                    <Link
                        to="/legends"
                        className="mt-6 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                        Wróć do legend
                    </Link>
                </div>
            </section>
        );
    }

    const isPublic = Boolean(profile.publicProfile);
    const joinedAtFormatted =
        isPublic && profile.joinedAt
            ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(
                new Date(profile.joinedAt)
            )
            : null;
    const roleLabel =
        profile.role === "ADMIN" ? "Administrator" : "Użytkownik / Twórca";

    return (
        <section className="mx-auto max-w-6xl space-y-8 py-6">
            <header className="flex flex-wrap items-center gap-6 rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                {/* Avatar jest widoczny wyłącznie dla profilu publicznego */}
                {isPublic && (
                    <div>
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.username}
                                className="h-24 w-24 rounded-full border border-zinc-700 object-cover"
                            />
                        ) : (
                            <div
                                aria-hidden="true"
                                className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-500/15 text-4xl font-bold text-indigo-300"
                            >
                                {(profile.username || "U")
                                    .slice(0, 1)
                                    .toUpperCase()}
                            </div>
                        )}
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
                            Profil autora
                        </span>

                        {isPublic && profile.role && (
                            <span
                                className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
                                    profile.role === "ADMIN"
                                        ? "bg-amber-500/15 text-amber-300"
                                        : "bg-indigo-500/15 text-indigo-300"
                                }`}
                            >
                                {roleLabel}
                            </span>
                        )}

                        {!isPublic && (
                            <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs font-medium text-zinc-400">
                                🔒 Profil prywatny
                            </span>
                        )}
                    </div>

                    <h1 className="mt-2 break-words text-3xl font-bold text-white">
                        {profile.username}
                    </h1>

                    {isPublic && joinedAtFormatted && (
                        <p className="mt-2 text-sm text-zinc-400">
                            Staż w społeczności: od{" "}
                            <span className="font-medium text-zinc-200">
                                {joinedAtFormatted}
                            </span>
                        </p>
                    )}
                </div>
            </header>

            {/* PODSUMOWANIE AKTYWNOŚCI (widoczne dla profilu publicznego i prywatnego) */}
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <h2 className="text-2xl font-bold text-white">
                    Aktywność użytkownika
                </h2>
                <p className="mt-1 text-sm text-zinc-400">
                    Podsumowanie wkładu użytkownika {profile.username} w rozwój
                    kolekcji.
                </p>

                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                    <ActivityMetric
                        label="Opublikowane legendy"
                        value={profile.publishedLegendsCount ?? 0}
                    />
                    <ActivityMetric
                        label="Dodane komentarze"
                        value={profile.commentsCount ?? 0}
                    />
                    <ActivityMetric
                        label="Oddane oceny"
                        value={profile.ratingsGivenCount ?? 0}
                    />
                </div>

                <div className="mt-8 border-t border-zinc-800 pt-8">
                    <h3 className="text-xl font-bold text-white">
                        Legendy autora
                    </h3>

                    {!profile.publishedLegends ||
                    profile.publishedLegends.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-6 text-sm text-zinc-400">
                            Ten użytkownik nie ma jeszcze opublikowanych legend.
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {profile.publishedLegends.map((legend) => (
                                <LegendCard key={legend.id} legend={legend} />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}

function ActivityMetric({ label, value }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 text-center">
            <p className="text-3xl font-bold text-indigo-400">{value}</p>
            <p className="mt-1 text-xs font-medium text-zinc-400">{label}</p>
        </div>
    );
}