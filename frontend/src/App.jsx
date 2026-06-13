import LoadingScreen from "./components/LoadingScreen";
import SearchBar from "./components/SearchBar";
import LegendCard from "./components/LegendCard";
import LegendForm from "./components/LegendForm";
import LegendModal from "./components/LegendModal";
import AppHeader from "./components/AppHeader";
import ResultsInfo from "./components/ResultsInfo";
import useLegends from "./hooks/useLegends";
import Pagination from "./components/Pagination";

import {
    categories,
    regions,
    getCategoryLabel,
    getRegionLabel,
} from "./data/legendOptions";

export default function App() {
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
    } = useLegends();

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-white">
            <section className="mx-auto max-w-7xl px-6 py-10">
                <AppHeader />

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

                <LegendForm
                    form={form}
                    error={error}
                    saving={saving}
                    uploading={uploading}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                    onImageUpload={handleImageUpload}
                />

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
                onDelete={handleDeleteLegend}

                onEditChange={handleEditChange}
                onUpdate={handleUpdateLegend}

                getCategoryLabel={getCategoryLabel}
                getRegionLabel={getRegionLabel}

                setEditingLegend={setEditingLegend}
            />

        </main>
    );
}