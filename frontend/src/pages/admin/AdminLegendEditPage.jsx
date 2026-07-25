import {
    useEffect,
    useMemo,
    useState,
} from "react";
import {
    Link,
    useNavigate,
    useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import {
    getAdminLegend,
    updateAdminLegend,
    uploadAdminLegendImage,
} from "../../api/adminLegendsApi";

import {
    categories,
    citiesByRegion,
    regions,
} from "../../data/legendOptions";

import { getApiErrorMessage } from "../../utils/apiError";

const initialForm = {
    title: "",
    content: "",
    region: "",
    city: "",
    category: "",
    imageUrl: "",
};

export default function AdminLegendEditPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [legend, setLegend] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        async function loadLegend() {
            setLoading(true);
            setError("");

            try {
                const data = await getAdminLegend(id);

                if (ignore) {
                    return;
                }

                setLegend(data);

                setForm({
                    title: data.title || "",
                    content: data.content || "",
                    region: data.region || "",
                    city: data.city || "",
                    category: data.category || "",
                    imageUrl: data.imageUrl || "",
                });
            } catch (requestError) {
                if (!ignore) {
                    setError(
                        getApiErrorMessage(
                            requestError,
                            "Nie udało się pobrać legendy."
                        )
                    );
                }
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        }

        void loadLegend();

        return () => {
            ignore = true;
        };
    }, [id]);

    const availableCities = useMemo(() => {
        const regionCities =
            citiesByRegion[form.region] || [];

        if (
            form.city &&
            !regionCities.includes(form.city)
        ) {
            return [form.city, ...regionCities];
        }

        return regionCities;
    }, [form.region, form.city]);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((currentForm) => {
            if (name === "region") {
                return {
                    ...currentForm,
                    region: value,
                    city: "",
                };
            }

            return {
                ...currentForm,
                [name]: value,
            };
        });
    }

    async function handleImageUpload(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setUploading(true);
        setError("");

        try {
            const imageUrl =
                await uploadAdminLegendImage(file);

            setForm((currentForm) => ({
                ...currentForm,
                imageUrl: imageUrl || "",
            }));

            toast.success("Nowy obraz został przesłany.");
        } catch (requestError) {
            const message = getApiErrorMessage(
                requestError,
                "Nie udało się przesłać obrazu."
            );

            setError(message);
            toast.error(message);
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    }

    function handleRemoveImage() {
        setForm((currentForm) => ({
            ...currentForm,
            imageUrl: "",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setSaving(true);
        setError("");

        try {
            const payload = {
                title: form.title.trim(),
                content: form.content.trim(),
                region: form.region,
                city: form.city,
                category: form.category,
                imageUrl:
                    form.imageUrl.trim() === ""
                        ? null
                        : form.imageUrl.trim(),
            };

            await updateAdminLegend(id, payload);

            toast.success("Legenda została zaktualizowana.");

            navigate("/admin/legends", {
                replace: true,
            });
        } catch (requestError) {
            const message = getApiErrorMessage(
                requestError,
                "Nie udało się zaktualizować legendy."
            );

            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <EditPageLoading />;
    }

    if (!legend) {
        return (
            <ErrorPanel
                message={
                    error ||
                    "Nie znaleziono wybranej legendy."
                }
            />
        );
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-amber-500">
                        Zarządzanie treścią
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Edycja legendy
                    </h1>

                    <p className="mt-3 text-zinc-400">
                        Edytujesz legendę{" "}
                        <span className="font-semibold text-zinc-200">
                            #{legend.id}
                        </span>
                        , której autorem jest{" "}
                        <span className="font-semibold text-zinc-200">
                            {legend.authorUsername ||
                                "nieznany użytkownik"}
                        </span>
                        .
                    </p>
                </div>

                <Link
                    to="/admin/legends"
                    className="
                        rounded-lg border border-zinc-700
                        px-4 py-2 text-sm font-semibold
                        text-zinc-300 transition-colors
                        hover:border-amber-500
                        hover:text-amber-400
                    "
                >
                    Powrót do listy
                </Link>
            </header>

            {error && (
                <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5">
                    <p className="font-semibold text-red-300">
                        Nie udało się wykonać operacji
                    </p>

                    <p className="mt-2 text-sm text-red-200/70">
                        {error}
                    </p>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className="
                    rounded-xl border border-zinc-800
                    bg-zinc-900 p-6
                "
            >
                <div className="grid gap-5 lg:grid-cols-2">
                    <FormField
                        label="Tytuł"
                        htmlFor="admin-legend-title"
                    >
                        <input
                            id="admin-legend-title"
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            maxLength={150}
                            required
                            className={inputClassName}
                        />

                        <CharacterCounter
                            current={form.title.length}
                            maximum={150}
                        />
                    </FormField>

                    <FormField
                        label="Kategoria"
                        htmlFor="admin-legend-category"
                    >
                        <select
                            id="admin-legend-category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            className={inputClassName}
                        >
                            <option value="">
                                Wybierz kategorię
                            </option>

                            {categories.map((category) => (
                                <option
                                    key={category.value}
                                    value={category.value}
                                >
                                    {category.label}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Region"
                        htmlFor="admin-legend-region"
                    >
                        <select
                            id="admin-legend-region"
                            name="region"
                            value={form.region}
                            onChange={handleChange}
                            required
                            className={inputClassName}
                        >
                            <option value="">
                                Wybierz region
                            </option>

                            {regions.map((region) => (
                                <option
                                    key={region.value}
                                    value={region.value}
                                >
                                    {region.label}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <FormField
                        label="Miasto"
                        htmlFor="admin-legend-city"
                    >
                        <select
                            id="admin-legend-city"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            disabled={!form.region}
                            required
                            className={inputClassName}
                        >
                            <option value="">
                                {form.region
                                    ? "Wybierz miasto"
                                    : "Najpierw wybierz region"}
                            </option>

                            {availableCities.map((city) => (
                                <option
                                    key={city}
                                    value={city}
                                >
                                    {city}
                                </option>
                            ))}
                        </select>
                    </FormField>

                    <div className="lg:col-span-2">
                        <FormField
                            label="Obraz legendy"
                            htmlFor="admin-legend-image"
                        >
                            <input
                                id="admin-legend-image"
                                type="file"
                                accept="
                                    image/jpeg,
                                    image/png,
                                    image/webp,
                                    image/gif
                                "
                                onChange={handleImageUpload}
                                disabled={uploading || saving}
                                className="
                                    w-full rounded-lg border
                                    border-zinc-700 bg-zinc-950
                                    px-3 py-2.5 text-sm text-zinc-300
                                    file:mr-4 file:rounded-lg
                                    file:border-0 file:bg-indigo-600
                                    file:px-4 file:py-2
                                    file:font-semibold file:text-white
                                    hover:file:bg-indigo-500
                                    disabled:opacity-50
                                "
                            />

                            {uploading && (
                                <p className="mt-2 text-sm text-indigo-300">
                                    Przesyłanie obrazu...
                                </p>
                            )}
                        </FormField>

                        {form.imageUrl ? (
                            <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
                                <img
                                    src={form.imageUrl}
                                    alt={`Podgląd: ${form.title}`}
                                    className="h-72 w-full object-cover"
                                />

                                <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                                    <p className="min-w-0 truncate text-sm text-zinc-500">
                                        {form.imageUrl}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        disabled={saving}
                                        className="
                                            rounded-lg border
                                            border-red-500/30
                                            px-3 py-2 text-sm
                                            font-semibold text-red-300
                                            transition-colors
                                            hover:border-red-500
                                            hover:bg-red-500/10
                                            disabled:opacity-50
                                        "
                                    >
                                        Usuń obraz z legendy
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="mt-4 rounded-xl border border-dashed border-zinc-700 bg-zinc-950/50 p-8 text-center text-sm text-zinc-500">
                                Legenda nie ma przypisanego obrazu.
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        <FormField
                            label="Treść legendy"
                            htmlFor="admin-legend-content"
                        >
                            <textarea
                                id="admin-legend-content"
                                name="content"
                                value={form.content}
                                onChange={handleChange}
                                maxLength={10000}
                                rows={14}
                                required
                                className={`
                                    ${inputClassName}
                                    resize-y leading-7
                                `}
                            />

                            <CharacterCounter
                                current={form.content.length}
                                maximum={10000}
                            />
                        </FormField>
                    </div>
                </div>

                <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-zinc-800 pt-6">
                    <Link
                        to="/admin/legends"
                        className="
                            rounded-lg border border-zinc-700
                            px-5 py-2.5 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500 hover:text-white
                        "
                    >
                        Anuluj
                    </Link>

                    <button
                        type="submit"
                        disabled={saving || uploading}
                        className="
                            rounded-lg bg-amber-500 px-5 py-2.5
                            text-sm font-semibold text-zinc-950
                            transition-colors hover:bg-amber-400
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {saving
                            ? "Zapisywanie..."
                            : "Zapisz zmiany"}
                    </button>
                </div>
            </form>
        </div>
    );
}

function FormField({
                       label,
                       htmlFor,
                       children,
                   }) {
    return (
        <div>
            <label
                htmlFor={htmlFor}
                className="mb-2 block text-sm font-medium text-zinc-400"
            >
                {label}
            </label>

            {children}
        </div>
    );
}

function CharacterCounter({
                              current,
                              maximum,
                          }) {
    return (
        <p className="mt-2 text-right text-xs text-zinc-600">
            {current} / {maximum}
        </p>
    );
}

function ErrorPanel({ message }) {
    return (
        <section className="rounded-xl border border-red-500/30 bg-red-950/20 p-6">
            <p className="font-semibold text-red-300">
                Nie udało się otworzyć legendy
            </p>

            <p className="mt-2 text-sm text-red-200/70">
                {message}
            </p>

            <Link
                to="/admin/legends"
                className="
                    mt-5 inline-flex rounded-lg
                    border border-red-500/40 px-4 py-2
                    text-sm font-semibold text-red-200
                    transition-colors hover:bg-red-500/10
                "
            >
                Powrót do listy legend
            </Link>
        </section>
    );
}

function EditPageLoading() {
    return (
        <div className="space-y-6">
            <div className="h-9 w-72 animate-pulse rounded bg-zinc-800" />

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
                <div className="grid gap-5 lg:grid-cols-2">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-20 animate-pulse rounded bg-zinc-800"
                        />
                    ))}

                    <div className="h-72 animate-pulse rounded bg-zinc-800 lg:col-span-2" />

                    <div className="h-80 animate-pulse rounded bg-zinc-800 lg:col-span-2" />
                </div>
            </div>
        </div>
    );
}

const inputClassName = `
    w-full rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2.5 text-sm text-white
    outline-none transition-colors
    placeholder:text-zinc-600
    focus:border-amber-500
    disabled:cursor-not-allowed
    disabled:opacity-50
`;