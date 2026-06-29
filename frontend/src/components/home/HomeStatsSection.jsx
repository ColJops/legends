import { useEffect, useState } from "react";
import { getHomeStats } from "../../api/statsApi";

export default function HomeStatsSection() {

    const [stats, setStats] = useState({
        legendsCount: 0,
        regionsCount: 0,
        usersCount: 0,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await getHomeStats();
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        void loadStats();
    }, []);

    if(loading){

        return (
            <section className="mt-20">
                <p className="text-center text-zinc-500">
                    Ładowanie statystyk...
                </p>
            </section>
        );

    }

    return (

        <section className="mt-20">

            <div className="grid gap-6 md:grid-cols-3">

                <StatCard
                    icon="📖"
                    value={stats.legendsCount}
                    label="legend"
                />

                <StatCard
                    icon="🗺️"
                    value={stats.regionsCount}
                    label="Regionów"
                />

                <StatCard
                    icon="👥"
                    value={stats.usersCount}
                    label="Użytkowników"
                />

            </div>

        </section>

    );

}

function StatCard({icon,value,label}){

    return(

        <div className="rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">

            <div className="text-4xl">
                {icon}
            </div>

            <div className="mt-4 text-5xl font-bold text-violet-400">
                {value}
            </div>

            <div className="mt-2 text-zinc-400">
                {label}
            </div>

        </div>

    );

}