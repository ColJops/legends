import { useNavigate } from "react-router-dom";
import { getCategoryLabel, getRegionLabel } from "../data/legendOptions";

export default function LegendCard({ legend, onReadMore }) {
    const navigate = useNavigate();

    const handleReadMore = () => {
        if (typeof onReadMore === "function") {
            onReadMore(legend);
            return;
        }

        navigate(`/legends?legendId=${legend.id}`);
    };

    return (
        <article className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg transition hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-indigo-950/40">
            <div className="flex h-40 items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-900">
                {legend.imageUrl ? (
                    <img
                        src={legend.imageUrl}
                        alt={legend.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <span className="text-6xl">🐉</span>
                )}
            </div>

            <div className="p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300">
                        {getCategoryLabel(legend.category)}
                    </span>

                    <span className="text-xs text-zinc-500">
                        #{legend.id}
                    </span>
                </div>

                <h2 className="text-2xl font-bold text-white">
                    {legend.title}
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    {legend.city || "Nieznane miasto"} • {getRegionLabel(legend.region)}
                </p>

                {legend.authorUsername && (
                    <p className="mt-1 text-xs text-zinc-500">
                        Autor: {legend.authorUsername}
                    </p>
                )}

                <p className="mt-4 line-clamp-4 text-zinc-300">
                    {legend.content}
                </p>

                <button
                    type="button"
                    onClick={handleReadMore}
                    className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                    Czytaj więcej
                </button>
            </div>
        </article>
    );
}