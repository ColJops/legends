export default function AboutSection() {
    const technologies = [
        "Java",
        "Spring Boot",
        "React",
        "JWT",
        "MySQL",
        "Flyway",
    ];

    return (
        <section
            id="about"
            className="mt-24 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-10"
        >
            <h2 className="text-3xl font-bold">
                📖 O projekcie
            </h2>

            <p className="mt-6 leading-8 text-zinc-300">
                Legends to projekt poświęcony polskim legendom, podaniom
                i lokalnym opowieściom. Naszym celem jest stworzenie miejsca,
                w którym tradycja spotyka się z nowoczesną technologią.
            </p>

            <p className="mt-4 leading-8 text-zinc-400">
                Aplikacja umożliwia odkrywanie, wyszukiwanie i dodawanie legend
                z różnych regionów Polski, tworząc społecznościową bazę wiedzy
                o naszym folklorze.
            </p>

            <p className="mt-4 leading-8 text-zinc-400">
                Projekt rozwijany jest jako nowoczesna aplikacja Full Stack
                oparta o Spring Boot i React.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
                {technologies.map((technology) => (
                    <span
                        key={technology}
                        className="rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-medium text-violet-300"
                    >
                        {technology}
                    </span>
                ))}
            </div>

            <blockquote className="mt-8 border-l-4 border-violet-500 pl-5 text-lg italic text-zinc-300">
                „Ocalić polskie legendy od zapomnienia i udostępnić je każdemu.”
            </blockquote>
        </section>
    );
}