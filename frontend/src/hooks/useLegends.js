import { useEffect, useState } from "react";
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

    const fetchLegends = (searchValue = search) => {
        setLoading(true);

        api.get("/legends", {
            params: {
                search: searchValue,
                page: 0,
                size: 6,
            },
        })
            .then((response) => {
                setLegends(response.data.content || []);
                setPageInfo(response.data);
            })
            .catch(() => setError("Nie udało się pobrać legend."))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        api.get("/legends", {
            params: {
                search: "",
                page: 0,
                size: 6,
            },
        })
            .then((response) => {
                setLegends(response.data.content || []);
                setPageInfo(response.data);
            })
            .catch(() => setError("Nie udało się pobrać legend."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") {
                setSelectedLegend(null);
                setEditingLegend(null);
            }
        };

        window.addEventListener("keydown", handleEscape);

        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;

        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchLegends(search);
    };

    const handleClearSearch = () => {
        setSearch("");
        fetchLegends("");
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

            const response = await api.post("/legends", payload);

            setLegends((prev) => [response.data, ...prev]);
            setForm(initialForm);
        } catch {
            setError("Nie udało się dodać legendy. Sprawdź wymagane pola.");
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

            setForm((prev) => ({
                ...prev,
                imageUrl: response.data.imageUrl,
            }));
        } catch (error) {
            const message =
                error?.response?.data?.message || "Nie udało się wysłać obrazka.";
            setError(message);
        } finally {
            setUploading(false);
        }
    };

    const startEdit = (legend) => {
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

            setLegends((prev) =>
                prev.map((legend) =>
                    legend.id === editingLegend.id ? response.data : legend
                )
            );

            setSelectedLegend(response.data);
            setEditingLegend(null);
        } catch {
            setError("Nie udało się zaktualizować legendy.");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteLegend = async (id) => {
        const confirmed = window.confirm("Czy na pewno chcesz usunąć tę legendę?");

        if (!confirmed) return;

        setDeleting(true);
        setError("");

        try {
            await api.delete(`/legends/${id}`);

            setLegends((prev) => prev.filter((legend) => legend.id !== id));
            setSelectedLegend(null);
            setEditingLegend(null);
        } catch {
            setError("Nie udało się usunąć legendy.");
        } finally {
            setDeleting(false);
        }
    };

    const closeModal = () => {
        setSelectedLegend(null);
        setEditingLegend(null);
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
    };
}