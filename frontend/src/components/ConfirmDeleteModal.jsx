export default function ConfirmDeleteModal({
                                               legend,
                                               deleting,
                                               onCancel,
                                               onConfirm,
                                           }) {
    if (!legend) {
        return null;
    }

    return (
        <div
            onClick={onCancel}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl"
            >
                <h2 className="text-2xl font-bold text-white">
                    Usuń legendę
                </h2>

                <p className="mt-4 text-zinc-300">
                    Czy na pewno chcesz usunąć legendę:
                </p>

                <p className="mt-2 rounded-xl bg-zinc-950 p-4 font-semibold text-white">
                    {legend.title}
                </p>

                <p className="mt-4 text-sm text-red-300">
                    Tej operacji nie można cofnąć.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={deleting}
                        className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50"
                    >
                        Anuluj
                    </button>

                    <button
                        type="button"
                        onClick={() => onConfirm(legend.id)}
                        disabled={deleting}
                        className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-50"
                    >
                        {deleting ? "Usuwanie..." : "Usuń"}
                    </button>
                </div>
            </div>
        </div>
    );
}