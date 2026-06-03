import { categories, regions } from "../data/legendOptions";

export default function LegendForm({
                                       form,
                                       error,
                                       saving,
                                       uploading,
                                       onChange,
                                       onSubmit,
                                       onImageUpload,
                                   }) {
    return (
        <form
            onSubmit={onSubmit}
            className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg"
        >
            <h2 className="mb-6 text-2xl font-bold">Dodaj legendę</h2>

            {error && (
                <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Tytuł"
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />

                <select
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                >
                    <option value="">Wybierz kategorię</option>
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>

                <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="Miasto"
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />

                <select
                    name="region"
                    value={form.region}
                    onChange={onChange}
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                >
                    <option value="">Wybierz region</option>
                    {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                            {region.label}
                        </option>
                    ))}
                </select>

                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-zinc-400">
                        Obrazek legendy
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
                    />

                    {uploading && (
                        <p className="mt-2 text-sm text-indigo-300">
                            Wysyłanie obrazka...
                        </p>
                    )}

                    {form.imageUrl && (
                        <img
                            src={form.imageUrl}
                            alt="Podgląd"
                            className="mt-4 h-40 w-full rounded-xl object-cover"
                        />
                    )}
                </div>

                <textarea
                    name="content"
                    value={form.content}
                    onChange={onChange}
                    placeholder="Treść legendy"
                    required
                    rows="5"
                    className="resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 md:col-span-2"
                />
            </div>

            <button
                type="submit"
                disabled={saving}
                className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {saving ? "Zapisywanie..." : "Dodaj legendę"}
            </button>
        </form>
    );
}