import { useEffect, useState } from "react";
import api from "./services/api";

const categories = [
    { value: "LEGENDA", label: "Legenda" },
    { value: "MIT", label: "Mit" },
    { value: "PODANIE", label: "Podanie" },
    { value: "BASN", label: "Baśń" },
    { value: "DUCHY", label: "Duchy" },
    { value: "POTWORY", label: "Potwory" },
    { value: "LEGENDA_MIEJSKA", label: "Legenda miejska" },
    { value: "LEGENDA_MORSKA", label: "Legenda morska" },
    { value: "LEGENDA_HISTORYCZNA", label: "Legenda historyczna" },
];

const regions = [
    { value: "DOLNOSLASKIE", label: "Dolnośląskie" },
    { value: "KUJAWSKO_POMORSKIE", label: "Kujawsko-pomorskie" },
    { value: "LUBELSKIE", label: "Lubelskie" },
    { value: "LUBUSKIE", label: "Lubuskie" },
    { value: "LODZKIE", label: "Łódzkie" },
    { value: "MALOPOLSKIE", label: "Małopolskie" },
    { value: "MAZOWIECKIE", label: "Mazowieckie" },
    { value: "OPOLSKIE", label: "Opolskie" },
    { value: "PODKARPACKIE", label: "Podkarpackie" },
    { value: "PODLASKIE", label: "Podlaskie" },
    { value: "POMORSKIE", label: "Pomorskie" },
    { value: "SLASKIE", label: "Śląskie" },
    { value: "SWIETOKRZYSKIE", label: "Świętokrzyskie" },
    { value: "WARMINSKO_MAZURSKIE", label: "Warmińsko-mazurskie" },
    { value: "WIELKOPOLSKIE", label: "Wielkopolskie" },
    { value: "ZACHODNIOPOMORSKIE", label: "Zachodniopomorskie" },
];

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
    const [search, setSearch] = useState("");
    const [pageInfo, setPageInfo] = useState(null);

    const getCategoryLabel = (value) =>
        categories.find((category) => category.value === value)?.label || "Brak kategorii";

    const getRegionLabel = (value) =>
        regions.find((region) => region.value === value)?.label || "Nieznany region";

    const fetchLegends = (searchValue = search) => {
        setLoading(true);

        api.get("/legends", {
            params: {
                search: searchValue,
                page: 0,
                size: 6,
            },
        })
            .then((response) => {
                setLegends(response.data.content || []);
                setPageInfo(response.data);
            })
            .catch(() => setError("Nie udało się pobrać legend."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchLegends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setSelectedLegend(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchLegends(search);
    };

    const handleClearSearch = () => {
        setSearch("");
        fetchLegends("");
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
            const message =
                error?.response?.data?.message || "Nie udało się wysłać obrazka.";
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-white">
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
                    onSubmit={handleSearchSubmit}
                    className="mb-8 flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:flex-row"
                >
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Szukaj po tytule, treści, mieście, regionie lub kategorii..."
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
                        onClick={handleClearSearch}
                        className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                    >
                        Wyczyść
                    </button>
                </form>

                {pageInfo && (
                    <p className="mb-6 text-sm text-zinc-500">
                        Wyniki: {pageInfo.totalElements}
                    </p>
                )}

                <form
                    onSubmit={handleSubmit}
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
                            onChange={handleChange}
                            placeholder="Tytuł"
                            required
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />

                        <select
                            name="category"
                            value={form.category}
                            onChange={handleChange}
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
                            onChange={handleChange}
                            placeholder="Miasto"
                            className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />

                        <select
                            name="region"
                            value={form.region}
                            onChange={handleChange}
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
                                <div className="flex h-40 items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-900">
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
                                            {getCategoryLabel(legend.category)}
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
                                        {getRegionLabel(legend.region)}
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
                        <div className="flex h-72 items-center justify-center bg-gradient-to-br from-indigo-900 via-zinc-900 to-amber-900">
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
                                {getRegionLabel(selectedLegend.region)}
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