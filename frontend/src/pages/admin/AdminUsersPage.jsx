import {
    useCallback,
    useEffect,
    useState,
} from "react";
import toast from "react-hot-toast";

import {
    deleteAdminUser,
    getAdminUsers,
    updateAdminUserLock,
    updateAdminUserRole,
} from "../../api/adminUsersApi";

import { useAuth } from "../../context/AuthContext";
import { getApiErrorMessage } from "../../utils/apiError";

const initialFilters = {
    search: "",
    role: "",
    enabled: "",
    locked: "",
};

const initialPageData = {
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 0,
    first: true,
    last: true,
};

export default function AdminUsersPage() {
    const { user: currentUser } = useAuth();

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] =
        useState(initialFilters);

    const [pageData, setPageData] = useState(initialPageData);
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);

    const [sortBy, setSortBy] = useState("createdAt");
    const [direction, setDirection] = useState("desc");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [pendingAction, setPendingAction] = useState(null);
    const [processing, setProcessing] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteContentAction, setDeleteContentAction] =
        useState("ANONYMIZE");
    const [deleting, setDeleting] = useState(false);

    const loadUsers = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const data = await getAdminUsers({
                search: appliedFilters.search || undefined,
                role: appliedFilters.role || undefined,
                enabled: parseBooleanFilter(
                    appliedFilters.enabled
                ),
                locked: parseBooleanFilter(
                    appliedFilters.locked
                ),
                page,
                size,
                sortBy,
                direction,
            });

            setPageData(data);
        } catch (requestError) {
            setError(
                getApiErrorMessage(
                    requestError,
                    "Nie udało się pobrać użytkowników."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [
        appliedFilters,
        page,
        size,
        sortBy,
        direction,
    ]);

    useEffect(() => {
        void loadUsers();
    }, [loadUsers]);

    function handleFilterChange(event) {
        const { name, value } = event.target;

        setFilters((currentFilters) => ({
            ...currentFilters,
            [name]: value,
        }));
    }

    function handleSubmitFilters(event) {
        event.preventDefault();

        setAppliedFilters({
            ...filters,
            search: filters.search.trim(),
        });

        setPage(0);
    }

    function handleResetFilters() {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
        setPage(0);
    }

    function handleSizeChange(event) {
        setSize(Number(event.target.value));
        setPage(0);
    }

    function handleSortChange(event) {
        setSortBy(event.target.value);
        setPage(0);
    }

    function handleDirectionChange(event) {
        setDirection(event.target.value);
        setPage(0);
    }

    function requestRoleChange(targetUser, newRole) {
        if (targetUser.role === newRole) {
            return;
        }

        setPendingAction({
            type: "role",
            user: targetUser,
            newRole,
        });
    }

    function requestLockChange(targetUser) {
        setPendingAction({
            type: "lock",
            user: targetUser,
            locked: !targetUser.locked,
        });
    }

    async function handleConfirmAction() {
        if (!pendingAction) {
            return;
        }

        setProcessing(true);
        setError("");

        try {
            if (pendingAction.type === "role") {
                await updateAdminUserRole(
                    pendingAction.user.id,
                    pendingAction.newRole
                );

                toast.success("Rola użytkownika została zmieniona.");
            }

            if (pendingAction.type === "lock") {
                await updateAdminUserLock(
                    pendingAction.user.id,
                    pendingAction.locked
                );

                toast.success(
                    pendingAction.locked
                        ? "Konto zostało zablokowane."
                        : "Konto zostało odblokowane."
                );
            }

            setPendingAction(null);
            await loadUsers();
        } catch (requestError) {
            const message = getApiErrorMessage(
                requestError,
                "Nie udało się wykonać operacji."
            );

            setError(message);
            toast.error(message);
            setPendingAction(null);
        } finally {
            setProcessing(false);
        }
    }

    function requestDeleteUser(targetUser) {
        setDeleteTarget(targetUser);
        setDeleteContentAction("ANONYMIZE");
    }

    async function handleDeleteUser() {
        if (!deleteTarget) {
            return;
        }

        setDeleting(true);
        setError("");

        try {
            await deleteAdminUser(
                deleteTarget.id,
                deleteContentAction
            );

            toast.success(
                deleteContentAction === "DELETE"
                    ? "Użytkownik i jego legendy zostały usunięte."
                    : "Użytkownik został usunięty, a jego legendy zachowano."
            );

            setDeleteTarget(null);

            if (
                pageData.content.length === 1 &&
                page > 0
            ) {
                setPage((currentPage) =>
                    Math.max(currentPage - 1, 0)
                );
            } else {
                await loadUsers();
            }
        } catch (requestError) {
            const message = getApiErrorMessage(
                requestError,
                "Nie udało się usunąć użytkownika."
            );

            setError(message);
            toast.error(message);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    return (
        <div className="space-y-6">
            <header>
                <p className="text-sm font-medium text-amber-500">
                    Administracja kontami
                </p>

                <h1 className="mt-2 text-3xl font-bold text-white">
                    Użytkownicy
                </h1>

                <p className="mt-3 max-w-3xl text-zinc-400">
                    Zarządzanie rolami, dostępem do aplikacji
                    oraz blokadami kont użytkowników.
                </p>
            </header>

            <UsersFilters
                filters={filters}
                size={size}
                sortBy={sortBy}
                direction={direction}
                onFilterChange={handleFilterChange}
                onSubmit={handleSubmitFilters}
                onReset={handleResetFilters}
                onSizeChange={handleSizeChange}
                onSortChange={handleSortChange}
                onDirectionChange={handleDirectionChange}
            />

            {error && (
                <ErrorMessage
                    message={error}
                    onRetry={() => void loadUsers()}
                />
            )}

            <section className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 px-5 py-4">
                    <div>
                        <h2 className="font-semibold text-white">
                            Lista użytkowników
                        </h2>

                        <p className="mt-1 text-sm text-zinc-500">
                            Znaleziono:{" "}
                            <span className="font-semibold text-zinc-300">
                                {pageData.totalElements}
                            </span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => void loadUsers()}
                        disabled={loading}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-medium
                            text-zinc-300 transition-colors
                            hover:border-amber-500
                            hover:text-amber-400
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        Odśwież
                    </button>
                </div>

                {loading ? (
                    <TableLoading />
                ) : pageData.content.length === 0 ? (
                    <EmptyState />
                ) : (
                    <UsersTable
                        users={pageData.content}
                        currentUsername={currentUser?.username}
                        onRoleChange={requestRoleChange}
                        onLockChange={requestLockChange}
                        onDelete={requestDeleteUser}
                    />
                )}

                <Pagination
                    page={page}
                    totalPages={pageData.totalPages}
                    first={pageData.first}
                    last={pageData.last}
                    onPageChange={setPage}
                />
            </section>

            {pendingAction && (
                <ConfirmUserActionDialog
                    action={pendingAction}
                    processing={processing}
                    onCancel={() => setPendingAction(null)}
                    onConfirm={() => void handleConfirmAction()}
                />
            )}

            {deleteTarget && (
                <DeleteUserDialog
                    user={deleteTarget}
                    contentAction={deleteContentAction}
                    deleting={deleting}
                    onContentActionChange={setDeleteContentAction}
                    onCancel={() => setDeleteTarget(null)}
                    onConfirm={() => void handleDeleteUser()}
                />
            )}
        </div>
    );
}

function UsersFilters({
                          filters,
                          size,
                          sortBy,
                          direction,
                          onFilterChange,
                          onSubmit,
                          onReset,
                          onSizeChange,
                          onSortChange,
                          onDirectionChange,
                      }) {
    return (
        <form
            onSubmit={onSubmit}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
        >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <FilterField label="Wyszukiwanie">
                    <input
                        type="search"
                        name="search"
                        value={filters.search}
                        onChange={onFilterChange}
                        placeholder="Nazwa użytkownika lub e-mail"
                        className={inputClassName}
                    />
                </FilterField>

                <FilterField label="Rola">
                    <select
                        name="role"
                        value={filters.role}
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">Wszystkie role</option>
                        <option value="USER">Użytkownik</option>
                        <option value="ADMIN">
                            Administrator
                        </option>
                    </select>
                </FilterField>

                <FilterField label="Stan konta">
                    <select
                        name="enabled"
                        value={filters.enabled}
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">Wszystkie konta</option>
                        <option value="true">Aktywne</option>
                        <option value="false">Wyłączone</option>
                    </select>
                </FilterField>

                <FilterField label="Blokada">
                    <select
                        name="locked"
                        value={filters.locked}
                        onChange={onFilterChange}
                        className={inputClassName}
                    >
                        <option value="">
                            Wszystkie statusy
                        </option>
                        <option value="false">
                            Niezablokowane
                        </option>
                        <option value="true">Zablokowane</option>
                    </select>
                </FilterField>
            </div>

            <div className="mt-5 flex flex-wrap items-end gap-4 border-t border-zinc-800 pt-5">
                <FilterField label="Sortowanie">
                    <select
                        value={sortBy}
                        onChange={onSortChange}
                        className={smallInputClassName}
                    >
                        <option value="createdAt">
                            Data rejestracji
                        </option>
                        <option value="username">
                            Nazwa użytkownika
                        </option>
                        <option value="email">E-mail</option>
                        <option value="role">Rola</option>
                        <option value="locked">Blokada</option>
                        <option value="id">Identyfikator</option>
                    </select>
                </FilterField>

                <FilterField label="Kierunek">
                    <select
                        value={direction}
                        onChange={onDirectionChange}
                        className={smallInputClassName}
                    >
                        <option value="desc">Malejąco</option>
                        <option value="asc">Rosnąco</option>
                    </select>
                </FilterField>

                <FilterField label="Na stronie">
                    <select
                        value={size}
                        onChange={onSizeChange}
                        className={smallInputClassName}
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </FilterField>

                <div className="ml-auto flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={onReset}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500 hover:text-white
                        "
                    >
                        Wyczyść
                    </button>

                    <button
                        type="submit"
                        className="
                            rounded-lg bg-amber-500
                            px-5 py-2 text-sm font-semibold
                            text-zinc-950 transition-colors
                            hover:bg-amber-400
                        "
                    >
                        Zastosuj filtry
                    </button>
                </div>
            </div>
        </form>
    );
}

function UsersTable({
                        users,
                        currentUsername,
                        onRoleChange,
                        onLockChange,
                        onDelete,
                    }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-800">
                <thead className="bg-zinc-950/50">
                <tr>
                    <TableHeader>ID</TableHeader>
                    <TableHeader>Użytkownik</TableHeader>
                    <TableHeader>Rola</TableHeader>
                    <TableHeader>Status</TableHeader>
                    <TableHeader>Legendy</TableHeader>
                    <TableHeader>Rejestracja</TableHeader>
                    <TableHeader align="right">
                        Akcje
                    </TableHeader>
                </tr>
                </thead>

                <tbody className="divide-y divide-zinc-800">
                {users.map((user) => {
                    const isCurrentUser =
                        user.username === currentUsername;

                    return (
                        <tr
                            key={user.id}
                            className="transition-colors hover:bg-zinc-800/40"
                        >
                            <TableCell>
                                    <span className="text-zinc-500">
                                        #{user.id}
                                    </span>
                            </TableCell>

                            <TableCell>
                                <div className="max-w-xs">
                                    <div className="flex items-center gap-2">
                                        <p className="font-semibold text-white">
                                            {user.username}
                                        </p>

                                        {isCurrentUser && (
                                            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                                                    Twoje konto
                                                </span>
                                        )}
                                    </div>

                                    <p className="mt-1 truncate text-sm text-zinc-500">
                                        {user.email}
                                    </p>
                                </div>
                            </TableCell>

                            <TableCell>
                                <RoleSelect
                                    user={user}
                                    disabled={isCurrentUser}
                                    onChange={onRoleChange}
                                />
                            </TableCell>

                            <TableCell>
                                <AccountStatus user={user} />
                            </TableCell>

                            <TableCell>
                                    <span className="font-semibold text-zinc-200">
                                        {user.legendsCount}
                                    </span>
                            </TableCell>

                            <TableCell>
                                    <span className="whitespace-nowrap text-sm text-zinc-500">
                                        {formatDate(user.createdAt)}
                                    </span>
                            </TableCell>

                            <TableCell align="right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        type="button"
                                        disabled={isCurrentUser}
                                        onClick={() => onLockChange(user)}
                                        className={`
                rounded-lg border px-3 py-2
                text-xs font-semibold
                transition-colors
                disabled:cursor-not-allowed
                disabled:opacity-40
                ${
                                            user.locked
                                                ? `
                            border-emerald-500/30
                            text-emerald-300
                            hover:border-emerald-500
                            hover:bg-emerald-500/10
                        `
                                                : `
                            border-red-500/30
                            text-red-300
                            hover:border-red-500
                            hover:bg-red-500/10
                        `
                                        }
            `}
                                    >
                                        {user.locked
                                            ? "Odblokuj"
                                            : "Zablokuj"}
                                    </button>

                                    <button
                                        type="button"
                                        disabled={isCurrentUser}
                                        onClick={() => onDelete(user)}
                                        className="
                rounded-lg border border-red-600/40
                px-3 py-2 text-xs font-semibold
                text-red-300 transition-colors
                hover:border-red-500
                hover:bg-red-500/10
                disabled:cursor-not-allowed
                disabled:opacity-40
            "
                                    >
                                        Usuń
                                    </button>
                                </div>
                            </TableCell>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}

function RoleSelect({
                        user,
                        disabled,
                        onChange,
                    }) {
    return (
        <select
            value={user.role}
            disabled={disabled}
            onChange={(event) =>
                onChange(user, event.target.value)
            }
            className="
                rounded-lg border border-zinc-700
                bg-zinc-950 px-3 py-2 text-sm text-white
                outline-none transition-colors
                focus:border-amber-500
                disabled:cursor-not-allowed
                disabled:opacity-50
            "
        >
            <option value="USER">Użytkownik</option>
            <option value="ADMIN">Administrator</option>
        </select>
    );
}

function AccountStatus({ user }) {
    if (!user.enabled) {
        return (
            <StatusBadge variant="disabled">
                Wyłączone
            </StatusBadge>
        );
    }

    if (user.locked) {
        return (
            <StatusBadge variant="locked">
                Zablokowane
            </StatusBadge>
        );
    }

    return (
        <StatusBadge variant="active">
            Aktywne
        </StatusBadge>
    );
}

function StatusBadge({
                         variant,
                         children,
                     }) {
    const variants = {
        active: "bg-emerald-500/10 text-emerald-300",
        locked: "bg-red-500/10 text-red-300",
        disabled: "bg-zinc-700/60 text-zinc-400",
    };

    return (
        <span
            className={`
                rounded-full px-2.5 py-1
                text-xs font-semibold
                ${variants[variant]}
            `}
        >
            {children}
        </span>
    );
}

function ConfirmUserActionDialog({
                                     action,
                                     processing,
                                     onCancel,
                                     onConfirm,
                                 }) {
    const isRoleAction = action.type === "role";

    const title = isRoleAction
        ? "Zmienić rolę użytkownika?"
        : action.locked
            ? "Zablokować konto?"
            : "Odblokować konto?";

    const description = isRoleAction
        ? `Rola użytkownika „${action.user.username}” zostanie zmieniona na ${
            action.newRole === "ADMIN"
                ? "Administrator"
                : "Użytkownik"
        }.`
        : action.locked
            ? `Użytkownik „${action.user.username}” utraci dostęp do chronionych funkcji aplikacji.`
            : `Użytkownik „${action.user.username}” ponownie uzyska dostęp do swojego konta.`;

    const dangerous =
        action.type === "lock" && action.locked;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
            role="dialog"
            aria-modal="true"
        >
            <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl">
                <p
                    className={
                        dangerous
                            ? "text-sm font-semibold text-red-400"
                            : "text-sm font-semibold text-amber-400"
                    }
                >
                    Operacja administracyjna
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                    {title}
                </h2>

                <p className="mt-4 leading-7 text-zinc-400">
                    {description}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={processing}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500
                            disabled:opacity-50
                        "
                    >
                        Anuluj
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={processing}
                        className={`
                            rounded-lg px-4 py-2
                            text-sm font-semibold
                            transition-colors
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            ${
                            dangerous
                                ? "bg-red-600 text-white hover:bg-red-500"
                                : "bg-amber-500 text-zinc-950 hover:bg-amber-400"
                        }
                        `}
                    >
                        {processing
                            ? "Zapisywanie..."
                            : "Potwierdź"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function DeleteUserDialog({
                              user,
                              contentAction,
                              deleting,
                              onContentActionChange,
                              onCancel,
                              onConfirm,
                          }) {
    const deleteAllContent =
        contentAction === "DELETE";

    return (
        <div
            className="
                fixed inset-0 z-50 flex items-center
                justify-center bg-black/80 p-4
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-title"
        >
            <div className="w-full max-w-lg rounded-xl border border-red-500/30 bg-zinc-900 p-6 shadow-2xl">
                <p className="text-sm font-semibold text-red-400">
                    Operacja nieodwracalna
                </p>

                <h2
                    id="delete-user-title"
                    className="mt-2 text-xl font-bold text-white"
                >
                    Usunąć użytkownika?
                </h2>

                <p className="mt-4 leading-7 text-zinc-400">
                    Konto użytkownika{" "}
                    <span className="font-semibold text-white">
                        „{user.username}”
                    </span>{" "}
                    zostanie trwale usunięte.
                </p>

                <div className="mt-6 space-y-3">
                    <label
                        className={`
                            flex cursor-pointer gap-3 rounded-xl
                            border p-4 transition-colors
                            ${
                            contentAction === "ANONYMIZE"
                                ? `
                                        border-amber-500
                                        bg-amber-500/10
                                    `
                                : `
                                        border-zinc-700
                                        bg-zinc-950/40
                                        hover:border-zinc-600
                                    `
                        }
                        `}
                    >
                        <input
                            type="radio"
                            name="contentAction"
                            value="ANONYMIZE"
                            checked={
                                contentAction === "ANONYMIZE"
                            }
                            onChange={(event) =>
                                onContentActionChange(
                                    event.target.value
                                )
                            }
                            disabled={deleting}
                            className="mt-1"
                        />

                        <span>
                            <span className="block font-semibold text-white">
                                Zachowaj legendy
                            </span>

                            <span className="mt-1 block text-sm leading-6 text-zinc-500">
                                Konto zostanie usunięte, ale legendy
                                pozostaną w aplikacji bez przypisanego
                                autora.
                            </span>
                        </span>
                    </label>

                    <label
                        className={`
                            flex cursor-pointer gap-3 rounded-xl
                            border p-4 transition-colors
                            ${
                            contentAction === "DELETE"
                                ? `
                                        border-red-500
                                        bg-red-500/10
                                    `
                                : `
                                        border-zinc-700
                                        bg-zinc-950/40
                                        hover:border-zinc-600
                                    `
                        }
                        `}
                    >
                        <input
                            type="radio"
                            name="contentAction"
                            value="DELETE"
                            checked={
                                contentAction === "DELETE"
                            }
                            onChange={(event) =>
                                onContentActionChange(
                                    event.target.value
                                )
                            }
                            disabled={deleting}
                            className="mt-1"
                        />

                        <span>
                            <span className="block font-semibold text-red-300">
                                Usuń konto wraz z legendami
                            </span>

                            <span className="mt-1 block text-sm leading-6 text-zinc-500">
                                Konto, wszystkie legendy użytkownika
                                oraz przypisane do nich obrazy zostaną
                                trwale usunięte.
                            </span>
                        </span>
                    </label>
                </div>

                {deleteAllContent && (
                    <div className="mt-5 rounded-lg border border-red-500/30 bg-red-950/30 p-4">
                        <p className="text-sm font-semibold text-red-300">
                            Uwaga
                        </p>

                        <p className="mt-1 text-sm leading-6 text-red-200/70">
                            Wybrano usunięcie całej zawartości
                            użytkownika. Tej operacji nie będzie można
                            cofnąć.
                        </p>
                    </div>
                )}

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={deleting}
                        className="
                            rounded-lg border border-zinc-700
                            px-4 py-2 text-sm font-semibold
                            text-zinc-300 transition-colors
                            hover:border-zinc-500
                            disabled:opacity-50
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
                            transition-colors hover:bg-red-500
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                        "
                    >
                        {deleting
                            ? "Usuwanie..."
                            : deleteAllContent
                                ? "Usuń konto i legendy"
                                : "Usuń konto"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function FilterField({
                         label,
                         children,
                     }) {
    return (
        <label className="block text-sm font-medium text-zinc-400">
            <span className="mb-2 block">
                {label}
            </span>

            {children}
        </label>
    );
}

function TableHeader({
                         children,
                         align = "left",
                     }) {
    return (
        <th
            className={`
                whitespace-nowrap px-5 py-3
                text-xs font-semibold uppercase
                tracking-wider text-zinc-500
                ${
                align === "right"
                    ? "text-right"
                    : "text-left"
            }
            `}
        >
            {children}
        </th>
    );
}

function TableCell({
                       children,
                       align = "left",
                   }) {
    return (
        <td
            className={`
                whitespace-nowrap px-5 py-4 text-sm
                ${
                align === "right"
                    ? "text-right"
                    : "text-left"
            }
            `}
        >
            {children}
        </td>
    );
}

function Pagination({
                        page,
                        totalPages,
                        first,
                        last,
                        onPageChange,
                    }) {
    if (totalPages === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-zinc-800 px-5 py-4">
            <p className="text-sm text-zinc-500">
                Strona{" "}
                <span className="font-semibold text-zinc-300">
                    {page + 1}
                </span>{" "}
                z{" "}
                <span className="font-semibold text-zinc-300">
                    {totalPages}
                </span>
            </p>

            <div className="flex gap-2">
                <button
                    type="button"
                    disabled={first}
                    onClick={() =>
                        onPageChange((currentPage) =>
                            Math.max(currentPage - 1, 0)
                        )
                    }
                    className={paginationButtonClassName}
                >
                    Poprzednia
                </button>

                <button
                    type="button"
                    disabled={last}
                    onClick={() =>
                        onPageChange((currentPage) =>
                            Math.min(
                                currentPage + 1,
                                totalPages - 1
                            )
                        )
                    }
                    className={paginationButtonClassName}
                >
                    Następna
                </button>
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

function TableLoading() {
    return (
        <div className="space-y-px">
            {[1, 2, 3, 4, 5].map((item) => (
                <div
                    key={item}
                    className="
                        h-20 animate-pulse
                        border-b border-zinc-800
                        bg-zinc-900
                    "
                />
            ))}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="px-6 py-16 text-center">
            <p className="font-semibold text-zinc-300">
                Nie znaleziono użytkowników
            </p>

            <p className="mt-2 text-sm text-zinc-500">
                Zmień kryteria wyszukiwania lub wyczyść filtry.
            </p>
        </div>
    );
}

function parseBooleanFilter(value) {
    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    return undefined;
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

const smallInputClassName = `
    min-w-36 rounded-lg border border-zinc-700
    bg-zinc-950 px-3 py-2 text-sm text-white
    outline-none transition-colors
    focus:border-amber-500
`;

const paginationButtonClassName = `
    rounded-lg border border-zinc-700
    px-4 py-2 text-sm font-semibold
    text-zinc-300 transition-colors
    hover:border-amber-500 hover:text-amber-400
    disabled:cursor-not-allowed
    disabled:border-zinc-800
    disabled:text-zinc-700
`;