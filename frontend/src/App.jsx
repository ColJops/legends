import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router/AppRouter";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
    return (
        <AuthProvider>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    success: {
                        duration: 2500,
                    },
                    error: {
                        duration: 4000,
                    },
                }}
            />
            <RouterProvider router={AppRouter} />
        </AuthProvider>
    );
}