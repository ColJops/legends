import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
    approveLegend,
    archiveLegend,
    deleteReportedComment,
    dismissCommentReport,
    dismissLegendReport,
    getModerationCommentReports,
    getModerationQueue,
    getModerationReports,
    rejectLegend,
} from "../../api/adminModerationApi";

const REASON_LABELS = {
    INAPPROPRIATE_CONTENT: "Nieodpowiednia treść",
    SPAM: "Spam",
    HARASSMENT: "Nękanie",
    COPYRIGHT: "Naruszenie praw autorskich",
    OTHER: "Inny powód",
};

export default function AdminModerationPage() {
    const [tab, setTab] = useState("queue");
    const [queue, setQueue] = useState({ content: [], totalPages: 0, number: 0 });
    const [reports, setReports] = useState({ content: [], totalPages: 0, number: 0 });
    const [commentReports, setCommentReports] = useState({ content: [], totalPages: 0, number: 0 });
    const [loading, setLoading] = useState(true);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [queueData, reportData, commentReportData] = await Promise.all([
                getModerationQueue(queue.number || 0),
                getModerationReports(reports.number || 0),
                getModerationCommentReports(commentReports.number || 0),
            ]);
            setQueue(queueData);
            setReports(reportData);
            setCommentReports(commentReportData);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Nie udało się pobrać kolejki moderacji.");
        } finally {
            setLoading(false);
        }
    }, [queue.number, reports.number, commentReports.number]);

    useEffect(() => {
        void load();
    }, [load]);

    async function decide(action, legend) {
        const moderationNotes = window.prompt("Notatki moderatora (opcjonalnie):") || "";
        try {
            if (action === "approve") await approveLegend(legend.id, { moderationNotes });
            if (action === "archive") await archiveLegend(legend.id, { moderationNotes });
            if (action === "reject") {
                const rejectionReason = window.prompt("Podaj powód odrzucenia:");
                if (!rejectionReason?.trim()) return;
                await rejectLegend(legend.id, { rejectionReason, moderationNotes });
            }
            toast.success("Decyzja moderacyjna została zapisana.");
            await load();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Nie udało się zapisać decyzji.");
        }
    }

    async function dismiss(report) {
        const moderationNotes = window.prompt("Notatka do zamknięcia zgłoszenia (opcjonalnie):") || "";
        try {
            await dismissLegendReport(report.id, { moderationNotes });
            toast.success("Zgłoszenie zostało zamknięte.");
            await load();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Nie udało się zamknąć zgłoszenia.");
        }
    }

    async function handleDismissCommentReport(report) {
        const moderationNotes = window.prompt("Notatka do zamknięcia zgłoszenia komentarza (opcjonalnie):") || "";
        try {
            await dismissCommentReport(report.id, { moderationNotes });
            toast.success("Zgłoszenie komentarza zostało zamknięte.");
            await load();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Nie udało się zamknąć zgłoszenia komentarza.");
        }
    }

    async function handleDeleteCommentFromReport(report) {
        const moderationNotes = window.prompt("Powód usunięcia komentarza / notatka moderatora (opcjonalnie):") || "";
        try {
            await deleteReportedComment(report.id, { moderationNotes });
            toast.success("Komentarz został usunięty, a zgłoszenie zamknięte.");
            await load();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Nie udało się usunąć komentarza.");
        }
    }

    const tabClass = (active) =>
        `rounded-xl px-4 py-2 text-sm font-semibold ${
            active ? "bg-amber-500 text-zinc-950" : "border border-zinc-700 text-zinc-300"
        }`;

    return (
        <section>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400">Treści</p>
            <h1 className="mt-2 text-3xl font-bold text-white">Moderacja</h1>
            <p className="mt-2 text-sm text-zinc-400">
                Rozpatruj nowe legendy oraz zgłoszenia legend i komentarzy.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
                <button className={tabClass(tab === "queue")} onClick={() => setTab("queue")}>
                    Kolejka legend ({queue.totalElements || 0})
                </button>
                <button className={tabClass(tab === "reports")} onClick={() => setTab("reports")}>
                    Zgłoszenia legend ({reports.totalElements || 0})
                </button>
                <button className={tabClass(tab === "comments")} onClick={() => setTab("comments")}>
                    Zgłoszenia komentarzy ({commentReports.totalElements || 0})
                </button>
                <button
                    className="ml-auto rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                    onClick={load}
                >
                    Odśwież
                </button>
            </div>

            {loading ? (
                <p className="mt-8 text-zinc-400">Ładowanie…</p>
            ) : tab === "queue" ? (
                <div className="mt-5 space-y-4">
                    {queue.content?.length ? (
                        queue.content.map((legend) => (
                            <article key={legend.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">{legend.title}</h2>
                                        <p className="mt-1 text-sm text-zinc-400">
                                            {legend.authorUsername || "Usunięty użytkownik"} · {legend.city},{" "}
                                            {legend.region} · {legend.category}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-300">
                                        Oczekuje na moderację
                                    </span>
                                </div>
                                <ModerationImage src={legend.imageUrl} alt={legend.title} />
                                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-300">
                                    {legend.content}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => decide("approve", legend)}
                                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                                    >
                                        Zatwierdź
                                    </button>
                                    <button
                                        onClick={() => decide("reject", legend)}
                                        className="rounded-lg border border-red-500/50 px-4 py-2 text-sm font-semibold text-red-300"
                                    >
                                        Odrzuć
                                    </button>
                                    <button
                                        onClick={() => decide("archive", legend)}
                                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                                    >
                                        Archiwizuj
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <Empty>Brak legend oczekujących na moderację.</Empty>
                    )}
                    <Pager data={queue} change={(page) => setQueue((current) => ({ ...current, number: page }))} />
                </div>
            ) : tab === "reports" ? (
                <div className="mt-5 space-y-4">
                    {reports.content?.length ? (
                        reports.content.map((report) => (
                            <article key={report.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                                <h2 className="text-lg font-bold text-white">{report.legendTitle}</h2>
                                <p className="mt-1 text-sm text-zinc-400">
                                    Zgłaszający: {report.reporterUsername} · autor:{" "}
                                    {report.authorUsername || "Usunięty użytkownik"}
                                </p>
                                <ModerationImage src={report.imageUrl} alt={report.legendTitle} />
                                <p className="mt-4 whitespace-pre-line text-sm leading-6 text-zinc-300">
                                    {report.legendContent}
                                </p>
                                <p className="mt-3 text-sm text-amber-300">
                                    Powód: {REASON_LABELS[report.reason] || report.reason}
                                </p>
                                {report.details && <p className="mt-2 text-sm text-zinc-300">{report.details}</p>}
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={async () => {
                                            const moderationNotes =
                                                window.prompt("Powód archiwizacji / notatki moderatora:") || "";
                                            try {
                                                await archiveLegend(report.legendId, { moderationNotes });
                                                await dismissLegendReport(report.id, {
                                                    moderationNotes:
                                                        "Legenda zarchiwizowana po rozpatrzeniu zgłoszenia.",
                                                });
                                                toast.success(
                                                    "Legenda została zarchiwizowana, a zgłoszenie zamknięte."
                                                );
                                                await load();
                                            } catch (error) {
                                                toast.error(
                                                    error?.response?.data?.message ||
                                                    "Nie udało się zarchiwizować legendy."
                                                );
                                            }
                                        }}
                                        className="rounded-lg border border-red-500/50 px-4 py-2 text-sm text-red-300"
                                    >
                                        Archiwizuj legendę
                                    </button>
                                    <button
                                        onClick={() => dismiss(report)}
                                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                                    >
                                        Zamknij bez działań
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <Empty>Brak otwartych zgłoszeń legend.</Empty>
                    )}
                    <Pager data={reports} change={(page) => setReports((current) => ({ ...current, number: page }))} />
                </div>
            ) : (
                <div className="mt-5 space-y-4">
                    {commentReports.content?.length ? (
                        commentReports.content.map((report) => (
                            <article key={report.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="text-lg font-bold text-white">
                                        Komentarz pod legendą: „{report.legendTitle}”
                                    </h2>
                                    <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                                        Zgłoszony komentarz
                                    </span>
                                </div>

                                <p className="mt-1 text-sm text-zinc-400">
                                    Autor komentarza:{" "}
                                    <strong className="text-zinc-200">
                                        {report.commentAuthorUsername || "Usunięty użytkownik"}
                                    </strong>{" "}
                                    · Zgłaszający: {report.reporterUsername}
                                </p>

                                <blockquote className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-200">
                                    {report.commentContent}
                                </blockquote>

                                <p className="mt-3 text-sm text-amber-300">
                                    Powód: {REASON_LABELS[report.reason] || report.reason}
                                </p>
                                {report.details && (
                                    <p className="mt-1 text-sm text-zinc-300">Szczegóły: {report.details}</p>
                                )}

                                <div className="mt-4 flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleDeleteCommentFromReport(report)}
                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
                                    >
                                        Usuń komentarz
                                    </button>
                                    <button
                                        onClick={() => handleDismissCommentReport(report)}
                                        className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300"
                                    >
                                        Zamknij zgłoszenie bez działań
                                    </button>
                                </div>
                            </article>
                        ))
                    ) : (
                        <Empty>Brak otwartych zgłoszeń komentarzy.</Empty>
                    )}
                    <Pager
                        data={commentReports}
                        change={(page) => setCommentReports((current) => ({ ...current, number: page }))}
                    />
                </div>
            )}
        </section>
    );
}

function Empty({ children }) {
    return <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-zinc-400">{children}</div>;
}

function ModerationImage({ src, alt }) {
    if (!src) return null;
    return (
        <a
            href={src}
            target="_blank"
            rel="noreferrer"
            className="mt-4 block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950"
            aria-label={`Otwórz pełny obraz: ${alt}`}
        >
            <img src={src} alt={`Obraz legendy: ${alt}`} className="max-h-[32rem] w-full object-contain" />
        </a>
    );
}

function Pager({ data, change }) {
    if ((data.totalPages || 0) < 2) return null;
    return (
        <div className="flex justify-end gap-2">
            <button
                disabled={data.first}
                onClick={() => change(data.number - 1)}
                className="rounded-lg border border-zinc-700 px-3 py-2 disabled:opacity-40"
            >
                Poprzednia
            </button>
            <button
                disabled={data.last}
                onClick={() => change(data.number + 1)}
                className="rounded-lg border border-zinc-700 px-3 py-2 disabled:opacity-40"
            >
                Następna
            </button>
        </div>
    );
}