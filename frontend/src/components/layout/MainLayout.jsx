import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white">
            <Navbar />

            <main className="mx-auto max-w-7xl px-6 py-8">
                <Outlet />
            </main>

            <Footer />
        </div>
    );
}