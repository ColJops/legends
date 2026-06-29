import { Link } from "react-router-dom";
import LegendCard from "../LegendCard";

export default function LatestLegendsSection({ legends, onReadMore }) {
    const latestLegends = legends.slice(0, 3);

    if (latestLegends.length === 0) {
        return null;
    }

    return (
        <section className="mt-10">
            <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">
                    Ostatnio dodane legendy
                </h2>

                <Link
                    to="/legends"
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-violet-500 hover:text-white"
                >
                    Zobacz wszystkie
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {latestLegends.map((legend) => (
                    <LegendCard
                        key={legend.id}
                        legend={legend}
                        onReadMore={onReadMore}
                    />
                ))}
            </div>
        </section>
    );
}