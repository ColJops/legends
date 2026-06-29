import useLegends from "../hooks/useLegends";
import LoadingScreen from "../components/LoadingScreen";
import HeroSection from "../components/home/HeroSection";
import LatestLegendsSection from "../components/home/LatestLegendsSection";
import AboutSection from "../components/home/AboutSection";
import HomeStatsSection from "../components/home/HomeStatsSection";

export default function HomePage() {
    const {
        legends,
        loading,
        setSelectedLegend,
    } = useLegends();


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

            <AboutSection />
        </>
    );
}