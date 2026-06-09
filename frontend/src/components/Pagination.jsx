export default function Pagination({
                                       pageInfo,
                                       onPrevious,
                                       onNext,
                                   }) {
    if (!pageInfo || pageInfo.totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
            <button
                onClick={onPrevious}
                disabled={pageInfo.first}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-white transition hover:border-indigo-500 disabled:opacity-40"
            >
                ← Poprzednia
            </button>

            <div className="text-sm text-zinc-400">
                Strona{" "}
                <span className="font-bold text-white">
                    {pageInfo.page + 1}
                </span>{" "}
                z{" "}
                <span className="font-bold text-white">
                    {pageInfo.totalPages}
                </span>
            </div>

            <button
                onClick={onNext}
                disabled={pageInfo.last}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-white transition hover:border-indigo-500 disabled:opacity-40"
            >
                Następna →
            </button>
        </div>
    );
}