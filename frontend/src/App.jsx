import { RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AppRouter from "./router/AppRouter";

export default function App() {
    return (
        <>
            <Toaster position="top-right" />
            <RouterProvider router={AppRouter} />
        </>
    );
}