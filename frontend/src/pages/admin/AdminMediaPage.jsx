import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
    cleanupAdminMediaOrphans,
    deleteAdminMediaFile,
    getAdminMedia,
    resolveMediaUrl,
} from "../../api/adminMediaApi";

import { getApiErrorMessage } from "../../utils/apiError";

const initialMediaData = {
    totalFiles: 0,
    usedFiles: 0,
    orphanedFiles: 0,
    totalSizeBytes: 0,
    files: [],
};

export default function AdminMediaPage() {
    const [media, setMedia] = useState(initialMediaData);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("ALL");

    const [previewTarget, setPreviewTarget] =
        useState(null);

    const [deleteTarget, setDeleteTarget] =
        useState(null);

    const [deleting, setDeleting] =
        useState(false);

    const [cleanupDialogOpen, setCleanupDialogOpen] =
        useState(false);

    const [cleaning, setCleaning] =
        useState(false);

    const loadMedia = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAdminMedia();

            setMedia({
                ...initialMediaData,
                ...data,
                files: data.files || [],
            });
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Nie udało się pobrać listy plików."
                )
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadMedia();
    }, [loadMedia]);

    const filteredFiles = useMemo(() => {
        const normalizedSearch =
            search.trim().toLowerCase();

        return media.files.filter((file) => {
            const matchesSearch =
                normalizedSearch === "" ||
                file.filename
                    .toLowerCase()
                    .includes(normalizedSearch) ||
                file.usedBy?.some((legend) =>
                    legend.title
                        .toLowerCase()
                        .includes(normalizedSearch)
                );

            const matchesStatus =
                statusFilter === "ALL" ||
                (
                    statusFilter === "ORPHANED" &&
                    file.orphaned
                ) ||
                (
                    statusFilter === "USED" &&
                    !file.orphaned
                );

            return matchesSearch && matchesStatus;
        });
    }, [
        media.files,
        search,
        statusFilter,
    ]);

    async function handleDeleteFile() {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            await deleteAdminMediaFile(
                deleteTarget.filename
            );

            toast.success(
                "Osierocony plik został usunięty."
            );

            setDeleteTarget(null);
            await loadMedia();
        } catch (requestError) {
            const message = getApiErrorMessage(
                requestError,
                "Nie udało się usunąć pliku."
            );

            setError(message);
            toast.error(message);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    async function handleCleanupOrphans() {
        setCleaning(true);
        setError("");

        try {
            const result =
                await cleanupAdminMediaOrphans();

            const deletedFiles =
                result?.deletedFiles ?? 0;

            toast.success(
                deletedFiles === 1
                    ? "Usunięto 1 osierocony plik."
                    : `Usunięto ${deletedFiles} osieroconych plików.`
            );

            setCleanupDialogOpen(false);
            await loadMedia();
        } catch (requestError) {
            const message = getApiErrorMessage(
                requestError,
                "Nie udało się wyczyścić plików."
            );

            setError(message);
            toast.error(message);
            setCleanupDialogOpen(false);
        } finally {
            setCleaning(false);
        }
    }

    function handleResetFilters() {
        setSearch("");
        setStatusFilter("ALL");
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-amber-500">
                        Zarządzanie zasobami
                    </p>

                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Pliki i obrazy
                    </h1>

                    <p className="mt-3 max-w-3xl text-zinc-400">
                        Podgląd przesłanych grafik, kontrola ich
                        wykorzystania oraz bezpieczne usuwanie
                        osieroconych plików.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() =>
                        setCleanupDialogOpen(true)
                    }
                    disabled={
                        loading ||
                        media.orphanedFiles === 0
                    }
                    className="
                        rounded-lg bg-red-600 px-4 py-2.5
                        text-sm font-semibold text-white
                        transition-colors hover:bg-red-500
                        disabled:cursor-not-allowed
                        disabled:opacity-40
                    "
                >
                    Usuń wszystkie osierocone
                </button>
            </header>

            <MediaStats media={media} />

            <MediaFilters
                search={search}
                statusFilter={statusFilter}
                resultsCount={filteredFiles.length}
                onSearchChange={setSearch}
                onStatusChange={setStatusFilter}
                onReset={handleResetFilters}
                onRefresh={() => void loadMedia()}
                loading={loading}
            />

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => void loadMedia()}
                />
            )}

            {loading ? (
                <MediaLoading />
            ) : filteredFiles.length === 0 ? (
                <EmptyState
                    hasFiles={media.files.length > 0}
                    onReset={handleResetFilters}
                />
            ) : (
                <MediaGrid
                    files={filteredFiles}
                    onPreview={setPreviewTarget}
                    onDelete={setDeleteTarget}
                />
            )}

            {previewTarget && (
                <MediaPreviewDialog
                    file={previewTarget}
                    onClose={() =>
                        setPreviewTarget(null)
                    }
                />
            )}

            {deleteTarget && (
                <DeleteMediaDialog
                    file={deleteTarget}
                    deleting={deleting}
                    onCancel={() =>
                        setDeleteTarget(null)
                    }
                    onConfirm={() =>
                        void handleDeleteFile()
                    }
                />
            )}

            {cleanupDialogOpen && (
                <CleanupOrphansDialog
                    orphanedFiles={
                        media.orphanedFiles
                    }
                    cleaning={cleaning}
                    onCancel={() =>
                        setCleanupDialogOpen(false)
                    }
                    onConfirm={() =>
                        void handleCleanupOrphans()
                    }
                />
            )}
        </div>
    );
}

function MediaStats({ media }) {
    const cards = [
        {
            label: "Wszystkie pliki",
            value: media.totalFiles,
            description: "Liczba grafik na dysku",
        },
        {
            label: "Używane",
            value: media.usedFiles,
            description: "Pliki przypisane do legend",
        },
        {
            label: "Osierocone",
            value: media.orphanedFiles,
            description: "Pliki nieużywane przez legendy",
        },
        {
            label: "Łączny rozmiar",
            value: formatFileSize(
                media.totalSizeBytes
            ),
            description: "Miejsce zajmowane przez obrazy",
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
                <article
                    key={card.label}
                    className="
                        rounded-xl border border-zinc-800
                        bg-zinc-900 p-5
                    "
                >
                    <p className="text-sm font-medium text-zinc-400">
                        {card.label}
                    </p>

                    <p className="mt-4 text-3xl font-bold text-white">
                        {card.value}
                    </p>

                    <p className="mt-3 text-sm text-zinc-500">
                        {card.description}
                    </p>
                </article>
            ))}
        </section>
    );
}

function MediaFilters({
                          search,
                          statusFilter,
                          resultsCount,
                          onSearchChange,
                          onStatusChange,
                          onReset,
                          onRefresh,
                          loading,
                      }) {
    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="grid gap-4 md:grid-cols-[1fr_240px_auto]">
                <label className="block text-sm font-medium text-zinc-400">
                    <span className="mb-2 block">
                        Wyszukiwanie
                    </span>

                    <input
                        type="search"
                        value={search}
                        onChange={(event) =>
                            onSearchChange(
                                event.target.value
                            )
                        }
                        placeholder="Nazwa pliku lub legenda"
                        className={inputClassName}
                    />
                </label>

                <label className="block text-sm font-medium text-zinc-400">
                    <span className="mb-2 block">
                        Status pliku
                    </span>

                    <select
                        value={statusFilter}
                        onChange={(event) =>
                            onStatusChange(
                                event.target.value
                            )
                        }
                        className={inputClassName}
                    >
                        <option value="ALL">
                            Wszystkie pliki
                        </option>

                        <option value="USED">
                            Używane
                        </option>

                        <option value="ORPHANED">
                            Osierocone
                        </option>
                    </select>
                </label>

                <div className="flex items-end gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2.5 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500
                            hover:text-white
                        "
                    >
                        Wyczyść
                    </button>

                    <button
                        type="button"
                        onClick={onRefresh}
                        disabled={loading}
                        className="
                            rounded-lg border border-amber-500/40
                            px-4 py-2.5 text-sm font-semibold
                            text-amber-300 transition-colors
                            hover:border-amber-500
                            hover:bg-amber-500/10
                            disabled:opacity-40
                        "
                    >
                        Odśwież
                    </button>
                </div>
            </div>

            <p className="mt-4 text-sm text-zinc-500">
                Wyświetlono:{" "}
                <span className="font-semibold text-zinc-300">
                    {resultsCount}
                </span>
            </p>
        </section>
    );
}

function MediaGrid({
                       files,
                       onPreview,
                       onDelete,
                   }) {
    return (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {files.map((file) => (
                <MediaCard
                    key={file.filename}
                    file={file}
                    onPreview={onPreview}
                    onDelete={onDelete}
                />
            ))}
        </section>
    );
}

function MediaCard({
                       file,
                       onPreview,
                       onDelete,
                   }) {
    const imageUrl =
        resolveMediaUrl(file.url);

    return (
        <article className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
            <button
                type="button"
                onClick={() => onPreview(file)}
                className="
                    block h-52 w-full overflow-hidden
                    bg-zinc-950 text-left
                "
            >
                <img
                    src={imageUrl}
                    alt={file.filename}
                    loading="lazy"
                    className="
                        h-full w-full object-cover
                        transition-transform duration-300
                        hover:scale-105
                    "
                />
            </button>

            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <p
                            className="truncate font-semibold text-white"
                            title={file.filename}
                        >
                            {file.filename}
                        </p>

                        <p className="mt-1 text-xs text-zinc-500">
                            {file.contentType}
                        </p>
                    </div>

                    <MediaStatusBadge
                        orphaned={file.orphaned}
                    />
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <dt className="text-zinc-600">
                            Rozmiar
                        </dt>

                        <dd className="mt-1 text-zinc-300">
                            {formatFileSize(
                                file.sizeBytes
                            )}
                        </dd>
                    </div>

                    <div>
                        <dt className="text-zinc-600">
                            Modyfikacja
                        </dt>

                        <dd className="mt-1 text-zinc-300">
                            {formatDate(
                                file.lastModified
                            )}
                        </dd>
                    </div>
                </dl>

                <div className="mt-5 border-t border-zinc-800 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                        Wykorzystanie
                    </p>

                    {file.orphaned ? (
                        <p className="mt-2 text-sm text-red-300">
                            Plik nie jest używany przez żadną legendę.
                        </p>
                    ) : (
                        <ul className="mt-2 space-y-2">
                            {file.usedBy.map((legend) => (
                                <li key={legend.id}>
                                    <Link
                                        to={`/admin/legends/${legend.id}/edit`}
                                        className="
                                            text-sm text-indigo-300
                                            transition-colors
                                            hover:text-indigo-200
                                        "
                                    >
                                        #{legend.id} {legend.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => onPreview(file)}
                        className="
                            rounded-lg border border-zinc-700
                            px-3 py-2 text-xs font-semibold
                            text-zinc-300 transition-colors
                            hover:border-indigo-500
                            hover:text-indigo-300
                        "
                    >
                        Podgląd
                    </button>

                    <button
                        type="button"
                        disabled={!file.orphaned}
                        onClick={() => onDelete(file)}
                        className="
                            rounded-lg border border-red-500/30
                            px-3 py-2 text-xs font-semibold
                            text-red-300 transition-colors
                            hover:border-red-500
                            hover:bg-red-500/10
                            disabled:cursor-not-allowed
                            disabled:border-zinc-800
                            disabled:text-zinc-700
                        "
                    >
                        Usuń
                    </button>
                </div>
            </div>
        </article>
    );
}

function MediaStatusBadge({ orphaned }) {
    return (
        <span
            className={`
                shrink-0 rounded-full px-2.5 py-1
                text-xs font-semibold
                ${
                orphaned
                    ? "bg-red-500/10 text-red-300"
                    : "bg-emerald-500/10 text-emerald-300"
            }
            `}
        >
            {orphaned ? "Osierocony" : "Używany"}
        </span>
    );
}

function MediaPreviewDialog({
                                file,
                                onClose,
                            }) {
    return (
        <div
            className="
                fixed inset-0 z-50 flex items-center
                justify-center bg-black/85 p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-preview-title"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="w-full max-w-5xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
                <div className="flex items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
                    <div className="min-w-0">
                        <h2
                            id="media-preview-title"
                            className="truncate font-semibold text-white"
                        >
                            {file.filename}
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            {formatFileSize(
                                file.sizeBytes
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 hover:text-white
                        "
                    >
                        Zamknij
                    </button>
                </div>

                <div className="flex max-h-[75vh] items-center justify-center bg-black p-4">
                    <img
                        src={resolveMediaUrl(file.url)}
                        alt={file.filename}
                        className="
                            max-h-[70vh] max-w-full
                            object-contain
                        "
                    />
                </div>
            </div>
        </div>
    );
}

function DeleteMediaDialog({
                               file,
                               deleting,
                               onCancel,
                               onConfirm,
                           }) {
    return (
        <div
            className="
                fixed inset-0 z-50 flex items-center
                justify-center bg-black/80 p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-media-title"
        >
            <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-zinc-900 p-6 shadow-2xl">
                <p className="text-sm font-semibold text-red-400">
                    Operacja nieodwracalna
                </p>

                <h2
                    id="delete-media-title"
                    className="mt-2 text-xl font-bold text-white"
                >
                    Usunąć osierocony plik?
                </h2>

                <p className="mt-4 leading-7 text-zinc-400">
                    Plik{" "}
                    <span className="break-all font-semibold text-white">
                        {file.filename}
                    </span>{" "}
                    zostanie trwale usunięty z dysku.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={deleting}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 disabled:opacity-50
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
                            hover:bg-red-500
                            disabled:opacity-50
                        "
                    >
                        {deleting
                            ? "Usuwanie..."
                            : "Usuń plik"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CleanupOrphansDialog({
                                  orphanedFiles,
                                  cleaning,
                                  onCancel,
                                  onConfirm,
                              }) {
    return (
        <div
            className="
                fixed inset-0 z-50 flex items-center
                justify-center bg-black/80 p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="cleanup-media-title"
        >
            <div className="w-full max-w-md rounded-xl border border-red-500/30 bg-zinc-900 p-6 shadow-2xl">
                <p className="text-sm font-semibold text-red-400">
                    Czyszczenie zasobów
                </p>

                <h2
                    id="cleanup-media-title"
                    className="mt-2 text-xl font-bold text-white"
                >
                    Usunąć wszystkie osierocone pliki?
                </h2>

                <p className="mt-4 leading-7 text-zinc-400">
                    Z dysku zostanie usuniętych plików:{" "}
                    <span className="font-bold text-red-300">
                        {orphanedFiles}
                    </span>
                    .
                </p>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                    Pliki używane przez legendy pozostaną
                    nienaruszone.
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={cleaning}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 disabled:opacity-50
                        "
                    >
                        Anuluj
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={cleaning}
                        className="
                            rounded-lg bg-red-600 px-4 py-2
                            text-sm font-semibold text-white
                            hover:bg-red-500
                            disabled:opacity-50
                        "
                    >
                        {cleaning
                            ? "Czyszczenie..."
                            : "Usuń osierocone"}
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

function MediaLoading() {
    return (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                    key={item}
                    className="
                        h-[430px] animate-pulse
                        rounded-xl border border-zinc-800
                        bg-zinc-900
                    "
                />
            ))}
        </section>
    );
}

function EmptyState({
                        hasFiles,
                        onReset,
                    }) {
    return (
        <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 px-6 py-16 text-center">
            <p className="font-semibold text-zinc-300">
                {hasFiles
                    ? "Brak plików spełniających kryteria"
                    : "Nie znaleziono przesłanych obrazów"}
            </p>

            <p className="mt-2 text-sm text-zinc-500">
                {hasFiles
                    ? "Zmień wyszukiwanie lub filtr statusu."
                    : "Pliki pojawią się tutaj po przesłaniu obrazów legend."}
            </p>

            {hasFiles && (
                <button
                    type="button"
                    onClick={onReset}
                    className="
                        mt-5 rounded-lg border border-zinc-700
                        px-4 py-2 text-sm font-semibold
                        text-zinc-300 hover:text-white
                    "
                >
                    Wyczyść filtry
                </button>
            )}
        </section>
    );
}

function formatFileSize(sizeBytes) {
    const size = Number(sizeBytes);

    if (
        !Number.isFinite(size) ||
        size <= 0
    ) {
        return "0 B";
    }

    const units = [
        "B",
        "KB",
        "MB",
        "GB",
    ];

    const unitIndex = Math.min(
        Math.floor(
            Math.log(size) /
            Math.log(1024)
        ),
        units.length - 1
    );

    const value =
        size /
        Math.pow(1024, unitIndex);

    return `${value.toLocaleString("pl-PL", {
        maximumFractionDigits: 2,
    })} ${units[unitIndex]}`;
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

const inputClassName = `
    w-full rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2.5 text-sm text-white
    outline-none transition-colors
    placeholder:text-zinc-600
    focus:border-amber-500
`;