import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { categories, getCategoryLabel, getRegionLabel, regions } from "../data/legendOptions";
import PolandMap from "../components/map/PolandMap";

export default function MapPage() {
    const [category, setCategory] = useState("");
    const [regionSearch, setRegionSearch] = useState("");
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;
        setLoading(true);
        api.get(category ? "/legends/stats/regions" : "/legends/stats")
            .then(({ data }) => {
                if (!active) return;
                setCounts(category ? data : data.byRegion || {});
                setError("");
            })
            .catch(() => {
                if (active) setError("Nie udało się pobrać statystyk mapy.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [category]);

    const total = useMemo(
        () => Object.values(counts).reduce((sum, count) => sum + Number(count || 0), 0),
        [counts]
    );
    const regionsWithLegends = Object.values(counts).filter((count) => count > 0).length;
    const filteredRegions = regions.filter((region) =>
        region.label.toLocaleLowerCase("pl").includes(regionSearch.toLocaleLowerCase("pl"))
    );

    return (
        <div className="space-y-8 pb-10">
            <header className="relative overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950 via-zinc-900 to-zinc-950 px-6 py-8 sm:px-10 sm:py-10">
                <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
                <p className="relative mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-violet-300">Legendy z całej Polski</p>
                <h1 className="relative max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">Odkrywaj opowieści według regionu</h1>
                <p className="relative mt-4 max-w-2xl text-zinc-300">Wybierz województwo na mapie lub z listy i poznaj historie związane z jego miejscowościami.</p>
            </header>

            <section aria-label="Statystyki mapy" className="grid gap-3 sm:grid-cols-3">
                <StatCard label="Opublikowane legendy" value={loading ? "…" : total} />
                <StatCard label="Województwa z legendami" value={loading ? "…" : `${regionsWithLegends} / 16`} />
                <StatCard label="Wybrana kategoria" value={category ? getCategoryLabel(category) : "Wszystkie"} />
            </section>

            <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
                <div>
                    <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">Mapa województw</h2>
                            <p className="mt-1 text-sm text-zinc-400">Kliknij województwo, aby przejść do jego legend.</p>
                        </div>
                        <label className="flex flex-col gap-1 text-xs text-zinc-400">
                            Filtruj mapę według kategorii
                            <select
                                value={category}
                                onChange={(event) => setCategory(event.target.value)}
                                className="min-w-56 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2.5 text-sm text-white outline-none focus:border-violet-400"
                            >
                                <option value="">Wszystkie kategorie</option>
                                {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                            </select>
                        </label>
                    </div>
                    {error && <p role="alert" className="mb-3 rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-200">{error}</p>}
                    <PolandMap counts={counts} category={category} />
                </div>

                <aside className="rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-xl font-bold">Województwa</h2>
                            <p className="mt-1 text-sm text-zinc-400">Wybierz region z listy</p>
                        </div>
                        <span className="rounded-full border border-zinc-700 bg-zinc-950 px-3 py-1 text-xs text-zinc-400">16 regionów</span>
                    </div>
                    <label className="mt-5 block">
                        <span className="sr-only">Szukaj województwa</span>
                        <input
                            value={regionSearch}
                            onChange={(event) => setRegionSearch(event.target.value)}
                            placeholder="Szukaj województwa…"
                            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-violet-400"
                        />
                    </label>
                    <ul className="mt-3 divide-y divide-zinc-800">
                        {filteredRegions.map((region) => {
                            const count = counts[region.value] || 0;
                            return (
                                <li key={region.value}>
                                    <Link to={`/region/${region.value}${category ? `?category=${category}` : ""}`} className="group flex items-center justify-between gap-4 py-3 transition hover:text-violet-200">
                                        <span className="flex min-w-0 items-center gap-3">
                                            <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${count ? "bg-violet-400" : "bg-zinc-700"}`} />
                                            <span className="truncate text-sm font-medium">{getRegionLabel(region.value)}</span>
                                        </span>
                                        <span className="flex shrink-0 items-center gap-2 text-sm tabular-nums text-zinc-400 group-hover:text-violet-200">
                                            {loading ? "…" : count}
                                            <span aria-hidden="true">→</span>
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                        {filteredRegions.length === 0 && <li className="py-6 text-center text-sm text-zinc-500">Nie znaleziono województwa.</li>}
                    </ul>
                </aside>
            </section>

            <p className="text-center text-xs text-zinc-500">
                Granice województw: <a className="underline decoration-zinc-600 underline-offset-2 hover:text-zinc-300" href="https://github.com/ppatrzyk/polska-geojson" target="_blank" rel="noreferrer">polska-geojson by Piotr Patrzyk</a> (MIT), źródła danych wskazane w repozytorium.
            </p>
        </div>
    );
}

function StatCard({ label, value }) {
    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <p className="text-sm text-zinc-400">{label}</p>
            <p className="mt-2 text-2xl font-bold text-violet-300">{value}</p>
        </div>
    );
}
