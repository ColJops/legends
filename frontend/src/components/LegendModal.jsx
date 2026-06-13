import { citiesByRegion } from "../data/legendOptions";
export default function LegendModal({
                                        selectedLegend,
                                        editingLegend,
                                        editForm,
                                        categories,
                                        regions,
                                        deleting,
                                        updating,
                                        error,
                                        onClose,
                                        onStartEdit,
                                        onDelete,
                                        onEditChange,
                                        onUpdate,
                                        getCategoryLabel,
                                        getRegionLabel,
                                        setEditingLegend,
                                    }) {
    if (!selectedLegend) {
        return null;
    }

    return (
        <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl"
            >
                <div className="flex h-72 items-center justify-center bg-linear-to-br from-indigo-900 via-zinc-900 to-amber-900">
                    {selectedLegend.imageUrl ? (
                        <img
                            src={selectedLegend.imageUrl}
                            alt={selectedLegend.title}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-8xl">🐉</span>
                    )}
                </div>

                <div className="p-8">
                    <div className="mb-4 flex items-center justify-between gap-4">
                        <span className="rounded-full bg-indigo-500/15 px-4 py-1 text-sm font-medium text-indigo-300">
                            {getCategoryLabel(selectedLegend.category)}
                        </span>

                        <div className="flex items-center gap-3">
                            {!editingLegend && (
                                <>
                                    <button
                                        onClick={() => onStartEdit(selectedLegend)}
                                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-indigo-500 hover:text-white"
                                    >
                                        Edytuj
                                    </button>

                                    <button
                                        onClick={() => onDelete(selectedLegend)}
                                        disabled={deleting}
                                        className="rounded-xl border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                                    >
                                        {deleting ? "Usuwanie..." : "Usuń"}
                                    </button>
                                </>
                            )}

                            <button
                                onClick={onClose}
                                className="text-2xl text-zinc-400 transition hover:text-white"
                            >
                                ×
                            </button>
                        </div>

                        {error && (
                            <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        )}

                    </div>

                    {editingLegend ? (
                        <form onSubmit={onUpdate} className="mt-6 space-y-4">
                            <input
                                name="title"
                                value={editForm.title}
                                onChange={onEditChange}
                                required
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            />

                            <select
                                name="category"
                                value={editForm.category}
                                onChange={onEditChange}
                                required
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="city"
                                value={editForm.city}
                                onChange={onEditChange}
                                disabled={!editForm.region}
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500 disabled:opacity-50"
                            >
                                <option value="">
                                    {editForm.region
                                        ? "Wybierz miasto"
                                        : "Najpierw wybierz region"}
                                </option>

                                {(citiesByRegion[editForm.region] || []).map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="region"
                                value={editForm.region}
                                onChange={onEditChange}
                                required
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            >
                                {regions.map((region) => (
                                    <option key={region.value} value={region.value}>
                                        {region.label}
                                    </option>
                                ))}
                            </select>

                            <input
                                name="imageUrl"
                                value={editForm.imageUrl}
                                onChange={onEditChange}
                                placeholder="URL obrazka"
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            />

                            <textarea
                                name="content"
                                value={editForm.content}
                                onChange={onEditChange}
                                required
                                rows="7"
                                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            />

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {updating ? "Zapisywanie..." : "Zapisz zmiany"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setEditingLegend(null)}
                                    className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                                >
                                    Anuluj
                                </button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <h2 className="text-4xl font-bold text-white">
                                {selectedLegend.title}
                            </h2>

                            <p className="mt-3 text-zinc-400">
                                {selectedLegend.city || "Nieznane miasto"} •{" "}
                                {getRegionLabel(selectedLegend.region)}
                            </p>

                            <div className="mt-8 whitespace-pre-line text-lg leading-8 text-zinc-300">
                                {selectedLegend.content}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}