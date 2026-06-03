export default function SearchBar({
                                      search,
                                      onSearchChange,
                                      onSubmit,
                                      onClear,
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