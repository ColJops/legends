export default function Pagination({ pageInfo, onPrevious, onNext }) {
    if (!pageInfo || pageInfo.totalPages <= 1) {
        return null;
    }

    return (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:flex-row">
            <button
                type="button"
                onClick={onPrevious}
                disabled={pageInfo.first}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
                Poprzednia
            </button>

            <p className="text-sm text-zinc-400">
                Strona{" "}
                <span className="font-semibold text-white">
                    {pageInfo.page + 1}
                </span>{" "}
                z{" "}
                <span className="font-semibold text-white">
                    {pageInfo.totalPages}
                </span>
            </p>

            <button
                type="button"
                onClick={onNext}
                disabled={pageInfo.last}
                className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-indigo-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
                Następna
            </button>
        </div>
    );
}