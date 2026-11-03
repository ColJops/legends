import { useState } from "react";
import { categories, regions, getRegionLabel } from "../data/legendOptions";
import { lookupPostalCode } from "../api/postalCodesApi";

export default function LegendForm({
                                       form,
                                       error,
                                       saving,
                                       uploading,
                                       onChange,
                                       onSubmit,
                                       onImageUpload,
                                       onLocationChange,
    allowDraft = false,
                                   }) {
    const [postalCode, setPostalCode] = useState("");
    const [lookupLoading, setLookupLoading] = useState(false);
    const [lookupError, setLookupError] = useState("");
    const [lookupMessage, setLookupMessage] = useState("");
    const [candidates, setCandidates] = useState([]);

    const handlePostalCodeLookup = async (event) => {
        event.preventDefault();
        const digits = postalCode.trim().replace("-", "");
        if (!/^\d{5}$/.test(digits)) {
            setLookupError("Wpisz kod pocztowy w formacie XX-XXX.");
            setLookupMessage("");
            setCandidates([]);
            return;
        }

        setLookupLoading(true);
        setLookupError("");
        setLookupMessage("");
        setCandidates([]);
        try {
            const response = await lookupPostalCode(`${digits.slice(0, 2)}-${digits.slice(2)}`);
            const found = response.candidates || [];
            if (found.length === 0) {
                setLookupError("Nie znaleziono miejscowości dla tego kodu. Możesz wpisać ją ręcznie.");
            } else if (found.length === 1) {
                onLocationChange(found[0]);
                setLookupMessage("Uzupełniono miejscowość i województwo. Możesz je poprawić ręcznie.");
            } else {
                setCandidates(found);
            }
        } catch {
            setLookupError("Nie udało się pobrać danych. Możesz wpisać miejscowość i województwo ręcznie.");
        } finally {
            setLookupLoading(false);
        }
    };

    const handleCandidateChange = (event) => {
        const selected = candidates[Number(event.target.value)];
        if (selected) {
            onLocationChange(selected);
            setCandidates([]);
            setLookupMessage("Uzupełniono miejscowość i województwo. Możesz je poprawić ręcznie.");
        }
    };

    return (
        <form
            onSubmit={onSubmit}
            className="mb-10 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-lg"
        >
            <h2 className="mb-6 text-2xl font-bold">Dodaj legendę</h2>

            {error && (
                <div className="mb-5 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
                <input
                    name="title"
                    value={form.title}
                    onChange={onChange}
                    placeholder="Tytuł"
                    maxLength={150}
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />

                <select
                    name="category"
                    value={form.category}
                    onChange={onChange}
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                >
                    <option value="">Wybierz kategorię</option>
                    {categories.map((category) => (
                        <option key={category.value} value={category.value}>
                            {category.label}
                        </option>
                    ))}
                </select>

                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-zinc-400" htmlFor="legend-postal-code">
                        Kod pocztowy — uzupełnij lokalizację
                    </label>
                    <div className="flex flex-wrap gap-3">
                        <input
                            id="legend-postal-code"
                            value={postalCode}
                            onChange={(event) => setPostalCode(event.target.value)}
                            placeholder="00-002"
                            inputMode="numeric"
                            autoComplete="postal-code"
                            maxLength={6}
                            className="min-w-40 flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                        />
                        <button
                            type="button"
                            onClick={handlePostalCodeLookup}
                            disabled={lookupLoading}
                            className="rounded-xl border border-indigo-500 px-5 py-3 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-500/10 disabled:cursor-wait disabled:opacity-60"
                        >
                            {lookupLoading ? "Szukam..." : "Uzupełnij miasto i województwo"}
                        </button>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500">
                        Dane: GUS TERYT, punkty adresowe PRG (GUGiK), kody pocztowe GeoNames — przez{" "}
                        <a href="https://teryt24.pl/usage-policy" target="_blank" rel="noreferrer" className="underline hover:text-zinc-300">
                            teryt24.pl
                        </a>.
                    </p>
                    {lookupError && <p role="alert" className="mt-2 text-sm text-amber-300">{lookupError}</p>}
                    {lookupMessage && <p role="status" className="mt-2 text-sm text-emerald-300">{lookupMessage}</p>}
                    {candidates.length > 1 && (
                        <label className="mt-3 block text-sm text-zinc-300">
                            Kod wskazuje kilka miejscowości — wybierz właściwą
                            <select
                                value=""
                                onChange={handleCandidateChange}
                                className="mt-2 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-indigo-500"
                            >
                                <option value="" disabled>Wybierz miejscowość</option>
                                {candidates.map((candidate, index) => (
                                    <option key={`${candidate.region}-${candidate.city}-${index}`} value={index}>
                                        {candidate.city} — {getRegionLabel(candidate.region)}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                </div>

                <select
                    name="region"
                    value={form.region}
                    onChange={onChange}
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                >
                    <option value="">Wybierz województwo</option>
                    {regions.map((region) => (
                        <option key={region.value} value={region.value}>
                            {region.label}
                        </option>
                    ))}
                </select>

                <input
                    name="city"
                    value={form.city}
                    onChange={onChange}
                    placeholder="Miejscowość"
                    maxLength={100}
                    required
                    className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500"
                />

                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm text-zinc-400">
                        Obrazek legendy
                    </label>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={onImageUpload}
                        className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white hover:file:bg-indigo-500"
                    />

                    {uploading && (
                        <p className="mt-2 text-sm text-indigo-300">
                            Wysyłanie obrazka...
                        </p>
                    )}

                    {form.imageUrl && (
                        <img
                            src={form.imageUrl}
                            alt="Podgląd"
                            className="mt-4 h-40 w-full rounded-xl object-cover"
                        />
                    )}
                </div>

                <textarea
                    name="content"
                    value={form.content}
                    onChange={onChange}
                    placeholder="Treść legendy"
                    maxLength={10000}
                    required
                    rows="5"
                    className="resize-none rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition focus:border-indigo-500 md:col-span-2"
                />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                {allowDraft && (
                    <button type="submit" name="status" value="DRAFT" disabled={saving}
                        className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold text-zinc-200 hover:border-indigo-500 disabled:opacity-60">
                        Zapisz szkic
                    </button>
                )}
                <button type="submit" name="status" value="PENDING" disabled={saving}
                    className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60">
                    {saving ? "Zapisywanie..." : allowDraft ? "Wyślij do moderacji" : "Dodaj legendę"}
                </button>
            </div>
        </form>
    );
}
