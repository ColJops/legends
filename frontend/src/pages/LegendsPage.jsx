import { lazy, Suspense, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

import LoadingScreen from "../components/LoadingScreen";
import SearchBar from "../components/SearchBar";
import LegendCard from "../components/LegendCard";
import LegendForm from "../components/LegendForm";
import LegendModal from "../components/LegendModal";
import AppHeader from "../components/AppHeader";
import ResultsInfo from "../components/ResultsInfo";
import useLegends from "../hooks/useLegends.js";
import Pagination from "../components/Pagination";
import StatsPanel from "../components/StatsPanel.jsx";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useAuth } from "../context/AuthContext";
import { canManageLegend } from "../utils/permissions";

import {
    categories,
    regions,
    getCategoryLabel,
    getRegionLabel,
} from "../data/legendOptions";

const StatsCharts = lazy(() => import("../components/StatsCharts"));

export default function LegendsPage() {
    const { user, isAuthenticated } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const {
        legends,
        form,
        editForm,
        loading,
        saving,
        uploading,
        updating,
        deleting,
        error,
        search,
        pageInfo,
        selectedLegend,
        editingLegend,

        setSearch,
        setSelectedLegend,
        setEditingLegend,

        handleChange,
        handleEditChange,
        handleSearchSubmit,
        handleClearSearch,
        handleSubmit,
        handleImageUpload,
        startEdit,
        handleUpdateLegend,
        handleDeleteLegend,
        closeModal,
        handlePreviousPage,
        handleNextPage,
        selectedCategory,
        selectedRegion,
        handleCategoryChange,
        handleRegionChange,
        sortBy,
        sortDirection,
        handleSortChange,
        legendToDelete,
        askDeleteLegend,
        cancelDeleteLegend,

        uploadingEditImage,
        handleEditImageUpload,
        stats,
    } = useLegends();

    useEffect(() => {
        const legendId = searchParams.get("legendId");

        if (!legendId || legends.length === 0) {
            return;
        }

        const legendToOpen = legends.find(
            (legend) => String(legend.id) === legendId
        );

        if (legendToOpen) {
            setSelectedLegend(legendToOpen);
            setSearchParams({}, { replace: true });
        }
    }, [legends, searchParams, setSearchParams, setSelectedLegend]);

    if (loading) {
        return <LoadingScreen />;
    }

    const canManageSelectedLegend = canManageLegend(user, selectedLegend);

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <section className="mx-auto max-w-7xl px-6 py-10">
                <AppHeader />

                <StatsPanel stats={stats} />

                {stats && (
                    <Suspense fallback={<ChartsLoading />}>
                        <StatsCharts stats={stats} />
                    </Suspense>
                )}

                <SearchBar
                    search={search}
                    selectedCategory={selectedCategory}
                    selectedRegion={selectedRegion}
                    onSearchChange={setSearch}
                    onCategoryChange={handleCategoryChange}
                    onRegionChange={handleRegionChange}
                    onSubmit={handleSearchSubmit}
                    onClear={handleClearSearch}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    onSortChange={handleSortChange}
                />

                <ResultsInfo pageInfo={pageInfo} />

                {isAuthenticated ? (
                    <LegendForm
                        form={form}
                        error={error}
                        saving={saving}
                        uploading={uploading}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        onImageUpload={handleImageUpload}
                    />
                ) : (
                    <div className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-zinc-300">
                        <h2 className="text-2xl font-bold text-white">
                            Chcesz dodać legendę?
                        </h2>

                        <p className="mt-2 text-sm text-zinc-400">
                            Zaloguj się, aby dodać własną legendę, podanie lub lokalną opowieść.
                            Przeglądanie legend jest dostępne dla wszystkich.
                        </p>

                        <Link
                            to="/login"
                            state={{ from: { pathname: "/legends" } }}
                            className="mt-5 inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
                        >
                            Zaloguj się i dodaj legendę
                        </Link>
                    </div>
                )}

                {legends.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-zinc-400">
                        Brak legend w bazie.
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {legends.map((legend) => (
                                <LegendCard
                                    key={legend.id}
                                    legend={legend}
                                    onReadMore={setSelectedLegend}
                                />
                            ))}
                        </div>

                        <Pagination
                            pageInfo={pageInfo}
                            onPrevious={handlePreviousPage}
                            onNext={handleNextPage}
                        />
                    </>
                )}
            </section>

            <LegendModal
                selectedLegend={selectedLegend}
                editingLegend={editingLegend}
                editForm={editForm}

                categories={categories}
                regions={regions}

                deleting={deleting}
                updating={updating}
                error={error}

                onClose={closeModal}
                onStartEdit={startEdit}
                onDelete={askDeleteLegend}

                onEditChange={handleEditChange}
                onUpdate={handleUpdateLegend}

                getCategoryLabel={getCategoryLabel}
                getRegionLabel={getRegionLabel}

                setEditingLegend={setEditingLegend}
                uploadingEditImage={uploadingEditImage}
                onEditImageUpload={handleEditImageUpload}
                canManage={canManageSelectedLegend}
            />

            <ConfirmDeleteModal
                legend={legendToDelete}
                deleting={deleting}
                onCancel={cancelDeleteLegend}
                onConfirm={handleDeleteLegend}
            />
        </main>
    );
}

function ChartsLoading() {
    return (
        <section className="mb-8 grid gap-6 lg:grid-cols-2">
            {[1, 2].map((item) => (
                <div
                    key={item}
                    className="h-80 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/80"
                />
            ))}
        </section>
    );
}
