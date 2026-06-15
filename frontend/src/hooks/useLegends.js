import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const initialForm = {
    title: "",
    content: "",
    region: "",
    city: "",
    category: "",
    imageUrl: "",
};

export default function useLegends() {
    const [legends, setLegends] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editForm, setEditForm] = useState(initialForm);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [pageInfo, setPageInfo] = useState(null);

    const [selectedLegend, setSelectedLegend] = useState(null);
    const [editingLegend, setEditingLegend] = useState(null);

    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 6;

    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");

    const [sortBy, setSortBy] = useState("createdAt");
    const [sortDirection, setSortDirection] = useState("desc");

    const [legendToDelete, setLegendToDelete] = useState(null);
    const [uploadingEditImage, setUploadingEditImage] = useState(false);

    const fetchLegends = async (
        searchValue = search,
        pageValue = currentPage,
        categoryValue = selectedCategory,
        regionValue = selectedRegion,
        sortByValue = sortBy,
        sortDirectionValue = sortDirection
    ) => {
        setLoading(true);

        try {
            const response = await api.get("/legends", {
                params: {
                    search: searchValue,
                    category: categoryValue || undefined,
                    region: regionValue || undefined,
                    sortBy: sortByValue,
                    direction: sortDirectionValue,
                    page: pageValue,
                    size: pageSize,
                },
            });

            setLegends(response.data.content || []);
            setPageInfo(response.data);
            setCurrentPage(response.data.page ?? pageValue);
        } catch {
            const message = "Nie udało się pobrać legend.";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const refreshCurrentView = async (pageValue = currentPage) => {
        await fetchLegends(
            search,
            pageValue,
            selectedCategory,
            selectedRegion,
            sortBy,
            sortDirection
        );
    };

    useEffect(() => {
        api.get("/legends", {
            params: {
                search: "",
                page: 0,
                size: pageSize,
                sortBy: "createdAt",
                direction: "desc",
            },
        })
            .then((response) => {
                setLegends(response.data.content || []);
                setPageInfo(response.data);
                setCurrentPage(response.data.page ?? 0);
            })
            .catch(() => {
                const message = "Nie udało się pobrać legend.";
                setError(message);
                toast.error(message);
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setSelectedLegend(null);
                setEditingLegend(null);
                setError("");
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const handleSortChange = async (value) => {
        const [newSortBy, newDirection] = value.split(":");

        setSortBy(newSortBy);
        setSortDirection(newDirection);
        setCurrentPage(0);

        await fetchLegends(
            search,
            0,
            selectedCategory,
            selectedRegion,
            newSortBy,
            newDirection
        );
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => {
            if (name === "region") {
                return {
                    ...prev,
                    region: value,
                    city: "",
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => {
            if (name === "region") {
                return {
                    ...prev,
                    region: value,
                    city: "",
                };
            }

            return {
                ...prev,
                [name]: value,
            };
        });
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setCurrentPage(0);

        await fetchLegends(
            search,
            0,
            selectedCategory,
            selectedRegion,
            sortBy,
            sortDirection
        );
    };

    const handleClearSearch = async () => {
        setSearch("");
        setSelectedCategory("");
        setSelectedRegion("");
        setCurrentPage(0);
        setSortBy("createdAt");
        setSortDirection("desc");
        setError("");

        await fetchLegends("", 0, "", "", "createdAt", "desc");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            const payload = {
                ...form,
                imageUrl: form.imageUrl.trim() === "" ? null : form.imageUrl,
            };

            await api.post("/legends", payload);

            setForm(initialForm);
            await refreshCurrentView(0);

            toast.success("Legenda została dodana.");
        } catch {
            const message = "Nie udało się dodać legendy. Sprawdź wymagane pola.";
            setError(message);
            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploading(true);
        setError("");

        try {
            const response = await api.post("/uploads/legend-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const uploadedImageUrl = response.data.imageUrl || "";

            setForm({
                ...form,
                imageUrl: uploadedImageUrl,
            });

            toast.success("Obrazek został przesłany.");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Nie udało się wysłać obrazka.";

            setError(message);
            toast.error(message);
        } finally {
            setUploading(false);
        }
    };

    const startEdit = (legend) => {
        setError("");
        setEditingLegend(legend);
        setEditForm({
            title: legend.title || "",
            content: legend.content || "",
            region: legend.region || "",
            city: legend.city || "",
            category: legend.category || "",
            imageUrl: legend.imageUrl || "",
        });
    };

    const handleUpdateLegend = async (e) => {
        e.preventDefault();

        if (!editingLegend) return;

        setUpdating(true);
        setError("");

        try {
            const payload = {
                ...editForm,
                imageUrl: editForm.imageUrl.trim() === "" ? null : editForm.imageUrl,
            };

            const response = await api.put(`/legends/${editingLegend.id}`, payload);

            setSelectedLegend(response.data);
            setEditingLegend(null);

            await refreshCurrentView(currentPage);

            toast.success("Legenda została zaktualizowana.");
        } catch {
            const message = "Nie udało się zaktualizować legendy.";
            setError(message);
            toast.error(message);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteLegend = async (id) => {
        setDeleting(true);
        setError("");

        try {
            await api.delete(`/legends/${id}`);

            setSelectedLegend(null);
            setEditingLegend(null);
            setLegendToDelete(null);

            const shouldGoToPreviousPage = legends.length === 1 && currentPage > 0;

            await refreshCurrentView(
                shouldGoToPreviousPage ? currentPage - 1 : currentPage
            );

            toast.success("Legenda została usunięta.");
        } catch {
            const message = "Nie udało się usunąć legendy.";
            setError(message);
            toast.error(message);
        } finally {
            setDeleting(false);
        }
    };

    const closeModal = () => {
        setSelectedLegend(null);
        setEditingLegend(null);
        setError("");
    };

    const handlePreviousPage = async () => {
        if (!pageInfo || pageInfo.first) return;

        const previousPage = currentPage - 1;
        setCurrentPage(previousPage);

        await fetchLegends(
            search,
            previousPage,
            selectedCategory,
            selectedRegion,
            sortBy,
            sortDirection
        );
    };

    const handleNextPage = async () => {
        if (!pageInfo || pageInfo.last) return;

        const nextPage = currentPage + 1;
        setCurrentPage(nextPage);

        await fetchLegends(
            search,
            nextPage,
            selectedCategory,
            selectedRegion,
            sortBy,
            sortDirection
        );
    };

    const handleCategoryChange = async (value) => {
        setSelectedCategory(value);
        setCurrentPage(0);

        await fetchLegends(
            search,
            0,
            value,
            selectedRegion,
            sortBy,
            sortDirection
        );
    };

    const handleRegionChange = async (value) => {
        setSelectedRegion(value);
        setCurrentPage(0);

        await fetchLegends(
            search,
            0,
            selectedCategory,
            value,
            sortBy,
            sortDirection
        );
    };

    const askDeleteLegend = (legend) => {
        setError("");
        setLegendToDelete(legend);
    };

    const cancelDeleteLegend = () => {
        setLegendToDelete(null);
    };

    const handleEditImageUpload = async (e) => {
        const file = e.target.files[0];

        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploadingEditImage(true);
        setError("");

        try {
            const response = await api.post("/uploads/legend-image", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const uploadedImageUrl = response.data.imageUrl || "";

            setEditForm({
                ...editForm,
                imageUrl: uploadedImageUrl,
            });

            toast.success("Nowy obrazek został przesłany.");
        } catch (error) {
            const message =
                error?.response?.data?.message || "Nie udało się wysłać obrazka.";

            setError(message);
            toast.error(message);
        } finally {
            setUploadingEditImage(false);
        }
    };

    return {
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
        currentPage,
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
    };
}