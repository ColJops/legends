import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { citiesByRegion } from "../data/legendOptions";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

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
                                        uploadingEditImage,
                                        onEditImageUpload,
                                        canManage = false,
                                        canReport = false,
                                        onReport,
                                        onRate,
                                        onToggleFavorite,
                                    }) {
    const { user, isAuthenticated } = useAuth();

    const [reportReason, setReportReason] = useState("INAPPROPRIATE_CONTENT");
    const [reportDetails, setReportDetails] = useState("");
    const [reporting, setReporting] = useState(false);

    // Stan oceniania (gwiazdki 1-5)
    const [hoveredStar, setHoveredStar] = useState(0);
    const [submittingRating, setSubmittingRating] = useState(false);

    // Stan komentarzy
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentContent, setCommentContent] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        if (!selectedLegend?.id || selectedLegend.status !== "PUBLISHED") {
            setComments([]);
            return;
        }

        let active = true;
        setLoadingComments(true);

        api.get(`/legends/${selectedLegend.id}/comments`)
            .then((response) => {
                if (active) {
                    setComments(response.data || []);
                }
            })
            .catch(() => {
                if (active) {
                    setComments([]);
                }
            })
            .finally(() => {
                if (active) {
                    setLoadingComments(false);
                }
            });

        return () => {
            active = false;
        };
    }, [selectedLegend?.id, selectedLegend?.status]);

    if (!selectedLegend) {
        return null;
    }

    const ratingsCount = selectedLegend.ratingsCount ?? 0;
    const averageRating = Number(selectedLegend.averageRating ?? 0).toFixed(1);
    const isAuthor =
        Boolean(user?.username) &&
        selectedLegend.authorUsername === user.username;
    const canVote =
        isAuthenticated &&
        selectedLegend.status === "PUBLISHED" &&
        !isAuthor &&
        !selectedLegend.userRating &&
        typeof onRate === "function";

    const hasUserCommented =
        Boolean(user?.username) &&
        comments.some((c) => c.authorUsername === user.username);

    const handleStarClick = async (starValue) => {
        if (submittingRating || !canVote) return;
        setSubmittingRating(true);
        try {
            await onRate(selectedLegend.id, starValue);
        } finally {
            setSubmittingRating(false);
            setHoveredStar(0);
        }
    };

    const handleAddComment = async (event) => {
        event.preventDefault();
        const trimmed = commentContent.trim();
        if (!trimmed) return;

        setSubmittingComment(true);
        try {
            const response = await api.post(
                `/legends/${selectedLegend.id}/comments`,
                { content: trimmed }
            );
            setComments((prev) => [response.data, ...prev]);
            setCommentContent("");
            toast.success("Komentarz został dodany.");
        } catch (requestError) {
            toast.error(
                requestError?.response?.data?.message ||
                "Nie udało się dodać komentarza."
            );
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await api.delete(`/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success("Komentarz został usunięty.");
        } catch (requestError) {
            toast.error(
                requestError?.response?.data?.message ||
                "Nie udało się usunąć komentarza."
            );
        }
    };

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
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-indigo-500/15 px-4 py-1 text-sm font-medium text-indigo-300">
                                {getCategoryLabel(selectedLegend.category)}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
                                ★ {ratingsCount > 0 ? averageRating : "—"}{" "}
                                <span className="font-normal text-zinc-400">
                                    ({formatVotesLabel(ratingsCount)})
                                </span>
                            </span>

                            {isAuthenticated &&
                                typeof onToggleFavorite === "function" && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onToggleFavorite(selectedLegend)
                                        }
                                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
                                            selectedLegend.favorite
                                                ? "border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                                                : "border-zinc-700 text-zinc-300 hover:border-rose-500/40 hover:text-rose-300"
                                        }`}
                                    >
                                        <span>
                                            {selectedLegend.favorite
                                                ? "❤️"
                                                : "🤍"}
                                        </span>
                                        <span>
                                            {selectedLegend.favorite
                                                ? "Ulubiona"
                                                : "Dodaj do ulubionych"}
                                        </span>
                                    </button>
                                )}
                        </div>

                        <div className="flex items-center gap-3">
                            {!editingLegend && canManage && (
                                <>
                                    <button
                                        onClick={() =>
                                            onStartEdit(selectedLegend)
                                        }
                                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-indigo-500 hover:text-white"
                                    >
                                        Edytuj
                                    </button>

                                    <button
                                        onClick={() =>
                                            onDelete(selectedLegend)
                                        }
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
                    </div>

                    {error && (
                        <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                            {error}
                        </div>
                    )}

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
                                    <option
                                        key={category.value}
                                        value={category.value}
                                    >
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

                                {(citiesByRegion[editForm.region] || []).map(
                                    (city) => (
                                        <option key={city} value={city}>
                                            {city}
                                        </option>
                                    )
                                )}
                            </select>

                            <select
                                name="region"
                                value={editForm.region}
                                onChange={onEditChange}
                                required
                                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            >
                                {regions.map((region) => (
                                    <option
                                        key={region.value}
                                        value={region.value}
                                    >
                                        {region.label}
                                    </option>
                                ))}
                            </select>

                            <div>
                                <label className="mb-2 block text-sm text-zinc-400">
                                    Obrazek legendy
                                </label>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={onEditImageUpload}
                                    className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
                                />

                                {uploadingEditImage && (
                                    <p className="mt-2 text-sm text-indigo-300">
                                        Wysyłanie obrazka...
                                    </p>
                                )}

                                {editForm.imageUrl && (
                                    <img
                                        src={editForm.imageUrl}
                                        alt="Podgląd obrazka"
                                        className="mt-4 h-48 w-full rounded-xl object-cover"
                                    />
                                )}
                            </div>

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
                                    {updating
                                        ? "Zapisywanie..."
                                        : "Zapisz zmiany"}
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

                            {selectedLegend.authorUsername && (
                                <p className="mt-2 text-sm text-zinc-500">
                                    Dodane przez:{" "}
                                    <Link
                                        to={`/users/${selectedLegend.authorUsername}`}
                                        onClick={onClose}
                                        className="font-medium text-indigo-300 transition hover:text-indigo-200 hover:underline"
                                    >
                                        {selectedLegend.authorUsername}
                                    </Link>
                                </p>
                            )}

                            <div className="mt-8 whitespace-pre-line text-lg leading-8 text-zinc-300">
                                {selectedLegend.content}
                            </div>

                            {selectedLegend.status &&
                                selectedLegend.status !== "PUBLISHED" && (
                                    <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-amber-200">
                                        Status:{" "}
                                        {{
                                                DRAFT: "Szkic",
                                                PENDING: "Oczekuje na moderację",
                                                REJECTED: "Odrzucona",
                                                ARCHIVED: "Zarchiwizowana",
                                            }[selectedLegend.status] ||
                                            selectedLegend.status}
                                        {selectedLegend.rejectionReason && (
                                            <p className="mt-1">
                                                Powód odrzucenia:{" "}
                                                {selectedLegend.rejectionReason}
                                            </p>
                                        )}
                                    </div>
                                )}

                            {/* SEKCJA OCENY (1-5 GWIAZDEK) */}
                            {selectedLegend.status === "PUBLISHED" && (
                                <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
                                    <div className="flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-semibold text-white">
                                                Ocena czytelników
                                            </h3>
                                            <p className="mt-1 text-sm text-zinc-400">
                                                Średnia:{" "}
                                                <strong className="text-amber-300">
                                                    ★{" "}
                                                    {ratingsCount > 0
                                                        ? averageRating
                                                        : "Brak ocen"}
                                                </strong>{" "}
                                                ({formatVotesLabel(ratingsCount)})
                                            </p>
                                        </div>

                                        {canVote && (
                                            <div className="flex items-center gap-1">
                                                <span className="mr-2 text-xs text-zinc-400">
                                                    Oceń legendę:
                                                </span>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        disabled={
                                                            submittingRating
                                                        }
                                                        onMouseEnter={() =>
                                                            setHoveredStar(star)
                                                        }
                                                        onMouseLeave={() =>
                                                            setHoveredStar(0)
                                                        }
                                                        onClick={() =>
                                                            handleStarClick(
                                                                star
                                                            )
                                                        }
                                                        aria-label={`Oceń na ${star}`}
                                                        className={`text-2xl transition-transform hover:scale-110 disabled:opacity-50 ${
                                                            star <= hoveredStar
                                                                ? "text-amber-400"
                                                                : "text-zinc-600 hover:text-amber-300"
                                                        }`}
                                                    >
                                                        ★
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedLegend.userRating && (
                                            <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
                                                Twoja ocena: ★{" "}
                                                {selectedLegend.userRating}/5
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* SEKCJA KOMENTARZY */}
                            {selectedLegend.status === "PUBLISHED" && (
                                <section className="mt-8 border-t border-zinc-800 pt-6">
                                    <h3 className="text-lg font-semibold text-white">
                                        Komentarze ({comments.length})
                                    </h3>

                                    {isAuthenticated && !hasUserCommented && (
                                        <form
                                            onSubmit={handleAddComment}
                                            className="mt-4 space-y-3"
                                        >
                                            <textarea
                                                value={commentContent}
                                                onChange={(e) =>
                                                    setCommentContent(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Dodaj swój komentarz do tej legendy..."
                                                maxLength={2000}
                                                rows={3}
                                                required
                                                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500"
                                            />
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    disabled={submittingComment}
                                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
                                                >
                                                    {submittingComment
                                                        ? "Publikowanie..."
                                                        : "Dodaj komentarz"}
                                                </button>
                                            </div>
                                        </form>
                                    )}

                                    {loadingComments ? (
                                        <p className="mt-4 text-sm text-zinc-500">
                                            Ładowanie komentarzy...
                                        </p>
                                    ) : comments.length === 0 ? (
                                        <p className="mt-4 text-sm text-zinc-500">
                                            Brak komentarzy. Bądź pierwszą
                                            osobą, która skomentuje tę legendę!
                                        </p>
                                    ) : (
                                        <ul className="mt-5 space-y-4">
                                            {comments.map((comment) => {
                                                const canDeleteComment =
                                                    user?.role === "ADMIN" ||
                                                    user?.username ===
                                                    comment.authorUsername;

                                                return (
                                                    <li
                                                        key={comment.id}
                                                        className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4"
                                                    >
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <Link
                                                                    to={`/users/${comment.authorUsername}`}
                                                                    onClick={
                                                                        onClose
                                                                    }
                                                                    className="font-semibold text-indigo-300 hover:underline"
                                                                >
                                                                    {
                                                                        comment.authorUsername
                                                                    }
                                                                </Link>
                                                                <span className="text-xs text-zinc-500">
                                                                    •{" "}
                                                                    {formatCommentDate(
                                                                        comment.createdAt
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {canDeleteComment && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteComment(
                                                                            comment.id
                                                                        )
                                                                    }
                                                                    className="text-xs text-red-400 transition hover:text-red-300"
                                                                >
                                                                    Usuń
                                                                </button>
                                                            )}
                                                        </div>

                                                        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-zinc-300">
                                                            {comment.content}
                                                        </p>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    )}
                                </section>
                            )}

                            {/* SEKCJA ZGŁASZANIA TREŚCI */}
                            {canReport &&
                                selectedLegend.status === "PUBLISHED" && (
                                    <form
                                        className="mt-8 border-t border-zinc-800 pt-6"
                                        onSubmit={async (event) => {
                                            event.preventDefault();
                                            setReporting(true);
                                            try {
                                                const submitted =
                                                    await onReport(
                                                        selectedLegend.id,
                                                        {
                                                            reason: reportReason,
                                                            details:
                                                                reportDetails ||
                                                                null,
                                                        }
                                                    );
                                                if (submitted)
                                                    setReportDetails("");
                                            } finally {
                                                setReporting(false);
                                            }
                                        }}
                                    >
                                        <h3 className="font-semibold text-white">
                                            Zgłoś treść
                                        </h3>
                                        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                            <select
                                                value={reportReason}
                                                onChange={(event) =>
                                                    setReportReason(
                                                        event.target.value
                                                    )
                                                }
                                                className="rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                                            >
                                                <option value="INAPPROPRIATE_CONTENT">
                                                    Nieodpowiednia treść
                                                </option>
                                                <option value="SPAM">
                                                    Spam
                                                </option>
                                                <option value="HARASSMENT">
                                                    Nękanie
                                                </option>
                                                <option value="COPYRIGHT">
                                                    Naruszenie praw autorskich
                                                </option>
                                                <option value="OTHER">
                                                    Inny powód
                                                </option>
                                            </select>
                                            <input
                                                value={reportDetails}
                                                onChange={(event) =>
                                                    setReportDetails(
                                                        event.target.value
                                                    )
                                                }
                                                maxLength={1000}
                                                placeholder="Szczegóły (opcjonalnie)"
                                                className="min-w-0 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white"
                                            />
                                            <button
                                                disabled={reporting}
                                                className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-red-400 disabled:opacity-50"
                                            >
                                                {reporting
                                                    ? "Wysyłanie..."
                                                    : "Wyślij zgłoszenie"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function formatVotesLabel(count) {
    if (count === 1) return "1 głos";
    const mod10 = count % 10;
    const mod100 = count % 100;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
        return `${count} głosy`;
    }
    return `${count} głosów`;
}

function formatCommentDate(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("pl-PL", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(date);
}