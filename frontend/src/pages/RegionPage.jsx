import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { categories, getCategoryLabel, getRegionLabel, regions } from "../data/legendOptions";
import LegendCard from "../components/LegendCard";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 6;

export default function RegionPage() {
    const { region: regionKey = "" } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const region = regions.find((item) => item.value === regionKey);
    const category = searchParams.get("category") || "";
    const page = Number(searchParams.get("page") || 0);
    const [stats, setStats] = useState(null);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState(searchParams.get("search") || "");

    useEffect(() => {
        if (!region) return;
        let active = true;
        setLoading(true);
        setError("");
        Promise.all([
            api.get(`/legends/stats/regions/${regionKey}`),
            api.get("/legends", {
                params: {
                    region: regionKey,
                    category: category || undefined,
                    search: searchParams.get("search") || undefined,
                    page: Math.max(0, page),
                    size: PAGE_SIZE,
                    sortBy: "createdAt",
                    direction: "desc",
                },
            }),
        ])
            .then(([statsResponse, legendsResponse]) => {
                if (!active) return;
                setStats(statsResponse.data);
                setData(legendsResponse.data);
            })
            .catch(() => {
                if (active) setError("Nie udało się pobrać danych województwa.");
            })
            .finally(() => {
                if (active) setLoading(false);
            });
        return () => {
            active = false;
        };
    }, [region, regionKey, category, page, searchParams]);

    if (!region) {
        return (
            <section className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-center">
                <h1 className="text-2xl font-bold">Nie znaleziono województwa</h1>
                <p className="mt-2 text-zinc-400">Wybierz region z mapy Polski.</p>
                <Link to="/mapa" className="mt-5 inline-flex rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500">Przejdź do mapy</Link>
            </section>
        );
    }

    const updateFilter = (next) => {
        const params = new URLSearchParams(searchParams);
        for (const [key, value] of Object.entries(next)) {
            if (value) params.set(key, value);
            else params.delete(key);
        }
        params.delete("page");
        setSearchParams(params);
    };

    const updatePage = (nextPage) => {
        const params = new URLSearchParams(searchParams);
        if (nextPage > 0) params.set("page", String(nextPage));
        else params.delete("page");
        setSearchParams(params);
    };

    return (
        <div className="space-y-8 pb-10">
            <Link to={`/mapa${category ? `?category=${category}` : ""}`} className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-violet-300"><span aria-hidden="true">←</span> Wróć do mapy</Link>
            <header className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950/80 via-zinc-900 to-zinc-950 p-6 sm:p-9">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-300">Region legend</p>
                <h1 className="mt-2 text-3xl font-black sm:text-5xl">Województwo {getRegionLabel(regionKey)}</h1>
                <p className="mt-3 max-w-2xl text-zinc-300">Poznaj opowieści, podania i legendy związane z miejscowościami tego regionu.</p>
            </header>

            {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-4 text-sm text-rose-200">{error}</p>}

            <section aria-label="Statystyki województwa" className="grid gap-3 sm:grid-cols-3">
                <Metric label="Opublikowane legendy" value={loading ? "…" : stats?.totalLegends ?? 0} />
                <Metric label="Miejscowości" value={loading ? "…" : stats?.citiesCount ?? 0} />
                <Metric label="Kategorie z legendami" value={loading ? "…" : Object.keys(stats?.byCategory || {}).length} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-5">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <div>
                            <h2 className="text-2xl font-bold">Legendy z regionu</h2>
                            <p className="mt-1 text-sm text-zinc-400">{loading ? "Wczytywanie…" : `${data?.totalElements || 0} wyników`}</p>
                        </div>
                        {category && <button type="button" onClick={() => updateFilter({ category: "" })} className="text-sm text-violet-300 hover:text-violet-200">Wyczyść filtr: {getCategoryLabel(category)} ×</button>}
                    </div>
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            updateFilter({ search: search.trim() });
                        }}
                        className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:flex-row"
                    >
                        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Szukaj tytułu, treści lub miasta…" className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-violet-400" />
                        <button className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold hover:bg-violet-500">Szukaj</button>
                        <button type="button" onClick={() => { setSearch(""); updateFilter({ search: "" }); }} className="rounded-xl border border-zinc-700 px-4 py-3 text-sm text-zinc-300 hover:border-zinc-500">Wyczyść</button>
                    </form>
                    {loading ? (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center text-zinc-400">Wczytywanie legend…</div>
                    ) : data?.content?.length ? (
                        <div className="grid gap-5 md:grid-cols-2">
                            {data.content.map((legend) => <LegendCard key={legend.id} legend={legend} />)}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-center">
                            <p className="text-lg font-semibold">Nie ma tu jeszcze legend spełniających te kryteria.</p>
                            <p className="mt-2 text-sm text-zinc-400">Zmień filtr lub wróć do mapy i wybierz inny region.</p>
                        </div>
                    )}
                    <Pagination pageInfo={data} onPrevious={() => updatePage(Math.max(0, page - 1))} onNext={() => updatePage(page + 1)} />
                </div>

                <aside className="h-fit rounded-3xl border border-zinc-800 bg-zinc-900/70 p-5">
                    <h2 className="text-lg font-bold">Kategorie legend</h2>
                    <p className="mt-1 text-sm text-zinc-400">Wybierz kategorię, aby zawęzić listę.</p>
                    <ul className="mt-4 divide-y divide-zinc-800">
                        {categories.map((item) => {
                            const count = stats?.byCategory?.[item.value] || 0;
                            return (
                                <li key={item.value}>
                                    <button type="button" onClick={() => updateFilter({ category: category === item.value ? "" : item.value })} aria-pressed={category === item.value} className={`flex w-full items-center justify-between gap-3 py-3 text-left text-sm transition ${category === item.value ? "text-violet-200" : "text-zinc-300 hover:text-violet-300"}`}>
                                        <span>{item.label}</span>
                                        <span className="tabular-nums text-zinc-500">{loading ? "…" : count}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            </section>
        </div>
    );
}

function Metric({ label, value }) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5"><p className="text-sm text-zinc-400">{label}</p><p className="mt-2 text-2xl font-bold text-violet-300">{value}</p></div>;
}
