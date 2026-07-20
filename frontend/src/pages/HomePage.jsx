import useLegends from "../hooks/useLegends";
import LoadingScreen from "../components/LoadingScreen";
import HeroSection from "../components/home/HeroSection";
import LatestLegendsSection from "../components/home/LatestLegendsSection";
import AboutSection from "../components/home/AboutSection";
import HomeStatsSection from "../components/home/HomeStatsSection";

import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function HomePage() {
    const {
        legends,
        loading,
        setSelectedLegend,
    } = useLegends();

    const { isAuthenticated } = useAuth();


    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            <HeroSection />
            <HomeStatsSection />

            <LatestLegendsSection
                legends={legends}
                onReadMore={setSelectedLegend}
            />

            {isAuthenticated ? (
                <Link
                    to="/legends"
                    className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:border-violet-500"
                >
                    Dodaj swoją legendę
                </Link>
            ) : (
                <Link
                    to="/login"
                    state={{ from: { pathname: "/legends" } }}
                    className="rounded-xl border border-zinc-700 px-6 py-3 font-semibold text-white transition hover:border-violet-500"
                >
                    Dodaj swoją legendę
                </Link>
            )}

            <AboutSection />
        </>
    );
}