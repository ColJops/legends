import { Link } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import StatsPanel from "../components/StatsPanel";
import StatsCharts from "../components/StatsCharts";
import LegendCard from "../components/LegendCard";
import useLegends from "../hooks/useLegends";
import LoadingScreen from "../components/LoadingScreen";

export default function HomePage() {
    const {
        legends,
        stats,
        loading,
        setSelectedLegend,
        selectedLegend,
        editingLegend,
        editForm,
        deleting,
        updating,
        error,
        closeModal,
        startEdit,
        askDeleteLegend,
        handleEditChange,
        handleUpdateLegend,
        setEditingLegend,
    } = useLegends();

    const latestLegends = legends.slice(0, 3);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <AppHeader />

            <StatsPanel stats={stats} />
            <StatsCharts stats={stats} />

            <section className="mt-10">
                <div className="mb-6 flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">
                        Ostatnio dodane legendy
                    </h2>

                    <Link
                        to="/legends"
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-violet-500 hover:text-white"
                    >
                        Zobacz wszystkie
                    </Link>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {latestLegends.map((legend) => (
                        <LegendCard
                            key={legend.id}
                            legend={legend}
                            onReadMore={setSelectedLegend}
                        />
                    ))}
                </div>
            </section>
        </>
    );
}