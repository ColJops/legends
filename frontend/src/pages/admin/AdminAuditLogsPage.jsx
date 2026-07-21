import {
    useCallback,
    useEffect,
    useState,
} from "react";

import { getAdminAuditLogs } from "../../api/adminAuditLogsApi";
import { getApiErrorMessage } from "../../utils/apiError";

const initialFilters = {
    search: "",
    action: "",
    targetType: "",
};

const initialPageData = {
    content: [],
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
};

const actionOptions = [
    {
        value: "LEGEND_UPDATED",
        label: "Edycja legendy",
    },
    {
        value: "LEGEND_DELETED",
        label: "Usunięcie legendy",
    },
    {
        value: "USER_ROLE_CHANGED",
        label: "Zmiana roli użytkownika",
    },
    {
        value: "USER_LOCKED",
        label: "Zablokowanie użytkownika",
    },
    {
        value: "USER_UNLOCKED",
        label: "Odblokowanie użytkownika",
    },
    {
        value: "USER_DELETED",
        label: "Usunięcie użytkownika",
    },
    {
        value: "MEDIA_FILE_DELETED",
        label: "Usunięcie pliku",
    },
    {
        value: "MEDIA_ORPHANS_CLEANED",
        label: "Czyszczenie osieroconych plików",
    },
];

const targetTypeOptions = [
    {
        value: "LEGEND",
        label: "Legenda",
    },
    {
        value: "USER",
        label: "Użytkownik",
    },
    {
        value: "MEDIA",
        label: "Plik",
    },
    {
        value: "SYSTEM",
        label: "System",
    },
];

export default function AdminAuditLogsPage() {
    const [filters, setFilters] =
        useState(initialFilters);

    const [appliedFilters, setAppliedFilters] =
        useState(initialFilters);

    const [pageData, setPageData] =
        useState(initialPageData);

    const [page, setPage] = useState(0);
    const [size, setSize] = useState(20);
    const [direction, setDirection] =
        useState("desc");

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const loadLogs = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAdminAuditLogs({
                search:
                    appliedFilters.search ||
                    undefined,
                action:
                    appliedFilters.action ||
                    undefined,
                targetType:
                    appliedFilters.targetType ||
                    undefined,
                page,
                size,
                direction,
            });

            setPageData(data);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Nie udało się pobrać dziennika działań."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [
        appliedFilters,
        page,
        size,
        direction,
    ]);

    useEffect(() => {
        void loadLogs();
    }, [loadLogs]);

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));
    }

    function handleSubmit(event) {
        event.preventDefault();

        setAppliedFilters({
            search: filters.search.trim(),
            action: filters.action,
            targetType: filters.targetType,
        });

        setPage(0);
    }

    function handleReset() {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    }

    function handleSizeChange(event) {
        setSize(Number(event.target.value));
        setPage(0);
    }

    function handleDirectionChange(event) {
        setDirection(event.target.value);
        setPage(0);
    }

    return (
        <div className="space-y-6">
            <header>
                <p className="text-sm font-medium text-amber-500">
                    Historia administracyjna
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white">
                    Dziennik działań
                </h1>

                <p className="mt-3 max-w-3xl text-zinc-400">
                    Historia operacji wykonywanych przez
                    administratorów aplikacji.
                </p>
            </header>

            <AuditFilters
                filters={filters}
                size={size}
                direction={direction}
                onFilterChange={handleFilterChange}
                onSubmit={handleSubmit}
                onReset={handleReset}
                onSizeChange={handleSizeChange}
                onDirectionChange={
                    handleDirectionChange
                }
            />

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() =>
                        void loadLogs()
                    }
                />
            )}

            <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-white">
                            Zarejestrowane operacje
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Liczba wpisów:{" "}
                            <span className="font-semibold text-zinc-300">
                                {
                                    pageData.totalElements
                                }
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() =>
                            void loadLogs()
                        }
                        disabled={loading}
                        className="
                            rounded-lg border
                            border-zinc-700 px-4 py-2
                            text-sm font-semibold
                            text-zinc-300
                            transition-colors
                            hover:border-amber-500
                            hover:text-amber-400
                            disabled:cursor-not-allowed
                            disabled:opacity-40
                        "
                    >
                        Odśwież
                    </button>
                </div>

                {loading ? (
                    <AuditLoading />
                ) : pageData.content.length === 0 ? (
                    <EmptyState />
                ) : (
                    <AuditTimeline
                        logs={pageData.content}
                    />
                )}

                <Pagination
                    page={page}
                    totalPages={
                        pageData.totalPages
                    }
                    first={pageData.first}
                    last={pageData.last}
                    onPageChange={setPage}
                />
            </section>
        </div>
    );
}

function AuditFilters({
                          filters,
                          size,
                          direction,
                          onFilterChange,
                          onSubmit,
                          onReset,
                          onSizeChange,
                          onDirectionChange,
                      }) {
    return (
        <form
            onSubmit={onSubmit}
            className="
                rounded-xl border border-zinc-800
                bg-zinc-900 p-5
            "
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FilterField label="Wyszukiwanie">
                    <input
                        type="search"
                        name="search"
                        value={filters.search}
                        onChange={onFilterChange}
                        placeholder="Administrator, obiekt lub szczegóły"
                        className={inputClassName}
                    />
                </FilterField>

                <FilterField label="Rodzaj operacji">
                    <select
                        name="action"
                        value={filters.action}
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">
                            Wszystkie operacje
                        </option>

                        {actionOptions.map(
                            (option) => (
                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {option.label}
                                </option>
                            )
                        )}
                    </select>
                </FilterField>

                <FilterField label="Typ obiektu">
                    <select
                        name="targetType"
                        value={
                            filters.targetType
                        }
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">
                            Wszystkie obiekty
                        </option>

                        {targetTypeOptions.map(
                            (option) => (
                                <option
                                    key={
                                        option.value
                                    }
                                    value={
                                        option.value
                                    }
                                >
                                    {option.label}
                                </option>
                            )
                        )}
                    </select>
                </FilterField>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-zinc-800 pt-5">
                <FilterField label="Kolejność">
                    <select
                        value={direction}
                        onChange={
                            onDirectionChange
                        }
                        className={
                            smallInputClassName
                        }
                    >
                        <option value="desc">
                            Najnowsze najpierw
                        </option>

                        <option value="asc">
                            Najstarsze najpierw
                        </option>
                    </select>
                </FilterField>

                <FilterField label="Na stronie">
                    <select
                        value={size}
                        onChange={onSizeChange}
                        className={
                            smallInputClassName
                        }
                    >
                        <option value={10}>
                            10
                        </option>

                        <option value={20}>
                            20
                        </option>

                        <option value={50}>
                            50
                        </option>

                        <option value={100}>
                            100
                        </option>
                    </select>
                </FilterField>

                <div className="ml-auto flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="
                            rounded-lg border
                            border-zinc-700 px-4 py-2
                            text-sm font-semibold
                            text-zinc-300
                            transition-colors
                            hover:border-zinc-500
                            hover:text-white
                        "
                    >
                        Wyczyść
                    </button>

                    <button
                        type="submit"
                        className="
                            rounded-lg bg-amber-500
                            px-5 py-2 text-sm
                            font-semibold text-zinc-950
                            transition-colors
                            hover:bg-amber-400
                        "
                    >
                        Zastosuj filtry
                    </button>
                </div>
            </div>
        </form>
    );
}

function AuditTimeline({ logs }) {
    return (
        <ol className="divide-y divide-zinc-800">
            {logs.map((log) => (
                <AuditLogItem
                    key={log.id}
                    log={log}
                />
            ))}
        </ol>
    );
}

function AuditLogItem({ log }) {
    const action =
        getActionPresentation(log.action);

    return (
        <li className="px-5 py-5 transition-colors hover:bg-zinc-800/30">
            <div className="flex gap-4">
                <div
                    className={`
                        mt-1 flex h-10 w-10
                        shrink-0 items-center
                        justify-center rounded-full
                        text-sm font-bold
                        ${action.iconClassName}
                    `}
                    aria-hidden="true"
                >
                    {action.symbol}
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold text-white">
                                    {
                                        action.label
                                    }
                                </h3>

                                <TargetBadge
                                    targetType={
                                        log.targetType
                                    }
                                />
                            </div>

                            <p className="mt-1 text-sm text-zinc-500">
                                Administrator:{" "}
                                <span className="font-semibold text-zinc-300">
                                    {
                                        log.adminUsername
                                    }
                                </span>
                            </p>
                        </div>

                        <time
                            dateTime={
                                log.createdAt
                            }
                            className="whitespace-nowrap text-sm text-zinc-600"
                        >
                            {formatDate(
                                log.createdAt
                            )}
                        </time>
                    </div>

                    {(log.targetLabel ||
                        log.targetId) && (
                        <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                                Obiekt operacji
                            </p>

                            <p className="mt-1 break-words text-sm text-zinc-300">
                                {log.targetLabel ||
                                    "Brak nazwy"}

                                {log.targetId && (
                                    <span className="ml-2 text-zinc-600">
                                        #
                                        {
                                            log.targetId
                                        }
                                    </span>
                                )}
                            </p>
                        </div>
                    )}

                    {log.details && (
                        <p className="mt-4 break-words text-sm leading-6 text-zinc-400">
                            {log.details}
                        </p>
                    )}

                    <p className="mt-3 text-xs text-zinc-700">
                        Wpis #{log.id}
                    </p>
                </div>
            </div>
        </li>
    );
}

function TargetBadge({ targetType }) {
    const labels = {
        LEGEND: "Legenda",
        USER: "Użytkownik",
        MEDIA: "Plik",
        SYSTEM: "System",
    };

    const classes = {
        LEGEND:
            "bg-indigo-500/10 text-indigo-300",
        USER:
            "bg-emerald-500/10 text-emerald-300",
        MEDIA:
            "bg-sky-500/10 text-sky-300",
        SYSTEM:
            "bg-zinc-700/60 text-zinc-300",
    };

    return (
        <span
            className={`
                rounded-full px-2.5 py-1
                text-xs font-semibold
                ${
                classes[targetType] ??
                classes.SYSTEM
            }
            `}
        >
            {labels[targetType] ??
                targetType}
        </span>
    );
}

function getActionPresentation(action) {
    const presentations = {
        LEGEND_UPDATED: {
            label: "Edytowano legendę",
            symbol: "E",
            iconClassName:
                "bg-amber-500/10 text-amber-300",
        },
        LEGEND_DELETED: {
            label: "Usunięto legendę",
            symbol: "L",
            iconClassName:
                "bg-red-500/10 text-red-300",
        },
        USER_ROLE_CHANGED: {
            label: "Zmieniono rolę użytkownika",
            symbol: "R",
            iconClassName:
                "bg-violet-500/10 text-violet-300",
        },
        USER_LOCKED: {
            label: "Zablokowano użytkownika",
            symbol: "B",
            iconClassName:
                "bg-red-500/10 text-red-300",
        },
        USER_UNLOCKED: {
            label: "Odblokowano użytkownika",
            symbol: "O",
            iconClassName:
                "bg-emerald-500/10 text-emerald-300",
        },
        USER_DELETED: {
            label: "Usunięto użytkownika",
            symbol: "U",
            iconClassName:
                "bg-red-500/10 text-red-300",
        },
        MEDIA_FILE_DELETED: {
            label: "Usunięto plik",
            symbol: "P",
            iconClassName:
                "bg-red-500/10 text-red-300",
        },
        MEDIA_ORPHANS_CLEANED: {
            label: "Wyczyszczono osierocone pliki",
            symbol: "C",
            iconClassName:
                "bg-sky-500/10 text-sky-300",
        },
    };

    return (
        presentations[action] ?? {
            label: action,
            symbol: "?",
            iconClassName:
                "bg-zinc-700 text-zinc-300",
        }
    );
}

function FilterField({
                         label,
                         children,
                     }) {
    return (
        <label className="block text-sm font-medium text-zinc-400">
            <span className="mb-2 block">
                {label}
            </span>

            {children}
        </label>
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
                        onPageChange(
                            (currentPage) =>
                                Math.max(
                                    currentPage -
                                    1,
                                    0
                                )
                        )
                    }
                    className={
                        paginationButtonClassName
                    }
                >
                    Poprzednia
                </button>

                <button
                    type="button"
                    disabled={last}
                    onClick={() =>
                        onPageChange(
                            (currentPage) =>
                                Math.min(
                                    currentPage +
                                    1,
                                    totalPages -
                                    1
                                )
                        )
                    }
                    className={
                        paginationButtonClassName
                    }
                >
                    Następna
                </button>
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
                    px-4 py-2 text-sm
                    font-semibold text-white
                    hover:bg-red-400
                "
            >
                Spróbuj ponownie
            </button>
        </div>
    );
}

function AuditLoading() {
    return (
        <div className="divide-y divide-zinc-800">
            {[1, 2, 3, 4, 5].map((item) => (
                <div
                    key={item}
                    className="flex gap-4 px-5 py-5"
                >
                    <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-800" />

                    <div className="flex-1 space-y-3">
                        <div className="h-5 w-64 max-w-full animate-pulse rounded bg-zinc-800" />

                        <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />

                        <div className="h-16 animate-pulse rounded bg-zinc-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="px-6 py-16 text-center">
            <p className="font-semibold text-zinc-300">
                Brak wpisów w dzienniku
            </p>

            <p className="mt-2 text-sm text-zinc-500">
                Zmień kryteria wyszukiwania albo
                wykonaj operację administracyjną.
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

    return new Intl.DateTimeFormat(
        "pl-PL",
        {
            dateStyle: "medium",
            timeStyle: "medium",
        }
    ).format(date);
}

const inputClassName = `
    w-full rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2.5 text-sm text-white
    outline-none transition-colors
    placeholder:text-zinc-600
    focus:border-amber-500
`;

const smallInputClassName = `
    min-w-44 rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2 text-sm text-white
    outline-none transition-colors
    focus:border-amber-500
`;

const paginationButtonClassName = `
    rounded-lg border border-zinc-700
    px-4 py-2 text-sm font-semibold
    text-zinc-300 transition-colors
    hover:border-amber-500
    hover:text-amber-400
    disabled:cursor-not-allowed
    disabled:border-zinc-800
    disabled:text-zinc-700
`;