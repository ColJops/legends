import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { changeCurrentPassword, getAccountSettings } from "../services/authApi";

const INITIAL_PASSWORD_FORM = {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
};

export default function AccountSettingsPage() {
    const [account, setAccount] = useState(null);
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [savingPassword, setSavingPassword] = useState(false);
    const [accountError, setAccountError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [form, setForm] = useState(INITIAL_PASSWORD_FORM);

    useEffect(() => {
        let active = true;

        getAccountSettings()
            .then((data) => {
                if (active) setAccount(data);
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

    const handleSubmit = async (event) => {
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
            const message = error?.response?.data?.message
                || "Nie udało się zmienić hasła.";
            setPasswordError(message);
            toast.error(message);
        } finally {
            setSavingPassword(false);
        }
    };

    const createdAt = account?.createdAt
        ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "long" })
            .format(new Date(account.createdAt))
        : "—";

    return (
        <section className="mx-auto max-w-3xl space-y-6 py-12">
            <header>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
                    Konto
                </p>
                <h1 className="mt-2 text-3xl font-bold text-white">Ustawienia konta</h1>
                <p className="mt-2 text-sm text-zinc-400">
                    Sprawdź podstawowe dane i zmień hasło.
                </p>
            </header>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <h2 className="text-xl font-semibold text-white">Dane konta</h2>
                {loadingAccount ? (
                    <p className="mt-5 text-sm text-zinc-400">Ładowanie danych konta...</p>
                ) : accountError ? (
                    <div role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {accountError}
                    </div>
                ) : (
                    <dl className="mt-5 grid gap-5 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm text-zinc-400">Nazwa użytkownika</dt>
                            <dd className="mt-1 font-medium text-white">{account.username}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-zinc-400">Adres e-mail</dt>
                            <dd className="mt-1 font-medium text-white">{account.email}</dd>
                            <p className="mt-1 text-xs text-zinc-500">
                                Zmiana adresu będzie dostępna wraz z ponowną weryfikacją e-maila.
                            </p>
                        </div>
                        <div>
                            <dt className="text-sm text-zinc-400">Rola</dt>
                            <dd className="mt-1 font-medium text-white">{account.role}</dd>
                        </div>
                        <div>
                            <dt className="text-sm text-zinc-400">Konto utworzono</dt>
                            <dd className="mt-1 font-medium text-white">{createdAt}</dd>
                        </div>
                    </dl>
                )}
            </section>

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-xl sm:p-8">
                <h2 className="text-xl font-semibold text-white">Zmiana hasła</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    Potwierdź obecne hasło, a następnie wpisz nowe.
                </p>

                {passwordError && (
                    <div role="alert" className="mt-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {passwordError}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
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

function PasswordInput({ label, name, value, onChange, autoComplete, minLength }) {
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
