import {
    useCallback,
    useEffect,
    useState,
} from "react";
import { Link } from "react-router-dom";

import {
    deleteAdminLegend,
    getAdminLegends,
} from "../../api/adminLegendsApi.js";

import {
    categories,
    regions,
    getCategoryLabel,
    getRegionLabel,
} from "../../data/legendOptions.js";

import { getApiErrorMessage } from "../../utils/apiError.js";

const initialFilters = {
    search: "",
    city: "",
    region: "",
    category: "",
};

const initialPageData = {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
};

export default function AdminLegendsPage() {
    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState(initialFilters);

    const [pageData, setPageData] = useState(initialPageData);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [sortBy, setSortBy] = useState("createdAt");
    const [direction, setDirection] = useState("desc");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const loadLegends = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAdminLegends({
                search: appliedFilters.search || undefined,
                city: appliedFilters.city || undefined,
                region: appliedFilters.region || undefined,
                category: appliedFilters.category || undefined,
                page,
                size,
                sortBy,
                direction,
            });

            setPageData(data);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Nie udało się pobrać listy legend."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [
        appliedFilters,
        page,
        size,
        sortBy,
        direction,
    ]);

    useEffect(() => {
        void loadLegends();
    }, [loadLegends]);

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));
    }

    function handleSearch(event) {
        event.preventDefault();

        setPage(0);
        setAppliedFilters({
            search: filters.search.trim(),
            city: filters.city.trim(),
            region: filters.region,
            category: filters.category,
        });
    }

    function handleResetFilters() {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    }

    function handleSizeChange(event) {
        setSize(Number(event.target.value));
        setPage(0);
    }

    function handleSortChange(event) {
        setSortBy(event.target.value);
        setPage(0);
    }

    function handleDirectionChange(event) {
        setDirection(event.target.value);
        setPage(0);
    }

    async function handleDelete() {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);

        try {
            await deleteAdminLegend(deleteTarget.id);

            setDeleteTarget(null);

            if (
                pageData.content.length === 1 &&
                page > 0
            ) {
                setPage((currentPage) =>
                    Math.max(currentPage - 1, 0)
                );
            } else {
                await loadLegends();
            }
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Nie udało się usunąć legendy."
                )
            );

            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <p className="text-sm font-medium text-amber-500">
                    Zarządzanie treścią
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white">
                    Legendy
                </h1>

                <p className="mt-3 max-w-3xl text-zinc-400">
                    Wyszukiwanie, filtrowanie, przeglądanie
                    i usuwanie legend znajdujących się w aplikacji.
                </p>
            </header>

            <FiltersPanel
                filters={filters}
                sortBy={sortBy}
                direction={direction}
                size={size}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onReset={handleResetFilters}
                onSortChange={handleSortChange}
                onDirectionChange={handleDirectionChange}
                onSizeChange={handleSizeChange}
            />

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => void loadLegends()}
                />
            )}

            <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-white">
                            Lista legend
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Znaleziono:{" "}
                            <span className="font-semibold text-zinc-300">
                                {pageData.totalElements}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadLegends()}
                        disabled={loading}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-medium
                            text-zinc-300 transition-colors
                            hover:border-amber-500
                            hover:text-amber-400
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Odśwież
                    </button>
                </div>

                {loading ? (
                    <TableLoading />
                ) : pageData.content.length === 0 ? (
                    <EmptyState />
                ) : (
                    <LegendsTable
                        legends={pageData.content}
                        onDelete={setDeleteTarget}
                    />
                )}

                <Pagination
                    page={page}
                    totalPages={pageData.totalPages}
                    first={pageData.first}
                    last={pageData.last}
                    onPageChange={setPage}
                />
            </section>

            {deleteTarget && (
                <DeleteLegendDialog
                    legend={deleteTarget}
                    deleting={deleting}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={() => void handleDelete()}
                />
            )}
        </div>
    );
}

function FiltersPanel({
                          filters,
                          sortBy,
                          direction,
                          size,
                          onFilterChange,
                          onSearch,
                          onReset,
                          onSortChange,
                          onDirectionChange,
                          onSizeChange,
                      }) {
    return (
        <form
            onSubmit={onSearch}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterField label="Wyszukiwanie">
                    <input
                        type="search"
                        name="search"
                        value={filters.search}
                        onChange={onFilterChange}
                        placeholder="Tytuł, autor lub e-mail"
                        className={inputClassName}
                    />
                </FilterField>

                <FilterField label="Miasto">
                    <input
                        type="text"
                        name="city"
                        value={filters.city}
                        onChange={onFilterChange}
                        placeholder="Np. Kraków"
                        className={inputClassName}
                    />
                </FilterField>

                <FilterField label="Region">
                    <select
                        name="region"
                        value={filters.region}
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">
                            Wszystkie regiony
                        </option>

                        {regions.map((region) => {
                            const value = getOptionValue(region);

                            return (
                                <option
                                    key={value}
                                    value={value}
                                >
                                    {getOptionLabel(
                                        region,
                                        getRegionLabel
                                    )}
                                </option>
                            );
                        })}
                    </select>
                </FilterField>

                <FilterField label="Kategoria">
                    <select
                        name="category"
                        value={filters.category}
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">
                            Wszystkie kategorie
                        </option>

                        {categories.map((category) => {
                            const value =
                                getOptionValue(category);

                            return (
                                <option
                                    key={value}
                                    value={value}
                                >
                                    {getOptionLabel(
                                        category,
                                        getCategoryLabel
                                    )}
                                </option>
                            );
                        })}
                    </select>
                </FilterField>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-zinc-800 pt-5">
                <FilterField label="Sortowanie">
                    <select
                        value={sortBy}
                        onChange={onSortChange}
                        className={smallInputClassName}
                    >
                        <option value="createdAt">
                            Data utworzenia
                        </option>
                        <option value="updatedAt">
                            Data aktualizacji
                        </option>
                        <option value="title">
                            Tytuł
                        </option>
                        <option value="city">
                            Miasto
                        </option>
                        <option value="region">
                            Region
                        </option>
                        <option value="category">
                            Kategoria
                        </option>
                        <option value="id">
                            Identyfikator
                        </option>
                    </select>
                </FilterField>

                <FilterField label="Kierunek">
                    <select
                        value={direction}
                        onChange={onDirectionChange}
                        className={smallInputClassName}
                    >
                        <option value="desc">
                            Malejąco
                        </option>
                        <option value="asc">
                            Rosnąco
                        </option>
                    </select>
                </FilterField>

                <FilterField label="Na stronie">
                    <select
                        value={size}
                        onChange={onSizeChange}
                        className={smallInputClassName}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </FilterField>

                <div className="ml-auto flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500
                            hover:text-white
                        "
                    >
                        Wyczyść
                    </button>

                    <button
                        type="submit"
                        className="
                            rounded-lg bg-amber-500 px-5 py-2
                            text-sm font-semibold text-zinc-950
                            transition-colors hover:bg-amber-400
                        "
                    >
                        Zastosuj filtry
                    </button>
                </div>
            </div>
        </form>
    );
}

function FilterField({ label, children }) {
    return (
        <label className="block text-sm font-medium text-zinc-400">
            <span className="mb-2 block">
                {label}
            </span>

            {children}
        </label>
    );
}

function LegendsTable({ legends, onDelete }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-950/50">
                <tr>
                    <TableHeader>ID</TableHeader>
                    <TableHeader>Legenda</TableHeader>
                    <TableHeader>Lokalizacja</TableHeader>
                    <TableHeader>Kategoria</TableHeader>
                    <TableHeader>Autor</TableHeader>
                    <TableHeader>Utworzono</TableHeader>
                    <TableHeader align="right">
                        Akcje
                    </TableHeader>
                </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                {legends.map((legend) => (
                    <tr
                        key={legend.id}
                        className="transition-colors hover:bg-zinc-800/40"
                    >
                        <TableCell>
                                <span className="text-zinc-500">
                                    #{legend.id}
                                </span>
                        </TableCell>

                        <TableCell>
                            <div className="max-w-xs">
                                <p className="truncate font-semibold text-white">
                                    {legend.title}
                                </p>

                                {legend.updatedAt && (
                                    <p className="mt-1 text-xs text-zinc-600">
                                        Aktualizacja:{" "}
                                        {formatDate(
                                            legend.updatedAt
                                        )}
                                    </p>
                                )}
                            </div>
                        </TableCell>

                        <TableCell>
                            <p className="text-zinc-300">
                                {getRegionLabel(
                                    legend.region
                                )}
                            </p>

                            <p className="mt-1 text-xs text-zinc-500">
                                {legend.city || "Brak miasta"}
                            </p>
                        </TableCell>

                        <TableCell>
                                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
                                    {getCategoryLabel(
                                        legend.category
                                    )}
                                </span>
                        </TableCell>

                        <TableCell>
                                <span className="text-zinc-300">
                                    {legend.authorUsername ||
                                        "Brak autora"}
                                </span>
                        </TableCell>

                        <TableCell>
                                <span className="whitespace-nowrap text-sm text-zinc-500">
                                    {formatDate(legend.createdAt)}
                                </span>
                        </TableCell>

                        <TableCell align="right">
                            <div className="flex justify-end gap-2">
                                <Link
                                    to={`/admin/legends/${legend.id}/edit`}
                                    className="
                                        rounded-lg border border-amber-500/30
                                        px-3 py-2 text-xs font-semibold
                                        text-amber-300 transition-colors
                                        hover:border-amber-500
                                        hover:bg-amber-500/10
    "
                                >
                                    Edytuj
                                </Link>
                                <Link
                                    to={`/legends?legendId=${legend.id}`}
                                    className="
                                            rounded-lg border
                                            border-zinc-700
                                            px-3 py-2 text-xs
                                            font-semibold text-zinc-300
                                            transition-colors
                                            hover:border-indigo-500
                                            hover:text-indigo-300
                                        "
                                >
                                    Podgląd
                                </Link>

                                <button
                                    type="button"
                                    onClick={() =>
                                        onDelete(legend)
                                    }
                                    className="
                                            rounded-lg border
                                            border-red-500/30
                                            px-3 py-2 text-xs
                                            font-semibold text-red-300
                                            transition-colors
                                            hover:border-red-500
                                            hover:bg-red-500/10
                                        "
                                >
                                    Usuń
                                </button>
                            </div>
                        </TableCell>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

function TableHeader({
                         children,
                         align = "left",
                     }) {
    return (
        <th
            className={`
                whitespace-nowrap px-5 py-3
                text-xs font-semibold uppercase
                tracking-wider text-zinc-500
                ${
                align === "right"
                    ? "text-right"
                    : "text-left"
            }
            `}
        >
            {children}
        </th>
    );
}

function TableCell({
                       children,
                       align = "left",
                   }) {
    return (
        <td
            className={`
                whitespace-nowrap px-5 py-4 text-sm
                ${
                align === "right"
                    ? "text-right"
                    : "text-left"
            }
            `}
        >
            {children}
        </td>
    );
}

function Pagination({
                        page,
                        totalPages,
                        first,
                        last,
                        onPageChange,
                    }) {
    if (totalPages === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 px-5 py-4">
            <p className="text-sm text-zinc-500">
                Strona{" "}
                <span className="font-semibold text-zinc-300">
                    {page + 1}
                </span>{" "}
                z{" "}
                <span className="font-semibold text-zinc-300">
                    {totalPages}
                </span>
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={first}
                    onClick={() =>
                        onPageChange((currentPage) =>
                            Math.max(currentPage - 1, 0)
                        )
                    }
                    className={paginationButtonClassName}
                >
                    Poprzednia
                </button>

                <button
                    type="button"
                    disabled={last}
                    onClick={() =>
                        onPageChange((currentPage) =>
                            Math.min(
                                currentPage + 1,
                                totalPages - 1
                            )
                        )
                    }
                    className={paginationButtonClassName}
                >
                    Następna
                </button>
            </div>
        </div>
    );
}

function DeleteLegendDialog({
                                legend,
                                deleting,
                                onCancel,
                                onConfirm,
                            }) {
    return (
        <div
            className="
                fixed inset-0 z-50 flex items-center
                justify-center bg-black/75 p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-legend-title"
        >
            <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
                <p className="text-sm font-semibold text-red-400">
                    Operacja nieodwracalna
                </p>

                <h2
                    id="delete-legend-title"
                    className="mt-2 text-xl font-bold text-white"
                >
                    Usunąć legendę?
                </h2>

                <p className="mt-4 leading-7 text-zinc-400">
                    Legenda{" "}
                    <span className="font-semibold text-white">
                        „{legend.title}”
                    </span>{" "}
                    zostanie trwale usunięta wraz z przypisanym
                    obrazem.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={deleting}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500
                            disabled:opacity-50
                        "
                    >
                        Anuluj
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={deleting}
                        className="
                            rounded-lg bg-red-600 px-4 py-2
                            text-sm font-semibold text-white
                            transition-colors hover:bg-red-500
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {deleting
                            ? "Usuwanie..."
                            : "Usuń legendę"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ErrorMessage({
                          message,
                          onRetry,
                      }) {
    return (
        <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-5">
            <p className="font-semibold text-red-300">
                Wystąpił błąd
            </p>

            <p className="mt-2 text-sm text-red-200/70">
                {message}
            </p>

            <button
                type="button"
                onClick={onRetry}
                className="
                    mt-4 rounded-lg bg-red-500
                    px-4 py-2 text-sm font-semibold
                    text-white hover:bg-red-400
                "
            >
                Spróbuj ponownie
            </button>
        </div>
    );
}

function TableLoading() {
    return (
        <div className="space-y-px">
            {[1, 2, 3, 4, 5].map((item) => (
                <div
                    key={item}
                    className="
                        h-20 animate-pulse
                        border-b border-zinc-800
                        bg-zinc-900
                    "
                />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="px-6 py-16 text-center">
            <p className="font-semibold text-zinc-300">
                Nie znaleziono legend
            </p>

            <p className="mt-2 text-sm text-zinc-500">
                Zmień kryteria wyszukiwania lub wyczyść filtry.
            </p>
        </div>
    );
}

function formatDate(value) {
    if (!value) {
        return "Brak daty";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Nieprawidłowa data";
    }

    return new Intl.DateTimeFormat("pl-PL", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}

function getOptionValue(option) {
    return typeof option === "string"
        ? option
        : option.value;
}

function getOptionLabel(
    option,
    labelFunction
) {
    if (typeof option === "string") {
        return labelFunction(option);
    }

    return option.label ??
        labelFunction(option.value);
}

const inputClassName = `
    w-full rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2.5 text-sm text-white
    outline-none transition-colors
    placeholder:text-zinc-600
    focus:border-amber-500
`;

const smallInputClassName = `
    min-w-36 rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2 text-sm text-white
    outline-none transition-colors
    focus:border-amber-500
`;

const paginationButtonClassName = `
    rounded-lg border border-zinc-700
    px-4 py-2 text-sm font-semibold
    text-zinc-300 transition-colors
    hover:border-amber-500 hover:text-amber-400
    disabled:cursor-not-allowed
    disabled:border-zinc-800
    disabled:text-zinc-700
`;