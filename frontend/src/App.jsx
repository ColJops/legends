import { useEffect, useState } from "react";
import api from "./services/api";

const initialForm = {
    title: "",
    content: "",
    region: "",
    city: "",
    category: "",
    imageUrl: "",
};

export default function App() {
    const [legends, setLegends] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [selectedLegend, setSelectedLegend] = useState(null);
    const [uploading, setUploading] = useState(false);

    const fetchLegends = () => {
        api.get("/legends")
            .then((response) => setLegends(response.data))
            .catch(() => setError("Nie udało się pobrać legend."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLegends();
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setSelectedLegend(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => {
            window.removeEventListener("keydown", handleEscape);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                ...form,
                imageUrl: form.imageUrl.trim() === "" ? null : form.imageUrl,
            };

            const response = await api.post("/legends", payload);

            setLegends((prev) => [response.data, ...prev]);
            setForm(initialForm);
        } catch {
            setError("Nie udało się dodać legendy. Sprawdź wymagane pola.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setError("");

        try {
            const response = await api.post("/uploads/legend-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            setForm((prev) => ({
                ...prev,
                imageUrl: response.data.imageUrl,
            }));
        } catch (error) {
            const message = error?.response?.data?.message || "Nie udało się wysłać obrazka.";
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                Loading legends...
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <section className="mx-auto max-w-7xl px-6 py-10">
                <div className="mb-10">
                    <p className="text-sm uppercase tracking-[0.3em] text-indigo-400">
                        Aplikacja Legendy
                    </p>

                    <h1 className="mt-3 text-5xl font-bold tracking-tight md:text-7xl">
                        Polish Legends
                    </h1>

                    <p className="mt-4 max-w-2xl text-zinc-400">
                        Kolekcja polskich legend, podań i opowieści regionalnych.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg"
                >
                    <h2 className="mb-6 text-2xl font-bold">
                        Dodaj legendę
                    </h2>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                        <input
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            placeholder="Tytuł"
                            required
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />

                        <input
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            placeholder="Kategoria"
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />

                        <input
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="Miasto"
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />

                        <input
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                            placeholder="Region"
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />

                        <div className="md:col-span-2">
                            <label className="mb-2 block text-sm text-zinc-400">
                                Obrazek legendy
                            </label>

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
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
                            onChange={handleChange}
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

                {legends.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-zinc-400">
                        Brak legend w bazie.
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {legends.map((legend) => (
                            <article
                                key={legend.id}
                                className="group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg transition hover:-translate-y-1 hover:border-indigo-500/60 hover:shadow-indigo-950/40"
                            >
                                <div className="h-40 bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-900 flex items-center justify-center">
                                    {legend.imageUrl ? (
                                        <img
                                            src={legend.imageUrl}
                                            alt={legend.title}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-6xl">🐉</span>
                                    )}
                                </div>

                                <div className="p-6">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <span className="rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-medium text-indigo-300">
                                            {legend.category || "Brak kategorii"}
                                        </span>

                                        <span className="text-xs text-zinc-500">
                                            #{legend.id}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white">
                                        {legend.title}
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        {legend.city || "Nieznane miasto"} •{" "}
                                        {legend.region || "Nieznany region"}
                                    </p>

                                    <p className="mt-4 line-clamp-4 text-zinc-300">
                                        {legend.content}
                                    </p>

                                    <button
                                        onClick={() => setSelectedLegend(legend)}
                                        className="mt-6 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                                    >
                                        Czytaj więcej
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {selectedLegend && (
                <div
                    onClick={() => setSelectedLegend(null)}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 shadow-2xl"
                    >
                        <div className="h-72 bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-900 flex items-center justify-center">
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
                                    {selectedLegend.category || "Brak kategorii"}
                                </span>

                                <button
                                    onClick={() => setSelectedLegend(null)}
                                    className="text-2xl text-zinc-400 transition hover:text-white"
                                >
                                    ×
                                </button>
                            </div>

                            <h2 className="text-4xl font-bold text-white">
                                {selectedLegend.title}
                            </h2>

                            <p className="mt-3 text-zinc-400">
                                {selectedLegend.city || "Nieznane miasto"} •{" "}
                                {selectedLegend.region || "Nieznany region"}
                            </p>

                            <div className="mt-8 whitespace-pre-line text-lg leading-8 text-zinc-300">
                                {selectedLegend.content}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
