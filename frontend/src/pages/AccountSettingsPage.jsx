import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import {
    changeCurrentPassword,
    getAccountSettings,
    updateProfileVisibility,
} from "../services/authApi";

const INITIAL_PASSWORD_FORM = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

export default function AccountSettingsPage() {
    const [account, setAccount] = useState(null);
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [savingPassword, setSavingPassword] = useState(false);
    const [savingVisibility, setSavingVisibility] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const [accountError, setAccountError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [form, setForm] = useState(INITIAL_PASSWORD_FORM);

    const [publicProfile, setPublicProfile] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");

    useEffect(() => {
        let active = true;

        getAccountSettings()
            .then((data) => {
                if (!active) return;
                setAccount(data);
                setPublicProfile(Boolean(data.publicProfile));
                setAvatarUrl(data.avatarUrl || "");
            })
            .catch(() => {
                if (active) {
                    setAccountError("Nie udało się pobrać danych konta.");
                }
            })
            .finally(() => {
                if (active) setLoadingAccount(false);
            });

        return () => {
            active = false;
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("file", file);

        setUploadingAvatar(true);
        try {
            const response = await api.post("/uploads/legend-image", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setAvatarUrl(response.data.imageUrl || "");
            toast.success("Avatar został przesłany. Zapisz ustawienia profilu.");
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Nie udało się przesłać avatara."
            );
        } finally {
            setUploadingAvatar(false);
            event.target.value = "";
        }
    };

    const handleSaveVisibility = async (event) => {
        event.preventDefault();
        setSavingVisibility(true);

        try {
            const updated = await updateProfileVisibility({
                publicProfile,
                avatarUrl: avatarUrl.trim() === "" ? null : avatarUrl.trim(),
            });
            setAccount((prev) => ({
                ...prev,
                ...updated,
                publicProfile,
                avatarUrl: avatarUrl.trim() === "" ? null : avatarUrl.trim(),
            }));
            toast.success("Ustawienia widoczności profilu zostały zapisane.");
        } catch (error) {
            toast.error(
                error?.response?.data?.message ||
                "Nie udało się zapisać ustawień profilu."
            );
        } finally {
            setSavingVisibility(false);
        }
    };

    const handleSubmitPassword = async (event) => {
        event.preventDefault();
        setPasswordError("");

        if (form.newPassword !== form.confirmPassword) {
            setPasswordError("Nowe hasła nie są takie same.");
            return;
        }

        setSavingPassword(true);
        try {
            await changeCurrentPassword({
                currentPassword: form.currentPassword,
                newPassword: form.newPassword,
            });
            setForm(INITIAL_PASSWORD_FORM);
            toast.success("Hasło zostało zmienione.");
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                "Nie udało się zmienić hasła.";
            setPasswordError(message);
            toast.error(message);
        } finally {
            setSavingPassword(false);
        }
    };

    const createdAt = account?.createdAt
        ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" }).format(
            new Date(account.createdAt)
        )
        : "—";

    return (
        <section className="mx-auto max-w-3xl space-y-6 py-12">
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                        Konto
                    </p>
                    <h1 className="mt-2 text-3xl font-bold text-white">
                        Ustawienia konta
                    </h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        Sprawdź podstawowe dane, zarządzaj prywatnością profilu i
                        zmień hasło.
                    </p>
                </div>

                {account?.username && (
                    <Link
                        to={`/users/${account.username}`}
                        className="rounded-xl border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 transition hover:border-indigo-500 hover:text-white"
                    >
                        Zobacz swój profil publiczny
                    </Link>
                )}
            </header>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <h2 className="text-xl font-semibold text-white">Dane konta</h2>
                {loadingAccount ? (
                    <p className="mt-5 text-sm text-zinc-400">
                        Ładowanie danych konta...
                    </p>
                ) : accountError ? (
                    <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {accountError}
                    </div>
                ) : (
                    <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm text-zinc-400">
                                Nazwa użytkownika
                            </dt>
                            <dd className="mt-1 font-medium text-white">
                                {account.username}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-zinc-400">
                                Adres e-mail
                            </dt>
                            <dd className="mt-1 font-medium text-white">
                                {account.email}
                            </dd>
                            <p className="mt-1 text-xs text-zinc-500">
                                Zmiana adresu będzie dostępna wraz z ponowną
                                weryfikacją e-maila.
                            </p>
                        </div>
                        <div>
                            <dt className="text-sm text-zinc-400">Rola</dt>
                            <dd className="mt-1 font-medium text-white">
                                {account.role}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-zinc-400">
                                Konto utworzono
                            </dt>
                            <dd className="mt-1 font-medium text-white">
                                {createdAt}
                            </dd>
                        </div>
                    </dl>
                )}
            </section>

            {/* SEKCJA PRYWATNOŚCI I PROFILU PUBLICZNEGO */}
            {!loadingAccount && !accountError && (
                <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                    <h2 className="text-xl font-semibold text-white">
                        Prywatność i profil publiczny
                    </h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        Zdecyduj, jakie informacje widzą inni użytkownicy na
                        Twojej stronie autora.
                    </p>

                    <form
                        onSubmit={handleSaveVisibility}
                        className="mt-6 space-y-6"
                    >
                        <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 p-4 transition hover:border-indigo-500/40">
                            <div>
                                <span className="block font-semibold text-white">
                                    Profil publiczny
                                </span>
                                <span className="mt-1 block text-xs leading-5 text-zinc-400">
                                    Gdy włączone, inni widzą Twój avatar, nazwę
                                    użytkownika, staż, funkcję oraz aktywność. W
                                    przypadku profilu prywatnego widoczna jest
                                    tylko nazwa użytkownika i aktywność.
                                </span>
                            </div>

                            <input
                                type="checkbox"
                                checked={publicProfile}
                                onChange={(e) =>
                                    setPublicProfile(e.target.checked)
                                }
                                className="mt-1 h-5 w-5 accent-indigo-600"
                            />
                        </label>

                        <div>
                            <label className="mb-2 block text-sm text-zinc-300">
                                Avatar użytkownika (widoczny przy profilu
                                publicznym)
                            </label>

                            <div className="flex flex-wrap items-center gap-4">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Podgląd avatara"
                                        className="h-16 w-16 rounded-full border border-zinc-700 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/15 text-2xl font-bold text-indigo-300">
                                        {(account?.username || "U")
                                            .slice(0, 1)
                                            .toUpperCase()}
                                    </div>
                                )}

                                <div className="flex-1 space-y-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        disabled={uploadingAvatar}
                                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-indigo-500"
                                    />
                                    {avatarUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setAvatarUrl("")}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            Usuń avatar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={savingVisibility || uploadingAvatar}
                            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                        >
                            {savingVisibility
                                ? "Zapisywanie..."
                                : "Zapisz ustawienia profilu"}
                        </button>
                    </form>
                </section>
            )}

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <h2 className="text-xl font-semibold text-white">
                    Zmiana hasła
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Potwierdź obecne hasło, a następnie wpisz nowe.
                </p>

                {passwordError && (
                    <div
                        role="alert"
                        className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                    >
                        {passwordError}
                    </div>
                )}

                <form
                    onSubmit={handleSubmitPassword}
                    className="mt-5 space-y-4"
                >
                    <PasswordInput
                        label="Obecne hasło"
                        name="currentPassword"
                        value={form.currentPassword}
                        onChange={handleChange}
                        autoComplete="current-password"
                        minLength={1}
                    />
                    <PasswordInput
                        label="Nowe hasło"
                        name="newPassword"
                        value={form.newPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={8}
                    />
                    <PasswordInput
                        label="Powtórz nowe hasło"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        minLength={8}
                    />
                    <button
                        type="submit"
                        disabled={savingPassword}
                        className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    >
                        {savingPassword ? "Zapisywanie..." : "Zmień hasło"}
                    </button>
                </form>
            </section>
        </section>
    );
}

function PasswordInput({
                           label,
                           name,
                           value,
                           onChange,
                           autoComplete,
                           minLength,
                       }) {
    const id = `account-${name}`;
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm text-zinc-300">
                {label}
            </label>
            <input
                id={id}
                name={name}
                type="password"
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                minLength={minLength}
                maxLength={100}
                required
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
            />
        </div>
    );
}