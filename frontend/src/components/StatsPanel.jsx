export default function StatsPanel({ stats }) {
    if (!stats) return null;

    return (
        <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
            <h2 className="mb-4 text-2xl font-bold">
                Statystyki legend
            </h2>

            <div className="mb-6">
                <p className="text-3xl font-bold text-indigo-400">
                    {stats.totalLegends}
                </p>
                <p className="text-zinc-400">
                    Wszystkich legend
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <h3 className="mb-3 font-semibold">
                        Kategorie
                    </h3>

                    <ul className="space-y-2">
                        {Object.entries(stats.byCategory).map(
                            ([category, count]) => (
                                <li
                                    key={category}
                                    className="flex justify-between"
                                >
                                    <span>{category}</span>
                                    <span>{count}</span>
                                </li>
                            )
                        )}
                    </ul>
                </div>

                <div>
                    <h3 className="mb-3 font-semibold">
                        Regiony
                    </h3>

                    <ul className="space-y-2">
                        {Object.entries(stats.byRegion).map(
                            ([region, count]) => (
                                <li
                                    key={region}
                                    className="flex justify-between"
                                >
                                    <span>{region}</span>
                                    <span>{count}</span>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            </div>
        </section>
    );
}