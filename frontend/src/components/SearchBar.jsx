import { categories, regions } from "../data/legendOptions";

export default function SearchBar({
                                      search,
                                      selectedCategory,
                                      selectedRegion,
                                      onSearchChange,
                                      onCategoryChange,
                                      onRegionChange,
                                      onSubmit,
                                      onClear,
                                      sortBy,
                                      sortDirection,
                                      onSortChange,
                                  }) {
    return (
        <form
            onSubmit={onSubmit}
            className="mb-8 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:flex-row"
        >
            <input
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Szukaj po tytule, treści lub mieście..."
                className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />

            <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            >
                <option value="">Wszystkie kategorie</option>
                {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                        {category.label}
                    </option>
                ))}
            </select>

            <select
                value={selectedRegion}
                onChange={(e) => onRegionChange(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            >
                <option value="">Wszystkie regiony</option>
                {regions.map((region) => (
                    <option key={region.value} value={region.value}>
                        {region.label}
                    </option>
                ))}
            </select>

            <select
                value={`${sortBy}:${sortDirection}`}
                onChange={(e) => onSortChange(e.target.value)}
                className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            >
                <option value="createdAt:desc">Najnowsze</option>
                <option value="createdAt:asc">Najstarsze</option>
                <option value="title:asc">Tytuł A-Z</option>
                <option value="title:desc">Tytuł Z-A</option>
            </select>

            <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
                Szukaj
            </button>

            <button
                type="button"
                onClick={onClear}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
            >
                Wyczyść
            </button>
        </form>
    );
}