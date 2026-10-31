import { Link, useNavigate } from "react-router-dom";
import { getCategoryLabel, getRegionLabel } from "../data/legendOptions";
import { useAuth } from "../context/AuthContext";

export default function LegendCard({
                                       legend,
                                       onReadMore,
                                       onToggleFavorite,
                                   }) {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleReadMore = () => {
        if (typeof onReadMore === "function") {
            onReadMore(legend);
            return;
        }

        navigate(`/legends?legendId=${legend.id}`);
    };

    const ratingsCount = legend.ratingsCount ?? 0;
    const averageRating = Number(legend.averageRating ?? 0).toFixed(1);

    return (
        <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg transition hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-indigo-950/40">
            <div className="relative flex h-40 items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-900">
                {legend.imageUrl ? (
                    <img
                        src={legend.imageUrl}
                        alt={legend.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-6xl">🐉</span>
                )}

                {isAuthenticated && typeof onToggleFavorite === "function" && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleFavorite(legend);
                        }}
                        title={
                            legend.favorite
                                ? "Usuń z ulubionych"
                                : "Dodaj do ulubionych"
                        }
                        aria-label={
                            legend.favorite
                                ? "Usuń z ulubionych"
                                : "Dodaj do ulubionych"
                        }
                        className={`absolute top-3 right-3 flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold backdrop-blur-md transition ${
                            legend.favorite
                                ? "border-rose-500/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
                                : "border-zinc-700/80 bg-zinc-950/70 text-zinc-300 hover:border-rose-500/40 hover:text-rose-300"
                        }`}
                    >
                        <span>{legend.favorite ? "❤️" : "🤍"}</span>
                        <span className="hidden sm:inline">
                            {legend.favorite ? "Ulubiona" : "Ulubione"}
                        </span>
                    </button>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300">
                        {getCategoryLabel(legend.category)}
                    </span>

                    <div className="flex items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 font-semibold text-amber-300">
                            ★ {ratingsCount > 0 ? averageRating : "—"}{" "}
                            <span className="font-normal text-zinc-400">
                                ({formatVotesLabel(ratingsCount)})
                            </span>
                        </span>

                        <span className="text-zinc-500">#{legend.id}</span>
                    </div>
                </div>

                {legend.status && legend.status !== "PUBLISHED" && (
                    <div className="mb-3">
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                            {{
                                DRAFT: "Szkic",
                                PENDING: "Oczekuje na moderację",
                                REJECTED: "Odrzucona",
                                ARCHIVED: "Zarchiwizowana",
                            }[legend.status] || legend.status}
                        </span>
                        {legend.rejectionReason && (
                            <p className="mt-2 text-sm text-red-300">
                                Powód odrzucenia: {legend.rejectionReason}
                            </p>
                        )}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-white">
                    {legend.title}
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    {legend.city || "Nieznane miasto"} •{" "}
                    {getRegionLabel(legend.region)}
                </p>

                {legend.authorUsername && (
                    <p className="mt-1 text-xs text-zinc-500">
                        Autor:{" "}
                        <Link
                            to={`/users/${legend.authorUsername}`}
                            onClick={(e) => e.stopPropagation()}
                            className="font-medium text-indigo-300 transition hover:text-indigo-200 hover:underline"
                        >
                            {legend.authorUsername}
                        </Link>
                    </p>
                )}

                <p className="mt-4 line-clamp-4 flex-1 text-zinc-300">
                    {legend.content}
                </p>

                <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleReadMore}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                        Czytaj więcej
                    </button>
                </div>
            </div>
        </article>
    );
}

function formatVotesLabel(count) {
    if (count === 1) return "1 głos";
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} głosy`;
    }
    return `${count} głosów`;
}