import { useEffect } from "react";
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
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import { useAuth } from "../context/AuthContext";
import { canManageLegend } from "../utils/permissions";
import api from "../services/api";

import {
    categories,
    regions,
    getCategoryLabel,
    getRegionLabel,
} from "../data/legendOptions";

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
        handleLocationChange,
        handleEditChange,
        handleSearchSubmit,
        handleClearSearch,
        handleSubmit,
        handleImageUpload,
        handleReportLegend,
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
        handleRateLegend,
        handleToggleFavorite,
    } = useLegends();

    useEffect(() => {
        const legendId = searchParams.get("legendId");

        if (!legendId || loading) {
            return;
        }

        const legendToOpen = legends.find(
            (legend) => String(legend.id) === legendId
        );

        if (legendToOpen) {
            setSelectedLegend(legendToOpen);
            setSearchParams({}, { replace: true });
            return;
        }

        api.get(`/legends/${legendId}`)
            .then((response) => {
                setSelectedLegend(response.data);
            })
            .catch(() => {})
            .finally(() => {
                setSearchParams({}, { replace: true });
            });
    }, [legends, loading, searchParams, setSearchParams, setSelectedLegend]);

    if (loading) {
        return <LoadingScreen />;
    }

    const canManageSelectedLegend = canManageLegend(user, selectedLegend);

    return (
        <div>
            <section>
                <AppHeader />

                <Link
                    to="/mapa"
                    className="group mb-8 flex flex-col justify-between gap-5 overflow-hidden rounded-3xl border border-violet-400/20 bg-gradient-to-r from-violet-950/80 via-zinc-900 to-zinc-900 p-6 transition hover:border-violet-300/50 sm:flex-row sm:items-center sm:p-8"
                >
                    <span>
                        <span className="block text-xs font-bold uppercase tracking-[0.2em] text-violet-300">Odkrywaj lokalnie</span>
                        <span className="mt-2 block text-2xl font-bold text-white">Poznaj legendy na mapie Polski</span>
                        <span className="mt-2 block max-w-2xl text-sm text-zinc-400">Wybierz województwo i zobacz opowieści, kategorie oraz miejscowości danego regionu.</span>
                    </span>
                    <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition group-hover:bg-violet-500">Otwórz mapę <span aria-hidden="true">→</span></span>
                </Link>

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
                        onLocationChange={handleLocationChange}
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
                                    onReadMore={setSelectedLegend}
                                    onToggleFavorite={handleToggleFavorite}
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
                canReport={isAuthenticated && user?.role === "USER" && !canManageSelectedLegend}
                onReport={handleReportLegend}
                onRate={handleRateLegend}
                onToggleFavorite={handleToggleFavorite}
            />

            <ConfirmDeleteModal
                legend={legendToDelete}
                deleting={deleting}
                onCancel={cancelDeleteLegend}
                onConfirm={handleDeleteLegend}
            />
        </div>
    );
}
