export default function AdminPlaceholderPage({
                                                 title,
                                                 description,
                                             }) {
    return (
        <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm font-medium text-amber-500">
                Legends v0.5
            </p>

            <h1 className="mt-2 text-3xl font-bold text-white">
                {title}
            </h1>

            <p className="mt-4 max-w-3xl leading-7 text-zinc-400">
                {description}
            </p>

            <div
                className="
                    mt-8 rounded-lg border border-dashed border-zinc-700
                    bg-zinc-950/50 p-8 text-center text-zinc-500
                "
            >
                Moduł zostanie zaimplementowany w kolejnych krokach.
            </div>
        </section>
    );
}