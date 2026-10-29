import { useEffect } from "react";
import { Link } from "react-router-dom";

import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import LegendCard from "../components/LegendCard";
import LegendForm from "../components/LegendForm";
import LegendModal from "../components/LegendModal";
import LoadingScreen from "../components/LoadingScreen";
import Pagination from "../components/Pagination";
import ResultsInfo from "../components/ResultsInfo";
import SearchBar from "../components/SearchBar";
import { categories, regions, getCategoryLabel, getRegionLabel } from "../data/legendOptions";
import useLegends from "../hooks/useLegends.js";

export default function MyLegendsPage() {
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
    } = useLegends({ endpoint: "/legends/mine", includeStats: false });

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                closeModal();
                cancelDeleteLegend();
            }
        };

        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [closeModal, cancelDeleteLegend]);

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <section className="mx-auto max-w-7xl py-6">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-indigo-400">
                        Konto
                    </p>
                    <h1 className="text-4xl font-bold">Moje legendy</h1>
                    <p className="mt-2 text-zinc-400">
                        Zarządzaj swoimi legendami, podaniami i opowieściami.
                    </p>
                </div>
                <Link
                    to="/legends"
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-indigo-500 hover:text-white"
                >
                    Przeglądaj wszystkie legendy
                </Link>
            </div>

            <LegendForm
                form={form}
                error={error}
                saving={saving}
                uploading={uploading}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onImageUpload={handleImageUpload}
                allowDraft
            />

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

            {legends.length === 0 ? (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-8 text-zinc-300">
                    <h2 className="text-xl font-semibold text-white">Nie masz jeszcze własnych legend</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Dodaj pierwszą opowieść w formularzu powyżej. Możesz zapisać szkic albo wysłać ją do moderacji.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {legends.map((legend) => (
                            <LegendCard key={legend.id} legend={legend} onReadMore={setSelectedLegend} />
                        ))}
                    </div>
                    <Pagination
                        pageInfo={pageInfo}
                        onPrevious={handlePreviousPage}
                        onNext={handleNextPage}
                    />
                </>
            )}

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
                canManage
            />

            <ConfirmDeleteModal
                legend={legendToDelete}
                deleting={deleting}
                onCancel={cancelDeleteLegend}
                onConfirm={handleDeleteLegend}
            />
        </section>
    );
}
